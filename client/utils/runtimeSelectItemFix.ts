/**
 * RUNTIME EMERGENCY SelectItem FIX
 * This patches SelectItem at runtime to prevent rendering errors
 */

/**
 * Emergency runtime fix for SelectItem rendering errors
 * Apply this in browser console if needed
 */
export function applyEmergencySelectItemFix() {
  console.log('🚨 Applying emergency SelectItem runtime fix...');
  
  // Find and fix all current SelectItem elements
  const selectItems = document.querySelectorAll('[data-radix-select-item]');
  let fixedCount = 0;
  
  selectItems.forEach((item, index) => {
    try {
      const textElement = item.querySelector('[data-radix-select-item-text]');
      if (textElement) {
        const currentText = textElement.textContent || '';
        
        // Check for problematic content
        if (currentText.includes('[object Object]') || 
            currentText.includes('function') || 
            currentText.includes('<') ||
            currentText.includes('�')) {
          
          console.warn(`🔧 Fixing SelectItem #${index} with problematic content:`, currentText);
          
          // Extract safe value from the item's value attribute
          const value = item.getAttribute('data-value') || item.getAttribute('value') || `Item ${index + 1}`;
          const safeText = String(value).replace(/[^\w\s\-\(\)\.\,]/g, '');
          
          textElement.textContent = safeText || `Item ${index + 1}`;
          fixedCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error fixing SelectItem #${index}:`, error);
    }
  });
  
  console.log(`✅ Emergency fix complete: ${fixedCount} SelectItems fixed`);
  return fixedCount;
}

/**
 * Monitor for new SelectItem elements and auto-fix them
 */
export function startSelectItemMonitoring() {
  console.log('👁️ Starting SelectItem monitoring...');
  
  // Create observer for new SelectItem elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if the added node or its children contain SelectItems
            const selectItems = element.querySelectorAll ? 
              element.querySelectorAll('[data-radix-select-item]') : [];
            
            if (selectItems.length > 0) {
              console.log(`🔍 Found ${selectItems.length} new SelectItems, applying fixes...`);
              setTimeout(() => applyEmergencySelectItemFix(), 100);
            }
          }
        });
      }
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('✅ SelectItem monitoring active');
  return observer;
}

/**
 * Clear problematic localStorage data
 */
export function clearProblematicData() {
  console.log('🧹 Clearing problematic localStorage data...');
  
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
          // Check for React components or problematic data
          const cleaned = parsed.filter(item => {
            if (typeof item !== 'object' || !item) return false;
            
            // Remove items with function/component icons
            if (item.icon && typeof item.icon === 'function') {
              console.warn(`Removing item with function icon from ${key}:`, item);
              return false;
            }
            
            return true;
          });
          
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(key, JSON.stringify(cleaned));
            console.log(`✅ Cleaned ${key}: removed ${parsed.length - cleaned.length} problematic items`);
          }
        }
      }
    } catch (error) {
      console.warn(`❌ Error processing ${key}, removing:`, error);
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ Data cleaning complete');
}

/**
 * Complete emergency fix - run all repairs
 */
export function runCompleteEmergencyFix() {
  console.log('🆘 RUNNING COMPLETE EMERGENCY FIX...');
  
  // Step 1: Clear problematic data
  clearProblematicData();
  
  // Step 2: Fix existing SelectItems
  const fixedCount = applyEmergencySelectItemFix();
  
  // Step 3: Start monitoring for new ones
  const observer = startSelectItemMonitoring();
  
  // Step 4: Apply fix again after a delay (for dynamically loaded content)
  setTimeout(() => {
    console.log('🔄 Applying delayed fix for dynamic content...');
    applyEmergencySelectItemFix();
  }, 2000);
  
  console.log(`🎉 Complete emergency fix applied! Fixed ${fixedCount} items initially.`);
  
  return { fixedCount, observer };
}

// Auto-apply fix when this module loads
if (typeof window !== 'undefined') {
  // Make functions globally available
  (window as any).applyEmergencySelectItemFix = applyEmergencySelectItemFix;
  (window as any).runCompleteEmergencyFix = runCompleteEmergencyFix;
  (window as any).clearProblematicData = clearProblematicData;
  
  // Auto-apply after a short delay
  setTimeout(() => {
    runCompleteEmergencyFix();
  }, 1000);
  
  console.log('🆘 Emergency SelectItem fix utilities loaded and auto-applied!');
}

export default {
  applyEmergencySelectItemFix,
  startSelectItemMonitoring,
  clearProblematicData,
  runCompleteEmergencyFix
};
