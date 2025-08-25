/**
 * Geolocation utility functions for consistent error handling across the application
 */

export interface GeolocationError {
  code: number;
  message: string;
  type: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN';
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

/**
 * Get a readable error message from GeolocationPositionError
 */
export const getGeolocationErrorDetails = (error: GeolocationPositionError): GeolocationError => {
  const errorTypes = {
    1: 'PERMISSION_DENIED' as const,
    2: 'POSITION_UNAVAILABLE' as const,
    3: 'TIMEOUT' as const,
  };

  return {
    code: error.code,
    message: error.message || 'Unknown geolocation error',
    type: errorTypes[error.code as keyof typeof errorTypes] || 'UNKNOWN',
  };
};

/**
 * Get user-friendly error message for geolocation errors
 */
export const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
  switch (error.code) {
    case 1: // PERMISSION_DENIED
      return "Location permission denied. Please enable location access in your browser settings.";
    case 2: // POSITION_UNAVAILABLE
      return "Location information is currently unavailable. Please check your GPS settings.";
    case 3: // TIMEOUT
      return "Location request timed out. Please try again.";
    default:
      return error.message || "An unknown location error occurred.";
  }
};

/**
 * Get detailed error information with troubleshooting tips
 */
export const getGeolocationErrorHelp = (error: GeolocationPositionError): {
  title: string;
  description: string;
  helpText?: string;
} => {
  switch (error.code) {
    case 1: // PERMISSION_DENIED
      return {
        title: "Location Permission Denied",
        description: "Please enable location permissions for this website.",
        helpText: "Chrome/Edge: Click 🔒 in address bar → Site settings → Location → Allow\nFirefox: Click 🛡️ → Permissions → Location → Allow"
      };
    case 2: // POSITION_UNAVAILABLE
      return {
        title: "Location Unavailable",
        description: "Your location information is currently unavailable.",
        helpText: "• Check that GPS/Location services are enabled on your device\n• Try moving to an area with better signal\n• Restart your browser"
      };
    case 3: // TIMEOUT
      return {
        title: "GPS Timeout",
        description: "Location request took too long. This often happens indoors or with poor GPS signal.",
        helpText: "• Move closer to a window or go outdoors for better GPS signal\n• The app will automatically retry with lower accuracy\n• For indoor use, approximate location may still work\n• Check that location services are enabled on your device"
      };
    default:
      return {
        title: "Location Error",
        description: error.message || "An unknown location error occurred.",
      };
  }
};

/**
 * Check if geolocation is supported by the browser
 */
export const isGeolocationSupported = (): boolean => {
  return 'geolocation' in navigator;
};

/**
 * Check if the current context supports geolocation (HTTPS required)
 */
export const isGeolocationContextSecure = (): boolean => {
  return location.protocol === 'https:' || location.hostname === 'localhost';
};

/**
 * Get current position with improved error handling and fallback strategies
 */
export const getCurrentPositionAsync = (
  options?: PositionOptions
): Promise<LocationCoordinates> => {
  return new Promise(async (resolve, reject) => {
    if (!isGeolocationSupported()) {
      const error = new Error('Geolocation is not supported by this browser');
      error.name = 'GeolocationError';
      reject(error);
      return;
    }

    if (!isGeolocationContextSecure()) {
      const error = new Error('Geolocation requires HTTPS or localhost');
      error.name = 'GeolocationError';
      reject(error);
      return;
    }

    // Try high accuracy first with shorter timeout
    const highAccuracyOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 8000, // Reduced from 15s to 8s
      maximumAge: 60000, // 1 minute
      ...options,
    };

    // Fallback options with lower accuracy but faster response
    const fallbackOptions: PositionOptions = {
      enableHighAccuracy: false,
      timeout: 5000, // Even shorter timeout for fallback
      maximumAge: 300000, // 5 minutes for cached location
      ...options,
    };

    const tryGetPosition = (positionOptions: PositionOptions, isFallback = false): Promise<LocationCoordinates> => {
      return new Promise((resolvePos, rejectPos) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            };

            if (isFallback) {
              console.log('📍 Location acquired using fallback (lower accuracy):', {
                ...location,
                accuracyMeters: Math.round(position.coords.accuracy)
              });
            }

            resolvePos(location);
          },
          (error) => {
            const errorDetails = getGeolocationErrorDetails(error);
            console.error(`Geolocation error ${isFallback ? '(fallback)' : '(high accuracy)'}:`, JSON.stringify(errorDetails));

            const formattedError = new Error(getGeolocationErrorMessage(error));
            formattedError.name = 'GeolocationError';
            (formattedError as any).details = errorDetails;
            (formattedError as any).originalError = error;
            (formattedError as any).isFallback = isFallback;
            rejectPos(formattedError);
          },
          positionOptions
        );
      });
    };

    try {
      // First attempt with high accuracy
      const position = await tryGetPosition(highAccuracyOptions, false);
      resolve(position);
    } catch (firstError: any) {
      // If high accuracy fails with timeout, try fallback
      if (firstError.originalError?.code === 3) { // TIMEOUT
        console.log('🔄 High accuracy GPS timed out, trying fallback with lower accuracy...');
        try {
          const fallbackPosition = await tryGetPosition(fallbackOptions, true);
          resolve(fallbackPosition);
        } catch (fallbackError) {
          // If fallback also fails, reject with the fallback error
          reject(fallbackError);
        }
      } else {
        // For non-timeout errors, don't try fallback
        reject(firstError);
      }
    }
  });
};

