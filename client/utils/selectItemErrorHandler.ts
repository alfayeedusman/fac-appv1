/**
 * Global error handler for SelectItem rendering issues
 */

// Global error boundary for SelectItem issues
let selectItemErrorCount = 0;
const MAX_ERRORS = 10;

/**
 * Catch and handle SelectItem rendering errors
 */
export function handleSelectItemError(error: any, errorInfo?: any) {
  selectItemErrorCount++;
  
  console.group(`🔥 SelectItem Error #${selectItemErrorCount}`);
  console.error('SelectItem rendering error:', error);
  
  if (errorInfo) {
    console.error('Error info:', errorInfo);
  }
  
  // Try to extract useful information from the error
  if (error && error.stack) {
    const stackLines = error.stack.split('\n');
    const selectItemLine = stackLines.find(line => 
      line.includes('SelectItem') || 
      line.includes('react-select') ||
      line.includes('ItemText')
    );
    
    if (selectItemLine) {
      console.error('SelectItem stack trace:', selectItemLine);
    }
  }
  
  // Log component tree if available
  if (errorInfo && errorInfo.componentStack) {
    console.error('Component stack:', errorInfo.componentStack);
  }
  
  console.groupEnd();
  
  // If too many errors, disable further logging
  if (selectItemErrorCount >= MAX_ERRORS) {
    console.warn(`SelectItem error limit reached (${MAX_ERRORS}). Disabling further logging.`);
  }
  
  return selectItemErrorCount < MAX_ERRORS;
}

/**
 * Add global error listeners for SelectItem issues
 */
export function setupSelectItemErrorHandling() {
  // Global error handler
  window.addEventListener('error', (event) => {
    if (event.error && event.error.stack) {
      const stack = event.error.stack;
      if (stack.includes('SelectItem') || 
          stack.includes('react-select') || 
          stack.includes('ItemText') ||
          stack.includes('SelectPrimitive')) {
        handleSelectItemError(event.error);
      }
    }
  });
  
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.stack) {
      const stack = event.reason.stack;
      if (stack.includes('SelectItem') || 
          stack.includes('react-select') || 
          stack.includes('ItemText')) {
        handleSelectItemError(event.reason);
        event.preventDefault(); // Prevent default browser error handling
      }
    }
  });
  
  console.log('🛡️ SelectItem error handling initialized');
}

/**
 * Validate data before it goes into SelectItem
 */
export function validateSelectItemData(data: any[], componentName: string = 'Unknown') {
  if (!Array.isArray(data)) {
    console.warn(`${componentName}: Expected array for SelectItem data, got:`, typeof data);
    return [];
  }
  
  const validItems = data.filter(item => {
    if (!item) return false;
    if (typeof item !== 'object') return false;
    
    // Check for common required properties
    const hasId = 'id' in item;
    const hasValue = 'value' in item;
    const hasName = 'name' in item || 'label' in item;
    
    if (!hasId && !hasValue) {
      console.warn(`${componentName}: Item missing id/value:`, item);
      return false;
    }
    
    if (!hasName) {
      console.warn(`${componentName}: Item missing name/label:`, item);
      return false;
    }
    
    return true;
  });
  
  if (validItems.length !== data.length) {
    console.warn(`${componentName}: Filtered ${data.length - validItems.length} invalid items`);
  }
  
  return validItems;
}

/**
 * Check if the current environment has known SelectItem issues
 */
export function diagnosticSelectItemHealth() {
  const report = {
    timestamp: new Date().toISOString(),
    errorCount: selectItemErrorCount,
    environment: {
      userAgent: navigator.userAgent,
      localStorage: typeof Storage !== 'undefined',
      reactDevTools: !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
    },
    selectComponents: {
      safeSelectItemAvailable: typeof document !== 'undefined' && 
        document.querySelector('[data-safe-select-item]') !== null,
      selectItemCount: typeof document !== 'undefined' ? 
        document.querySelectorAll('[data-radix-select-item]').length : 0
    }
  };
  
  console.log('📊 SelectItem Health Report:', report);
  return report;
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  setupSelectItemErrorHandling();
}

export default {
  handleSelectItemError,
  setupSelectItemErrorHandling,
  validateSelectItemData,
  diagnosticSelectItemHealth
};
