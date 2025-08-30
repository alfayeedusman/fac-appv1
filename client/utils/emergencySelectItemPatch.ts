/**
 * EMERGENCY SelectItem DOM Patch
 * Runs immediately to fix any "[object Object]" issues in real-time
 */

/**
 * Immediate DOM fix for SelectItem errors
 */
function emergencySelectItemPatch() {
  console.log('🚨 Emergency SelectItem DOM patch running...');
  
  // Monitor for errors and fix them immediately
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    
    if (message.includes('SelectItem') || message.includes('[object Object]')) {
      console.warn('🔧 SelectItem error detected, applying immediate fix...');
      
      // Apply DOM fix
      setTimeout(() => {
        fixSelectItemDOM();
      }, 10);
    }
    
    originalError.apply(console, args);
  };
  
  // Initial fix
  setTimeout(() => {
    fixSelectItemDOM();
  }, 100);
  
  // Periodic fixing
  setInterval(() => {
    fixSelectItemDOM();
  }, 2000);
}

/**
 * Fix SelectItem DOM elements
 */
function fixSelectItemDOM() {
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
            text.includes('undefined') ||
            /[^\w\s\-\(\)\.\,\:]/.test(text)) {
          
          console.warn(`🔧 Fixing SelectItem #${index}: "${text}"`);
          
          // Get safe value
          const value = item.getAttribute('data-value') || 
                       item.getAttribute('value') || 
                       `Item ${index + 1}`;
          
          const safeText = String(value)
            .replace(/\[object Object\]/g, 'Object')
            .replace(/\[object.*?\]/g, 'Item')
            .replace(/function.*?\{.*?\}/g, 'Function')
            .replace(/[^\w\s\-\(\)\.\,\:]/g, '')
            .trim() || `Item ${index + 1}`;
          
          textElement.textContent = safeText;
          fixedCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error fixing SelectItem #${index}:`, error);
    }
  });
  
  if (fixedCount > 0) {
    console.log(`✅ Fixed ${fixedCount} SelectItems in DOM`);
  }
  
  return fixedCount;
}

/**
 * Clear problematic localStorage immediately
 */
function emergencyDataClean() {
  console.log('🧹 Emergency data cleaning...');
  
  const keysToClean = [
    'fac_product_categories',
    'fac_suppliers',
    'fac_crew_groups',
    'fac_admin_config'
  ];
  
  keysToClean.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(item => {
            if (typeof item !== 'object' || !item) return false;
            
            // Remove problematic items
            if (item.icon && typeof item.icon === 'function') return false;
            if (typeof item.name === 'function') return false;
            if (typeof item.label === 'function') return false;
            
            return true;
          });
          
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(key, JSON.stringify(cleaned));
            console.log(`✅ Cleaned ${key}: ${parsed.length - cleaned.length} items removed`);
          }
        }
      }
    } catch (error) {
      console.warn(`❌ Error cleaning ${key}, removing:`, error);
      localStorage.removeItem(key);
    }
  });
}

// Auto-run emergency fixes
if (typeof window !== 'undefined') {
  // Clean data immediately
  emergencyDataClean();
  
  // Start DOM patching
  emergencySelectItemPatch();
  
  // Make functions available
  (window as any).fixSelectItemDOM = fixSelectItemDOM;
  (window as any).emergencyDataClean = emergencyDataClean;
  
  console.log('🆘 Emergency SelectItem patch active!');
}

export default {
  fixSelectItemDOM,
  emergencyDataClean,
  emergencySelectItemPatch
};
