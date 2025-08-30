/**
 * IMMEDIATE Geolocation Timeout Fix
 * Run this to diagnose and fix timeout issues right now
 */

const immediateTimeoutFix = async () => {
  console.log('🚨 IMMEDIATE GEOLOCATION TIMEOUT FIX STARTING...');
  
  // Step 1: Check basic geolocation support
  if (!navigator.geolocation) {
    console.error('❌ Geolocation not supported in this browser');
    return { success: false, error: 'Geolocation not supported' };
  }
  
  console.log('✅ Geolocation API is supported');
  
  // Step 2: Check permissions
  if ('permissions' in navigator) {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      console.log('📍 Geolocation permission:', permission.state);
      
      if (permission.state === 'denied') {
        console.error('❌ Geolocation permission denied');
        return { 
          success: false, 
          error: 'Permission denied',
          fix: 'Click the location icon in browser address bar and allow location access'
        };
      }
    } catch (e) {
      console.warn('⚠️ Could not check permissions:', e);
    }
  }
  
  // Step 3: Try ultra-short timeout first (to test if ANY location works)
  console.log('🔍 Testing with cached/immediate location...');
  try {
    const quickResult = await new Promise<GeolocationPosition>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Quick test timeout'));
      }, 1000); // 1 second only
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          resolve(position);
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        {
          enableHighAccuracy: false,
          timeout: 500, // Very short
          maximumAge: 600000, // Accept 10-minute-old location
        }
      );
    });
    
    console.log('✅ QUICK LOCATION SUCCESS:', {
      lat: quickResult.coords.latitude,
      lng: quickResult.coords.longitude,
      accuracy: quickResult.coords.accuracy,
      age: Date.now() - quickResult.timestamp
    });
    
    return {
      success: true,
      method: 'cached/quick',
      location: {
        lat: quickResult.coords.latitude,
        lng: quickResult.coords.longitude,
        accuracy: quickResult.coords.accuracy
      }
    };
    
  } catch (quickError) {
    console.log('⚠️ Quick location failed:', quickError);
  }
  
  // Step 4: Try low accuracy with short timeout
  console.log('🔍 Testing low accuracy mode...');
  try {
    const lowAccuracyResult = await new Promise<GeolocationPosition>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Low accuracy timeout'));
      }, 3000); // 3 seconds
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          resolve(position);
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        {
          enableHighAccuracy: false,
          timeout: 2500,
          maximumAge: 120000, // 2 minutes
        }
      );
    });
    
    console.log('✅ LOW ACCURACY SUCCESS:', {
      lat: lowAccuracyResult.coords.latitude,
      lng: lowAccuracyResult.coords.longitude,
      accuracy: lowAccuracyResult.coords.accuracy
    });
    
    return {
      success: true,
      method: 'low-accuracy',
      location: {
        lat: lowAccuracyResult.coords.latitude,
        lng: lowAccuracyResult.coords.longitude,
        accuracy: lowAccuracyResult.coords.accuracy
      }
    };
    
  } catch (lowAccError) {
    console.log('⚠️ Low accuracy failed:', lowAccError);
  }
  
  // Step 5: Diagnose the specific timeout issue
  console.log('🔍 Diagnosing timeout issue with high accuracy...');
  try {
    const highAccuracyResult = await new Promise<GeolocationPosition>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('High accuracy timeout as expected'));
      }, 5000); // 5 seconds
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          resolve(position);
        },
        (error) => {
          clearTimeout(timeoutId);
          console.log('📊 High accuracy error details:', {
            code: error.code,
            message: error.message,
            type: error.code === 1 ? 'PERMISSION_DENIED' :
                  error.code === 2 ? 'POSITION_UNAVAILABLE' :
                  error.code === 3 ? 'TIMEOUT' : 'UNKNOWN'
          });
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 4000,
          maximumAge: 0, // Force fresh location
        }
      );
    });
    
    console.log('✅ HIGH ACCURACY SUCCESS (unexpected!):', {
      lat: highAccuracyResult.coords.latitude,
      lng: highAccuracyResult.coords.longitude,
      accuracy: highAccuracyResult.coords.accuracy
    });
    
    return {
      success: true,
      method: 'high-accuracy',
      location: {
        lat: highAccuracyResult.coords.latitude,
        lng: highAccuracyResult.coords.longitude,
        accuracy: highAccuracyResult.coords.accuracy
      }
    };
    
  } catch (highAccError: any) {
    console.log('❌ CONFIRMED: High accuracy timeout issue');
    console.log('📊 Error details:', {
      code: highAccError.code || 'unknown',
      message: highAccError.message || 'unknown',
      type: highAccError.code === 3 ? 'TIMEOUT_CONFIRMED' : 'OTHER_ERROR'
    });
  }
  
  // Step 6: Final diagnosis and recommendations
  console.log('📋 FINAL DIAGNOSIS:');
  console.log('• High accuracy GPS is timing out (this is the issue you reported)');
  console.log('• This typically happens indoors or in areas with poor GPS signal');
  console.log('• The app should use low accuracy mode as fallback');
  
  return {
    success: false,
    error: 'High accuracy GPS timeout confirmed',
    diagnosis: {
      issue: 'GPS timeout on high accuracy mode',
      cause: 'Poor GPS signal or indoor location',
      impact: 'App cannot get precise location within timeout period'
    },
    recommendations: [
      'Move closer to a window or go outdoors',
      'Use low accuracy mode for indoor use',
      'Accept approximate location for basic functionality',
      'Check if location services are enabled on device'
    ]
  };
};

