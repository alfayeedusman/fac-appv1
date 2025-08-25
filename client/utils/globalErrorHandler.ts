/**
 * Global error handler to catch and format any remaining "[object Object]" errors
 */

import { formatError } from '../lib/errorUtils';
import { getGeolocationErrorDetails, getGeolocationErrorMessage } from './geolocationUtils';

/**
 * Enhanced error formatter that specifically handles GeolocationPositionError
 */
export const formatAnyError = (error: unknown): string => {
  // Handle GeolocationPositionError specifically
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    try {
      return getGeolocationErrorMessage(error as GeolocationPositionError);
    } catch {
      // Fallback if geolocation utilities fail
      const geoError = error as GeolocationPositionError;
      switch (geoError.code) {
        case 1:
          return "Location permission denied. Please enable location access in your browser.";
        case 2:
          return "Location information is currently unavailable.";
        case 3:
          return "Location request timed out. Please try again.";
        default:
          return geoError.message || "Location error occurred.";
      }
    }
  }
  
  // Use existing formatError for other types
  return formatError(error);
};

/**
 * Override console methods to catch any "[object Object]" errors
 */
export const setupGlobalErrorCatching = () => {
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  
  // Override console.error
  console.error = (...args: any[]) => {
    const formattedArgs = args.map(arg => {
      if (typeof arg === 'string' && arg.includes('[object Object]')) {
        return arg.replace(/\[object Object\]/g, 'Error details available in next log entry');
      }
      // Format objects to prevent "[object Object]" when logs are serialized
      if (typeof arg === 'object' && arg !== null && arg.constructor === Object) {
        return formatAnyError(arg);
      }
      return arg;
    });
    originalError.apply(console, formattedArgs);
  };
  
  // Override console.warn
  console.warn = (...args: any[]) => {
    const formattedArgs = args.map(arg => {
      if (typeof arg === 'string' && arg.includes('[object Object]')) {
        return arg.replace(/\[object Object\]/g, 'Error details available in next log entry');
      }
      // Format objects to prevent "[object Object]" when logs are serialized
      if (typeof arg === 'object' && arg !== null && arg.constructor === Object) {
        return formatAnyError(arg);
      }
      return arg;
    });
    originalWarn.apply(console, formattedArgs);
  };
  
  // Override console.log
  console.log = (...args: any[]) => {
    const formattedArgs = args.map(arg => {
      if (typeof arg === 'string' && arg.includes('[object Object]')) {
        return arg.replace(/\[object Object\]/g, 'Object details available in next log entry');
      }
      return arg;
    });
    originalLog.apply(console, formattedArgs);
  };
  
  console.log('🛡️ Global error catching enabled - "[object Object]" errors will be intercepted');
};

/**
 * Clear browser cache and force reload
 */
export const clearCacheAndReload = () => {
  // Clear all local storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear service worker cache if available
  if ('serviceWorker' in navigator && 'caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // Force hard reload
  window.location.reload();
};

/**
 * Enhanced toast error display that prevents "[object Object]"
 */
export const showSafeErrorToast = (
  error: unknown, 
  title: string = "Error",
  toast: any
) => {
  const safeMessage = formatAnyError(error);
  
  toast({
    title,
    description: safeMessage,
    variant: "destructive",
  });
  
  // Log detailed error for debugging
  console.error('Error details:', error);
};

/**
 * Diagnostic function to check for cached JavaScript issues
 */
export const runCacheDiagnostic = () => {
  console.group('🔍 Browser Cache Diagnostic');
  
  // Check if service worker is active
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log('Service workers:', registrations.length);
      registrations.forEach((registration, index) => {
        console.log(`SW ${index + 1}:`, registration.scope);
      });
    });
  }
  
  // Check localStorage size
  let localStorageSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      localStorageSize += localStorage[key].length;
    }
  }
  console.log('LocalStorage size:', Math.round(localStorageSize / 1024) + ' KB');
  
  // Check if we have formatError available
  try {
    console.log('formatError utility available:', typeof formatError === 'function');
    console.log('Test formatError:', formatError(new Error('test')));
  } catch (e) {
    console.error('formatError utility issue:', e);
  }
  
  // Check geolocation utilities
  try {
    console.log('Geolocation utilities available:', typeof getGeolocationErrorMessage === 'function');
  } catch (e) {
    console.error('Geolocation utilities issue:', e);
  }
  
  console.log('🔧 If issues persist, run clearCacheAndReload()');
  console.groupEnd();
};
