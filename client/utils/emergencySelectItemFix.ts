/**
 * EMERGENCY SelectItem Fix - Runtime Protection
 * This utility provides immediate protection against SelectItem rendering errors
 */

// Track errors to prevent infinite loops
let errorCount = 0;
const MAX_ERRORS = 5;

/**
 * Emergency function to clear all problematic localStorage data
 */
export function clearProblematicLocalStorage() {
  console.log('🚨 EMERGENCY: Clearing potentially problematic localStorage data...');
  
  const keysToCheck = [
    'fac_product_categories',
    'fac_suppliers',
    'fac_crew_groups',
    'fac_registered_users',
    'fac_admin_config',
    'currentUser'
  ];
  
  keysToCheck.forEach(key => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log(`🔍 Checking ${key}:`, typeof parsed, Array.isArray(parsed));
        
        // If it's an array, validate each item
        if (Array.isArray(parsed)) {
          const validItems = parsed.filter(item => {
            if (!item || typeof item !== 'object') return false;
            
            // Check for problematic icon properties that might be React components
            if (item.icon && typeof item.icon === 'function') {
              console.warn(`❌ Found React component in ${key}:`, item);
              return false;
            }
            
            return true;
          });
          
          if (validItems.length !== parsed.length) {
            console.warn(`⚠️ Cleaning ${key}: ${parsed.length - validItems.length} invalid items removed`);
            localStorage.setItem(key, JSON.stringify(validItems));
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error checking ${key}, removing:`, error);
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ localStorage cleanup complete');
}

/**
 * Immediate SelectItem DOM fix - removes problematic content
 */
export function emergencySelectItemDOMFix() {
  console.log('🚨 EMERGENCY: Scanning DOM for problematic SelectItem elements...');
  
  const selectItems = document.querySelectorAll('[data-radix-select-item]');
  let fixedCount = 0;
  
  selectItems.forEach((item, index) => {
    try {
      // Check for nested elements that shouldn't be there
      const nestedDivs = item.querySelectorAll('div');
      const nestedSpans = item.querySelectorAll('span:not([data-radix-select-item-indicator])');
      
      if (nestedDivs.length > 0 || nestedSpans.length > 0) {
        console.warn(`🔧 Fixing SelectItem #${index} with nested elements`);
        
        // Extract text content and clean up
        const textContent = item.textContent || 'Fixed Item';
        const cleanText = textContent.replace(/[^\w\s\-\(\)\.]/g, '').trim();
        
        // Replace content with clean text
        const textSpan = item.querySelector('[data-radix-select-item-text]');
        if (textSpan) {
          textSpan.textContent = cleanText;
          // Remove problematic nested elements
          nestedDivs.forEach(div => div.remove());
          nestedSpans.forEach(span => {
            if (!span.hasAttribute('data-radix-select-item-indicator')) {
              span.remove();
            }
          });
          fixedCount++;
        }
      }
      
      // Check for corrupted text content
      if (item.textContent && item.textContent.includes('�')) {
        console.warn(`🔧 Fixing SelectItem #${index} with corrupted characters`);
        const textSpan = item.querySelector('[data-radix-select-item-text]');
        if (textSpan) {
          textSpan.textContent = textSpan.textContent.replace(/�/g, '?');
          fixedCount++;
        }
      }
      
    } catch (error) {
      console.error(`❌ Error fixing SelectItem #${index}:`, error);
    }
  });
  
  console.log(`✅ Emergency DOM fix complete: ${fixedCount} SelectItems fixed`);
  return fixedCount;
}

/**
 * Force reload with cache bypass if errors persist
 */
export function emergencyReload() {
  if (errorCount >= MAX_ERRORS) {
    console.log('🚨 CRITICAL: Too many SelectItem errors, forcing cache bypass reload...');
    
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Force reload without cache
    window.location.reload();
    return;
  }
  
  errorCount++;
  
  // Try fixes first
  clearProblematicLocalStorage();
  emergencySelectItemDOMFix();
  
  // If still errors, reload
  setTimeout(() => {
    if (errorCount >= 3) {
      console.log('🔄 Reloading page due to persistent SelectItem errors...');
      window.location.reload();
    }
  }, 2000);
}

/**
 * Install emergency error handlers
 */
export function installEmergencyHandlers() {
  // Global error handler for SelectItem issues
  window.addEventListener('error', (event) => {
    if (event.error && event.error.stack) {
      const stack = event.error.stack;
      if (stack.includes('SelectItem') || 
          stack.includes('react-select') || 
          stack.includes('ItemText') ||
          stack.includes('@radix-ui')) {
        
        console.error('🚨 SelectItem error detected:', event.error);
        console.error('📍 Error location:', event.filename, event.lineno, event.colno);
        
        // Apply emergency fix
        setTimeout(() => {
          emergencySelectItemDOMFix();
          clearProblematicLocalStorage();
        }, 100);
        
        return true; // Prevent default error handling
      }
    }
  });
  
  // React error boundary fallback
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.toString().includes('SelectItem')) {
      console.error('🚨 SelectItem promise rejection:', event.reason);
      emergencySelectItemDOMFix();
      event.preventDefault();
    }
  });
  
  console.log('🛡️ Emergency SelectItem handlers installed');
}

/**
 * Complete emergency fix - run all repairs
 */
export function runEmergencySelectItemFix() {
  console.log('🚨 RUNNING COMPLETE EMERGENCY SELECTITEM FIX...');
  
  // Step 1: Clear problematic data
  clearProblematicLocalStorage();
  
  // Step 2: Fix DOM
  const fixedItems = emergencySelectItemDOMFix();
  
  // Step 3: Test for remaining issues
  setTimeout(() => {
    try {
      // Run quick test
      const remainingIssues = document.querySelectorAll('[data-radix-select-item] div, [data-radix-select-item] span:not([data-radix-select-item-indicator])').length;
      
      if (remainingIssues > 0) {
        console.warn(`⚠️ ${remainingIssues} potential SelectItem issues remain`);
        emergencyReload();
      } else {
        console.log('✅ All SelectItem issues resolved!');
      }
    } catch (error) {
      console.error('❌ Error during post-fix validation:', error);
      emergencyReload();
    }
  }, 1000);
  
  return fixedItems;
}

// Auto-install handlers when loaded
if (typeof window !== 'undefined') {
  installEmergencyHandlers();
  
  // Make functions globally available for console debugging
  (window as any).emergencySelectItemFix = runEmergencySelectItemFix;
  (window as any).clearProblematicLocalStorage = clearProblematicLocalStorage;
  (window as any).emergencySelectItemDOMFix = emergencySelectItemDOMFix;
  
  console.log('🆘 Emergency SelectItem fix utilities loaded!');
  console.log('💡 Run emergencySelectItemFix() in console if errors persist');
}

export default {
  clearProblematicLocalStorage,
  emergencySelectItemDOMFix,
  emergencyReload,
  installEmergencyHandlers,
  runEmergencySelectItemFix
};
