/**
 * Simple cache breaking utility for persistent error resolution
 */

/**
 * Clear browser cache and force reload
 */
export function clearCacheAndReload() {
  console.log('🧹 Clearing cache and reloading...');
  
  // Clear localStorage selectively
  const keysToRemove = [
    'fac_product_categories',
    'fac_suppliers', 
    'fac_crew_groups',
    'fac_admin_config'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Force reload with cache bypass
  const url = new URL(window.location.href);
  url.searchParams.set('_cb', Date.now().toString());
  window.location.href = url.toString();
}

/**
 * Hard refresh (Ctrl+Shift+R equivalent)
 */
export function hardRefresh() {
  console.log('🔄 Hard refresh...');
  window.location.reload();
}

// Make available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).clearCacheAndReload = clearCacheAndReload;
  (window as any).hardRefresh = hardRefresh;
  
  console.log('🛠️ Cache breaking utilities loaded!');
  console.log('💡 Run clearCacheAndReload() in console if errors persist');
}

export default {
  clearCacheAndReload,
  hardRefresh
};
