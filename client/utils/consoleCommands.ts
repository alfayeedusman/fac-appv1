/**
 * Simple console commands for debugging and fixing issues
 */

/**
 * Fix SelectItem rendering issues
 */
export function fixSelectItems() {
  console.log('🔧 Fixing SelectItem issues...');
  
  const selectItems = document.querySelectorAll('[data-radix-select-item]');
  let fixedCount = 0;
  
  selectItems.forEach((item, index) => {
    try {
      const textElement = item.querySelector('[data-radix-select-item-text]');
      if (textElement && textElement.textContent) {
        const text = textElement.textContent;
        
        // Check for problematic content
        if (text.includes('[object Object]') || 
            text.includes('function') || 
            text.includes('<') ||
            /[^\w\s\-\(\)\.\,\:]/.test(text)) {
          
          console.warn(`🔧 Fixing SelectItem #${index}:`, text);
          
          // Get safe value
          const value = item.getAttribute('data-value') || item.getAttribute('value') || `Item ${index + 1}`;
          const safeText = String(value).replace(/[^\w\s\-\(\)\.\,\:]/g, '').trim() || `Item ${index + 1}`;
          
          textElement.textContent = safeText;
          fixedCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error fixing SelectItem #${index}:`, error);
    }
  });
  
  console.log(`✅ Fixed ${fixedCount} SelectItems`);
  return fixedCount;
}

/**
 * Clear problematic localStorage data
 */
export function clearBadData() {
  console.log('🧹 Clearing problematic data...');
  
  const keysToCheck = [
    'fac_product_categories',
    'fac_suppliers',
    'fac_crew_groups'
  ];
  
  keysToCheck.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(item => {
            if (typeof item !== 'object' || !item) return false;
            if (item.icon && typeof item.icon === 'function') return false;
            return true;
          });
          
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(key, JSON.stringify(cleaned));
            console.log(`✅ Cleaned ${key}`);
          }
        }
      }
    } catch (error) {
      console.warn(`❌ Error with ${key}, removing:`, error);
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ Data cleaning complete');
}

/**
 * Force refresh with cache bypass
 */
export function forceRefresh() {
  console.log('🔄 Force refreshing...');
  
  // Clear some localStorage
  clearBadData();
  
  // Add cache busting parameter
  const url = new URL(window.location.href);
  url.searchParams.set('_refresh', Date.now().toString());
  window.location.href = url.toString();
}

/**
 * Complete fix - run all repairs
 */
export function fixEverything() {
  console.log('🛠️ Running complete fix...');
  
  clearBadData();
  const fixed = fixSelectItems();
  
  if (fixed > 0) {
    console.log('🎉 Fixed issues found - page should work better now');
  } else {
    console.log('✅ No issues found - everything looks good!');
  }
  
  return fixed;
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).fixSelectItems = fixSelectItems;
  (window as any).clearBadData = clearBadData;
  (window as any).forceRefresh = forceRefresh;
  (window as any).fixEverything = fixEverything;

  // Auto-run data cleaning on load
  setTimeout(() => {
    console.log('🧹 Auto-cleaning problematic data...');
    clearBadData();
  }, 500);

  console.log('🛠️ Debug commands loaded!');
  console.log('Available commands:');
  console.log('  fixSelectItems() - Fix SelectItem rendering issues');
  console.log('  clearBadData() - Clear problematic localStorage');
  console.log('  forceRefresh() - Force refresh with cache bypass');
  console.log('  fixEverything() - Run all fixes');
}

export default {
  fixSelectItems,
  clearBadData,
  forceRefresh,
  fixEverything
};
