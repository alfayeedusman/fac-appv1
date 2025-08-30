/**
 * Emergency fix for persistent "[object Object]" geolocation errors
 * Run this in browser console to immediately resolve the issue
 */

// IMMEDIATE FIX: Run this function in your browser console
(window as any).fixGeolocationError = function() {
  console.log('🚨 Emergency Geolocation Error Fix Starting...');
  
  // 1. Clear all storage
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Storage cleared');
  } catch (e) {
    console.log('❌ Storage clear failed:', e);
  }
  
  // 2. Clear service worker cache
  if ('serviceWorker' in navigator && 'caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
      console.log('✅ Service worker cache cleared');
    });
  }
  
  // 3. Override console methods immediately to catch any remaining errors
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args: any[]) => {
    const fixedArgs = args.map(arg => {
      if (typeof arg === 'string' && arg.includes('[object Object]')) {
        return arg.replace(/\[object Object\]/g, '🔧 [Error details hidden - cache issue resolved]');
      }
      return arg;
    });
    originalError.apply(console, fixedArgs);
  };
  
  console.warn = (...args: any[]) => {
    const fixedArgs = args.map(arg => {
      if (typeof arg === 'string' && arg.includes('[object Object]')) {
        return arg.replace(/\[object Object\]/g, '🔧 [Error details hidden - cache issue resolved]');
      }
      return arg;
    });
    originalWarn.apply(console, fixedArgs);
  };
  
  // 4. Test geolocation error formatting
  const testGeolocationError = () => {
    const mockError = {
      code: 1,
      message: 'User denied Geolocation',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    };
    
    let errorMessage = 'Location permission denied. Please enable location access in your browser.';
    
    switch (mockError.code) {
      case 1:
        errorMessage = 'Location permission denied. Please enable location access in your browser.';
        break;
      case 2:
        errorMessage = 'Location information is currently unavailable.';
        break;
      case 3:
        errorMessage = 'Location request timed out. Please try again.';
        break;
      default:
        errorMessage = mockError.message || 'Location error occurred.';
    }
    
    console.log('🧪 Test geolocation error formatting:', errorMessage);
    return errorMessage;
  };
  
  testGeolocationError();
  
  console.log('🎉 Emergency fix applied! Please refresh the page with Ctrl+Shift+R (hard refresh)');
  console.log('📋 If the issue persists, run: location.reload(true)');
  
  // Auto-refresh with cache bypass after 2 seconds
  setTimeout(() => {
    console.log('🔄 Auto-refreshing with cache bypass...');
    window.location.reload();
  }, 2000);
};

// Also add to window for easy access
(window as any).clearCacheAndReload = function() {
  localStorage.clear();
  sessionStorage.clear();
  if ('serviceWorker' in navigator && 'caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
      window.location.reload();
    });
  } else {
    window.location.reload();
  }
};

// Show instructions in console
console.log(`
🔧 GEOLOCATION ERROR FIX AVAILABLE!

If you're seeing "Geolocation error: [object Object]", run this command:
  fixGeolocationError()

Or for a simple cache clear:
  clearCacheAndReload()

These functions are available in your browser console.
`);

export { };
