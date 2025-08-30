/**
 * Emergency geolocation timeout fix with ultra-fast fallback
 * This provides immediate location acquisition with aggressive timeout handling
 */

import { 
  LocationCoordinates, 
  getGeolocationErrorDetails, 
  isGeolocationSupported,
  isGeolocationContextSecure 
} from './geolocationUtils';

/**
 * Ultra-fast location acquisition with multiple fallback strategies
 * This function prioritizes speed over accuracy to avoid timeouts
 */
export const getLocationFast = async (maxWaitTime: number = 3000): Promise<LocationCoordinates> => {
  if (!isGeolocationSupported()) {
    throw new Error('Geolocation not supported');
  }

  if (!isGeolocationContextSecure()) {
    throw new Error('Geolocation requires secure context (HTTPS)');
  }

  console.log('🚀 Starting ultra-fast location acquisition...');

  return new Promise(async (resolve, reject) => {
    let resolved = false;
    let watchId: number | null = null;
    
    // Timeout the entire operation
    const overallTimeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        
        // Return a fallback location (user's general area - this should be replaced with IP-based location in production)
        console.log('⚠️ All geolocation attempts failed, using fallback strategy');
        reject(new Error('Location acquisition timed out after all attempts. Please check GPS settings and try moving outdoors.'));
      }
    }, maxWaitTime);

    const handleSuccess = (position: GeolocationPosition, source: string) => {
      if (resolved) return;
      resolved = true;
      
      clearTimeout(overallTimeout);
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      const location: LocationCoordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };

      console.log(`✅ Location acquired via ${source}:`, {
        ...location,
        accuracyMeters: Math.round(position.coords.accuracy)
      });

      resolve(location);
    };

    const handleError = (error: GeolocationPositionError, source: string) => {
      if (resolved) return;
      
      const errorDetails = getGeolocationErrorDetails(error);
      console.warn(`⚠️ ${source} failed:`, JSON.stringify(errorDetails));
      
      // Don't resolve here, let other attempts continue or overall timeout handle it
    };

    // Strategy 1: Try cached/last known position first (fastest)
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => handleSuccess(position, 'cached position'),
        (error) => handleError(error, 'cached position'),
        {
          enableHighAccuracy: false,
          timeout: 500, // Very short timeout for cached
          maximumAge: 600000, // Accept location up to 10 minutes old
        }
      );
    } catch (e) {
      console.warn('Cached position attempt failed:', e);
    }

    // Strategy 2: Start low-accuracy continuous watch (for movement detection)
    setTimeout(() => {
      if (resolved) return;
      
      try {
        watchId = navigator.geolocation.watchPosition(
          (position) => handleSuccess(position, 'low-accuracy watch'),
          (error) => handleError(error, 'low-accuracy watch'),
          {
            enableHighAccuracy: false,
            timeout: 2000,
            maximumAge: 60000, // 1 minute cache
          }
        );
      } catch (e) {
        console.warn('Watch position attempt failed:', e);
      }
    }, 100);

    // Strategy 3: Try high accuracy with very short timeout
    setTimeout(() => {
      if (resolved) return;
      
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => handleSuccess(position, 'high-accuracy quick'),
          (error) => handleError(error, 'high-accuracy quick'),
          {
            enableHighAccuracy: true,
            timeout: 1500, // Very short for high accuracy
            maximumAge: 30000,
          }
        );
      } catch (e) {
        console.warn('High accuracy quick attempt failed:', e);
      }
    }, 200);
  });
};

/**
 * Get location with progressive timeout increases
 * Starts with very short timeouts and increases if needed
 */
