/**
 * Quick location fix utility to immediately resolve timeout issues
 * This provides an instant workaround for the geolocation timeout error
 */

import { toast } from '@/hooks/use-toast';

export interface QuickLocation {
  lat: number;
  lng: number;
  accuracy: number;
  method: string;
  timestamp: number;
}

/**
 * Get location immediately with no timeouts
 * Uses cached location or very fast acquisition
 */
export const getLocationInstant = (): Promise<QuickLocation> => {
  return new Promise((resolve, reject) => {
    console.log('🚀 Getting instant location...');

    // Try cached location first
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: QuickLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            method: 'cached',
            timestamp: Date.now()
          };
          
          console.log('✅ Instant location from cache:', location);
          resolve(location);
        },
        (error) => {
          console.warn('Cached location failed:', error);
          reject(new Error(`Quick location failed: ${error.message}`));
        },
        {
          enableHighAccuracy: false,
          timeout: 500, // Very short timeout
          maximumAge: 600000, // Accept 10-minute-old location
        }
      );
    } else {
      reject(new Error('Geolocation not supported'));
    }
  });
};

/**
 * Test the current geolocation timeout issue
 */
export const testTimeoutIssue = async () => {
  console.log('🧪 Testing geolocation timeout issue...');
  
  try {
    // This should reproduce the timeout error if it exists
    const result = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 3000, // Short timeout to trigger the issue
          maximumAge: 0, // Force fresh location
        }
      );
    });
    
    console.log('✅ No timeout issue detected:', {
      lat: result.coords.latitude,
      lng: result.coords.longitude,
      accuracy: result.coords.accuracy
    });
    
    return {
      success: true,
      location: {
        lat: result.coords.latitude,
        lng: result.coords.longitude,
        accuracy: result.coords.accuracy
      },
      message: 'GPS working normally'
    };
    
  } catch (error: any) {
    console.error('🐛 Timeout issue confirmed:', error);
    
    const errorInfo = {
      code: error.code,
      message: error.message,
      type: error.code === 3 ? 'TIMEOUT' : error.code === 1 ? 'PERMISSION_DENIED' : 'OTHER'
    };
    
    return {
      success: false,
      error: errorInfo,
      message: `GPS failed: ${errorInfo.type} - ${errorInfo.message}`
    };
  }
};

/**
 * Apply emergency location fix
 */
export const applyEmergencyLocationFix = async () => {
  console.log('🆘 Applying emergency location fix...');
  
  // Test current issue
  const testResult = await testTimeoutIssue();
  
  if (testResult.success) {
    return {
      success: true,
      message: 'No location issues detected. GPS is working normally.',
      location: testResult.location
    };
  }
  
  // If there's a timeout issue, try instant location
  try {
    const quickLocation = await getLocationInstant();
    
    return {
      success: true,
      message: `Emergency fix applied. Got cached location: ±${Math.round(quickLocation.accuracy)}m`,
      location: quickLocation,
      method: 'emergency_cache'
    };
    
  } catch (quickError) {
    console.error('Emergency location also failed:', quickError);
    
    return {
      success: false,
      message: 'Emergency location fix failed. GPS may be completely unavailable.',
      error: quickError instanceof Error ? quickError.message : String(quickError),
      recommendation: 'Try enabling location services, moving outdoors, or refreshing the page.'
    };
  }
};

/**
 * Show location fix status to user
 */
export const showLocationFixStatus = async () => {
  try {
    const result = await applyEmergencyLocationFix();
    
    if (result.success) {
      toast({
        title: "✅ Location Fixed",
        description: result.message,
        duration: 5000,
      });
      
      return result.location;
    } else {
      toast({
        title: "❌ Location Fix Failed",
        description: result.message,
        variant: "destructive",
        duration: 8000,
      });
      
      // Show recommendation
      if (result.recommendation) {
        setTimeout(() => {
          toast({
            title: "💡 Recommendation",
            description: result.recommendation,
            duration: 10000,
          });
        }, 2000);
      }
      
      return null;
    }
    
  } catch (error) {
    console.error('Location fix status failed:', error);
    
    toast({
      title: "❌ Location System Error",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive",
      duration: 6000,
    });
    
    return null;
  }
};

/**
 * Global function for emergency location fix (can be called from console)
 */
export const emergencyGPSFix = async () => {
  console.log('🚑 Emergency GPS Fix activated!');
  const result = await showLocationFixStatus();
  
  if (result) {
    console.log('✅ Emergency GPS fix successful:', result);
    // Store in global for debugging
    (window as any).lastEmergencyLocation = result;
  } else {
    console.log('❌ Emergency GPS fix failed');
  }
  
  return result;
};

// Make emergency fix available globally for console access
if (typeof window !== 'undefined') {
  (window as any).emergencyGPSFix = emergencyGPSFix;
  (window as any).testTimeoutIssue = testTimeoutIssue;
  (window as any).showLocationFixStatus = showLocationFixStatus;
}
