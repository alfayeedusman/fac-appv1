/**
 * EMERGENCY Cache Destruction - Nuclear Option for Persistent Errors
 * This utility completely destroys all cache and forces fresh reload
 */

/**
 * Nuclear cache clearing - destroys everything
 */
export async function nukeCaches() {
  console.log('💣 NUCLEAR OPTION: Destroying all caches...');
  
  // 1. Clear all service worker caches
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('✅ All service worker caches destroyed');
    } catch (error) {
      console.warn('⚠️ Service worker cache destruction failed:', error);
    }
  }
  
  // 2. Clear ALL localStorage (no exceptions)
  try {
    localStorage.clear();
    console.log('✅ localStorage completely cleared');
  } catch (error) {
    console.warn('⚠️ localStorage clearing failed:', error);
  }
  
  // 3. Clear ALL sessionStorage
  try {
    sessionStorage.clear();
    console.log('✅ sessionStorage completely cleared');
  } catch (error) {
    console.warn('⚠️ sessionStorage clearing failed:', error);
  }
  
  // 4. Clear IndexedDB databases
  if ('indexedDB' in window) {
    try {
      // Common database names to clear
      const dbsToDelete = ['fac_cache', 'workbox-backgroundsync', 'keyval-store'];
      
      for (const dbName of dbsToDelete) {
        const deleteRequest = indexedDB.deleteDatabase(dbName);
        deleteRequest.onerror = () => console.warn(`⚠️ Could not delete ${dbName}`);
        deleteRequest.onsuccess = () => console.log(`✅ Deleted ${dbName}`);
      }
    } catch (error) {
      console.warn('⚠️ IndexedDB clearing failed:', error);
    }
  }
  
  // 5. Clear browser cache headers if possible
  if ('navigator' in window && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('✅ Service worker unregistered');
      }
    } catch (error) {
      console.warn('⚠️ Service worker unregistration failed:', error);
    }
  }
  
  console.log('💥 Nuclear cache destruction complete!');
}

/**
 * Force refresh with maximum cache bypassing
 */
export function forceRefreshWithCacheBypass() {
  console.log('🚀 Forcing cache bypass refresh...');
  
  // Add timestamp to force cache bypass
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('_cacheBust', Date.now().toString());
  
  // Replace current history entry
  window.history.replaceState({}, '', currentUrl.toString());
  
  // Force reload
  window.location.reload();
}

/**
 * Complete emergency reset - nuclear option
 */
export async function emergencyReset() {
  console.log('🆘 EMERGENCY RESET: Complete cache destruction and reload...');
  
  try {
    await nukeCaches();
    
    // Wait a moment for cleanup to complete
    setTimeout(() => {
      forceRefreshWithCacheBypass();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Emergency reset failed:', error);
    // Fallback: just reload
    window.location.reload();
  }
}

/**
 * Install emergency reset trigger
 */
export function installEmergencyResetTrigger() {
  let errorCount = 0;
  const MAX_ERRORS = 3;
  
  // Monitor for SelectItem errors
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    
    if (message.includes('SelectItem') || 
        message.includes('react-select') ||
        message.includes('radix-ui')) {
      
      errorCount++;
      console.warn(`🚨 SelectItem error #${errorCount} detected`);
      
      if (errorCount >= MAX_ERRORS) {
        console.error('💣 Too many SelectItem errors - triggering emergency reset!');
        emergencyReset();
        return;
      }
    }
    
    originalError.apply(console, args);
  };
  
  // Global error listener
  window.addEventListener('error', (event) => {
    if (event.error && event.error.stack && 
        (event.error.stack.includes('SelectItem') || 
         event.error.stack.includes('AdminHeatMap'))) {
      
      errorCount++;
      console.warn(`🚨 Global SelectItem error #${errorCount} detected`);
      
      if (errorCount >= MAX_ERRORS) {
        console.error('💣 Too many global errors - triggering emergency reset!');
        emergencyReset();
      }
    }
  });
  
  console.log('🛡️ Emergency reset trigger installed');
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).nukeCaches = nukeCaches;
  (window as any).emergencyReset = emergencyReset;
  (window as any).forceRefreshWithCacheBypass = forceRefreshWithCacheBypass;
  
  // Auto-install the trigger
  installEmergencyResetTrigger();
  
  console.log('💣 Emergency cache destruction utilities loaded!');
  console.log('💡 Run emergencyReset() in console for nuclear option');
}

export default {
  nukeCaches,
  emergencyReset,
  forceRefreshWithCacheBypass,
  installEmergencyResetTrigger
};