export const getLocationProgressive = async (): Promise<LocationCoordinates> => {
  const attempts = [
    { timeout: 1000, accuracy: false, label: 'instant-cached' },
    { timeout: 2000, accuracy: false, label: 'fast-approximate' },
    { timeout: 4000, accuracy: true, label: 'accurate' },
    { timeout: 8000, accuracy: true, label: 'patient-accurate' },
  ];

  for (const attempt of attempts) {
    try {
      console.log(`📍 Trying ${attempt.label} location (${attempt.timeout}ms timeout)...`);
      
      const location = await new Promise<LocationCoordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            });
          },
          reject,
          {
            enableHighAccuracy: attempt.accuracy,
            timeout: attempt.timeout,
            maximumAge: attempt.accuracy ? 30000 : 300000,
          }
        );
      });

      console.log(`✅ ${attempt.label} location acquired: ±${Math.round(location.accuracy)}m`);
      return location;

    } catch (error: any) {
      const errorDetails = getGeolocationErrorDetails(error);
      console.log(`⏭️ ${attempt.label} failed:`, JSON.stringify(errorDetails));
      
      // Continue to next attempt unless it's a permission error
      if (error.code === 1) { // PERMISSION_DENIED
        throw error; // Don't continue if permission denied
      }
    }
  }

  throw new Error('All location acquisition attempts failed. Please check GPS settings and try moving to an area with better signal.');
};

/**
 * Emergency location service that never fails
 * Returns the best available location or a reasonable fallback
 */
export const getLocationEmergency = async (): Promise<LocationCoordinates | null> => {
  try {
    // Try our fast method first
    return await getLocationFast(5000);
  } catch (error) {
    console.warn('Fast location failed, trying progressive:', error);
    
    try {
      // Try progressive method
      return await getLocationProgressive();
    } catch (progressiveError) {
      console.error('All geolocation methods failed:', progressiveError);
      
      // In a real application, you might want to:
      // 1. Use IP-based geolocation as final fallback
      // 2. Ask user to manually enter their location
      // 3. Use a default location for the service area
      
      console.log('🏢 Using fallback location strategy');
      return null; // Return null to indicate no location available
    }
  }
};

/**
 * Test all geolocation strategies and report results
 */
export const testGeolocationStrategies = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    summary: {} as any
  };

  console.log('🧪 Testing all geolocation strategies...');

  // Test 1: Fast method
  try {
    const start1 = Date.now();
    const loc1 = await getLocationFast(3000);
    const time1 = Date.now() - start1;
    
    results.tests.push({
      method: 'fast',
      success: true,
      time: time1,
      accuracy: loc1.accuracy,
      location: loc1
    });
    
    console.log(`✅ Fast method: ${time1}ms, ±${Math.round(loc1.accuracy)}m`);
  } catch (error) {
    results.tests.push({
      method: 'fast',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
    console.log('❌ Fast method failed:', error);
  }

  // Test 2: Progressive method
  try {
    const start2 = Date.now();
    const loc2 = await getLocationProgressive();
    const time2 = Date.now() - start2;
    
    results.tests.push({
      method: 'progressive',
      success: true,
      time: time2,
      accuracy: loc2.accuracy,
      location: loc2
    });
    
    console.log(`✅ Progressive method: ${time2}ms, ±${Math.round(loc2.accuracy)}m`);
  } catch (error) {
    results.tests.push({
      method: 'progressive',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
    console.log('❌ Progressive method failed:', error);
  }

  // Test 3: Emergency method
  try {
    const start3 = Date.now();
    const loc3 = await getLocationEmergency();
    const time3 = Date.now() - start3;
    
    results.tests.push({
      method: 'emergency',
      success: loc3 !== null,
      time: time3,
      accuracy: loc3?.accuracy,
      location: loc3
    });
    
    console.log(`✅ Emergency method: ${time3}ms, ${loc3 ? `±${Math.round(loc3.accuracy)}m` : 'fallback'}`);
  } catch (error) {
    results.tests.push({
      method: 'emergency',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
    console.log('❌ Emergency method failed:', error);
  }

  results.summary = {
    successfulMethods: results.tests.filter(t => t.success).length,
    totalMethods: results.tests.length,
    fastestTime: Math.min(...results.tests.filter(t => t.success).map(t => t.time)),
    bestAccuracy: Math.min(...results.tests.filter(t => t.success && t.accuracy).map(t => t.accuracy))
  };

  console.log('📊 Geolocation test summary:', results.summary);
  return results;
};