/**
 * Watch position with improved error handling and adaptive timeout
 */
export const watchPositionAsync = (
  onSuccess: (position: LocationCoordinates) => void,
  onError: (error: GeolocationPositionError) => void,
  options?: PositionOptions
): number | null => {
  if (!isGeolocationSupported()) {
    const error = new Error('Geolocation is not supported by this browser');
    error.name = 'GeolocationError';
    onError(error as any);
    return null;
  }

  if (!isGeolocationContextSecure()) {
    const error = new Error('Geolocation requires HTTPS or localhost');
    error.name = 'GeolocationError';
    onError(error as any);
    return null;
  }

  let timeoutCount = 0;
  let currentWatchId: number | null = null;
  let isUsingFallback = false;

  const startWatch = (useHighAccuracy: boolean) => {
    const watchOptions: PositionOptions = {
      enableHighAccuracy: useHighAccuracy,
      timeout: useHighAccuracy ? 10000 : 6000, // Shorter timeouts
      maximumAge: useHighAccuracy ? 30000 : 120000, // Different cache times
      ...options,
    };

    console.log(`📍 Starting location watch with ${useHighAccuracy ? 'high' : 'low'} accuracy (timeout: ${watchOptions.timeout}ms)`);

    return navigator.geolocation.watchPosition(
      (position) => {
        timeoutCount = 0; // Reset timeout counter on success

        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        if (!isUsingFallback && !useHighAccuracy) {
          console.log('📍 Location acquired using adaptive fallback mode');
        }

        onSuccess(location);
      },
      (error) => {
        const errorDetails = getGeolocationErrorDetails(error);
        console.error(`Geolocation watch error (${useHighAccuracy ? 'high' : 'low'} accuracy):`, JSON.stringify(errorDetails));

        // Handle timeout errors with adaptive fallback
        if (error.code === 3) { // TIMEOUT
          timeoutCount++;

          if (useHighAccuracy && timeoutCount < 3) {
            console.log(`🔄 GPS timeout ${timeoutCount}/3, switching to low accuracy mode...`);

            // Clear current watch and start with lower accuracy
            if (currentWatchId !== null) {
              navigator.geolocation.clearWatch(currentWatchId);
            }

            isUsingFallback = true;
            currentWatchId = startWatch(false);
            return; // Don't call onError yet, trying fallback
          } else if (!useHighAccuracy && timeoutCount >= 2) {
            console.log('⚠️ Multiple timeouts even with low accuracy, pausing location tracking...');
            // After multiple timeouts even with low accuracy, take a longer break
            setTimeout(() => {
              console.log('🔄 Resuming location tracking after timeout break...');
              timeoutCount = 0;
              if (currentWatchId !== null) {
                navigator.geolocation.clearWatch(currentWatchId);
              }
              currentWatchId = startWatch(false); // Resume with low accuracy
            }, 30000); // 30 second break
          }
        }

        // Create formatted error
        const formattedError = new Error(getGeolocationErrorMessage(error));
        formattedError.name = 'GeolocationError';
        (formattedError as any).details = errorDetails;
        (formattedError as any).originalError = error;
        (formattedError as any).timeoutCount = timeoutCount;
        (formattedError as any).isUsingFallback = isUsingFallback;
        onError(formattedError as any);
      },
      watchOptions
    );
  };

  // Start with high accuracy
  currentWatchId = startWatch(true);
  return currentWatchId;
};

/**
 * Clear position watch
 */
export const clearWatch = (watchId: number): void => {
  navigator.geolocation.clearWatch(watchId);
};

/**
 * Calculate distance between two points in meters
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Format distance in a human-readable way
 */
export const formatDistance = (distanceInMeters: number): string => {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)}m`;
  } else {
    return `${(distanceInMeters / 1000).toFixed(1)}km`;
  }
};
