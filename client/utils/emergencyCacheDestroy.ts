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

// Make available globally (NO ERROR HANDLERS TO PREVENT LOOPS)
if (typeof window !== 'undefined') {
  (window as any).nukeCaches = nukeCaches;
  (window as any).emergencyReset = emergencyReset;
  (window as any).forceRefreshWithCacheBypass = forceRefreshWithCacheBypass;
  
  console.log('💣 Emergency cache destruction utilities loaded!');
  console.log('💡 Run emergencyReset() in console for nuclear option');
}

export default {
  nukeCaches,
  emergencyReset,
  forceRefreshWithCacheBypass
};