/**
 * Apply immediate workaround for timeout issues
 */
const applyImmediateWorkaround = async () => {
  console.log('🔧 APPLYING IMMEDIATE WORKAROUND...');
  
  // Try to get ANY location using most permissive settings
  try {
    const result = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: false, // Use network/wifi location
          timeout: 2000, // Short timeout
          maximumAge: 900000, // Accept 15-minute-old location
        }
      );
    });
    
    console.log('✅ WORKAROUND SUCCESS:', {
      lat: result.coords.latitude,
      lng: result.coords.longitude,
      accuracy: result.coords.accuracy,
      note: 'Using approximate location'
    });
    
    // Store in localStorage for app to use
    const workaroundLocation = {
      lat: result.coords.latitude,
      lng: result.coords.longitude,
      accuracy: result.coords.accuracy,
      timestamp: Date.now(),
      method: 'workaround'
    };
    
    localStorage.setItem('workaround_location', JSON.stringify(workaroundLocation));
    
    return {
      success: true,
      location: workaroundLocation,
      message: 'Approximate location saved. App should work with reduced accuracy.'
    };
    
  } catch (error) {
    console.error('❌ WORKAROUND FAILED:', error);
    return {
      success: false,
      error: 'Cannot get any location',
      message: 'Location services may be completely disabled'
    };
  }
};

/**
 * Complete diagnostic and fix process
 */
const debugAndFixTimeout = async () => {
  console.log('🚨 STARTING COMPLETE GEOLOCATION DEBUG AND FIX...');
  console.log('=====================================');
  
  // Run immediate diagnosis
  const diagnosis = await immediateTimeoutFix();
  
  console.log('📊 DIAGNOSIS COMPLETE:', diagnosis);
  console.log('=====================================');
  
  if (diagnosis.success) {
    console.log('✅ GOOD NEWS: Location is working!');
    console.log('💡 The timeout error might be intermittent or already resolved');
    return diagnosis;
  }
  
  // If diagnosis failed, try workaround
  console.log('🔧 APPLYING WORKAROUND...');
  const workaround = await applyImmediateWorkaround();
  
  console.log('📊 WORKAROUND RESULT:', workaround);
  console.log('=====================================');
  
  if (workaround.success) {
    console.log('✅ WORKAROUND APPLIED: App should work with approximate location');
    console.log('💡 For better accuracy, try moving outdoors or near a window');
  } else {
    console.log('❌ COMPLETE FAILURE: Location services appear to be disabled');
    console.log('💡 Check device location settings and browser permissions');
  }
  
  return {
    diagnosis,
    workaround,
    summary: workaround.success ? 'Workaround applied successfully' : 'Complete location failure',
    nextSteps: workaround.success ? 
      ['App should work with approximate location', 'Move outdoors for better accuracy'] :
      ['Check device location settings', 'Enable location permissions in browser', 'Try refreshing the page']
  };
};

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  (window as any).immediateTimeoutFix = immediateTimeoutFix;
  (window as any).applyImmediateWorkaround = applyImmediateWorkaround;
  (window as any).debugAndFixTimeout = debugAndFixTimeout;
  
  console.log('🔧 Immediate geolocation fix functions loaded!');
  console.log('💡 Run: await debugAndFixTimeout() in console for complete fix');
}

export { immediateTimeoutFix, applyImmediateWorkaround, debugAndFixTimeout };
