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
        title: "Location Timeout",
        description: "Location request took too long to complete.",
        helpText: "• Check your internet connection\n• Try refreshing the page\n• Move to an area with better signal"
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
 * Get current position with improved error handling
 */
export const getCurrentPositionAsync = (
  options?: PositionOptions
): Promise<LocationCoordinates> => {
  return new Promise((resolve, reject) => {
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

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000, // 5 minutes
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        const errorDetails = getGeolocationErrorDetails(error);
        console.error('Geolocation error:', errorDetails);
        // Create a proper Error object with formatted message instead of passing raw GeolocationPositionError
        const formattedError = new Error(getGeolocationErrorMessage(error));
        formattedError.name = 'GeolocationError';
        (formattedError as any).details = errorDetails;
        (formattedError as any).originalError = error;
        reject(formattedError);
      },
      defaultOptions
    );
  });
};

/**
 * Watch position with improved error handling
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

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 60000, // 1 minute
    ...options,
  };

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      const errorDetails = getGeolocationErrorDetails(error);
      console.error('Geolocation watch error:', errorDetails);
      // Create a proper Error object with formatted message instead of passing raw GeolocationPositionError
      const formattedError = new Error(getGeolocationErrorMessage(error));
      formattedError.name = 'GeolocationError';
      (formattedError as any).details = errorDetails;
      (formattedError as any).originalError = error;
      onError(formattedError as any);
    },
    defaultOptions
  );
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
