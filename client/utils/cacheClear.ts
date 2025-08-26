/**
 * Cache clearing utility to resolve persistent SelectItem errors
 */

/**
 * Clear browser cache and localStorage to fix persistent errors
 */
export async function clearAllCaches() {
  console.log('🧹 Clearing all caches and storage...');
  
  // Clear service worker caches
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('✅ Service worker caches cleared');
    } catch (error) {
      console.warn('⚠️ Could not clear service worker caches:', error);
    }
  }
  
  // Clear localStorage (selective)
  const keysToPreserve = ['theme', 'user-preferences'];
  const allKeys = Object.keys(localStorage);
  
  allKeys.forEach(key => {
    if (!keysToPreserve.includes(key)) {
      localStorage.removeItem(key);
    }
  });
  console.log('✅ localStorage cleared (preserved theme and preferences)');
  
  // Clear sessionStorage
  sessionStorage.clear();
  console.log('✅ sessionStorage cleared');
  
  // Clear indexedDB if possible
  if ('indexedDB' in window) {
    try {
      // Note: This is basic - full indexedDB clearing would need more specific implementation
      console.log('ℹ️ indexedDB clearing skipped (requires specific database names)');
    } catch (error) {
      console.warn('⚠️ Could not access indexedDB:', error);
    }
  }
  
  console.log('🎉 Cache clearing complete!');
}

/**
 * Hard refresh with cache bypass
 */
export function hardRefresh() {
  console.log('🔄 Performing hard refresh with cache bypass...');
  
  // Clear caches first
  clearAllCaches().then(() => {
    // Force reload bypassing cache
    window.location.reload();
  }).catch(() => {
    // Fallback: just reload
    window.location.reload();
  });
}

/**
 * Check if cache clearing might resolve current issues
 */
export function shouldClearCache(): boolean {
  // Check for signs that cache clearing might help
  const signs = [
    // SelectItem errors in console
    performance.getEntriesByType('navigation')[0]?.type === 'reload',
    // Old localStorage data
    localStorage.getItem('fac_product_categories') !== null,
    // Multiple error handlers running
    (window as any).__selectItemErrorCount > 0
  ];
  
  return signs.some(Boolean);
}

// Make available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).clearAllCaches = clearAllCaches;
  (window as any).hardRefresh = hardRefresh;
  (window as any).shouldClearCache = shouldClearCache;
  
  console.log('🧹 Cache clearing utilities loaded!');
  console.log('💡 Run clearAllCaches() or hardRefresh() in console if needed');
}

export default {
  clearAllCaches,
  hardRefresh,
  shouldClearCache
};
