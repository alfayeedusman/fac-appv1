/**
 * Validation utilities for Select components to prevent rendering errors
 */

export interface SelectValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
  sanitizedChildren?: string;
}

/**
 * Validate SelectItem props to prevent rendering errors
 */
export function validateSelectItem(
  value: any, 
  children: any
): SelectValidationResult {
  const result: SelectValidationResult = { isValid: true };

  // Validate value
  if (value === null || value === undefined) {
    result.isValid = false;
    result.error = 'SelectItem value cannot be null or undefined';
    result.sanitizedValue = 'invalid';
  } else if (typeof value !== 'string') {
    result.isValid = false;
    result.error = `SelectItem value must be string, got ${typeof value}`;
    result.sanitizedValue = String(value);
  } else {
    result.sanitizedValue = value;
  }

  // Validate children
  if (children === null || children === undefined) {
    result.isValid = false;
    result.error = 'SelectItem children cannot be null or undefined';
    result.sanitizedChildren = result.sanitizedValue || 'Unknown';
  } else if (typeof children === 'string') {
    // Check for problematic characters
    if (children.includes('�')) {
      result.isValid = false;
      result.error = 'SelectItem children contains corrupted characters';
      result.sanitizedChildren = children.replace(/�/g, '?');
    } else {
      result.sanitizedChildren = children;
    }
  } else if (React.isValidElement(children)) {
    result.sanitizedChildren = children;
  } else {
    result.isValid = false;
    result.error = `SelectItem children must be string or React element, got ${typeof children}`;
    result.sanitizedChildren = String(children);
  }

  return result;
}

/**
 * Sanitize text to remove problematic characters that cause rendering issues
 */
export function sanitizeSelectText(text: string): string {
  if (typeof text !== 'string') return String(text);
  
  return text
    .replace(/�/g, '?') // Replace corrupted characters
    .replace(/&lt;/g, '<') // Fix HTML entities
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Check if a string contains problematic characters for React rendering
 */
export function hasProblematicCharacters(text: string): boolean {
  if (typeof text !== 'string') return false;
  
  // Check for common problematic patterns
  const problematicPatterns = [
    /�/, // Corrupted Unicode characters
    /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/, // Control characters
    /&[a-zA-Z]+;(?![a-zA-Z])/, // Unescaped HTML entities in wrong context
  ];
  
  return problematicPatterns.some(pattern => pattern.test(text));
}

/**
 * Debug function to log SelectItem issues
 */
export function debugSelectItem(value: any, children: any, componentName?: string): void {
  const validation = validateSelectItem(value, children);
  
  if (!validation.isValid) {
    console.group(`SelectItem Validation Error${componentName ? ` in ${componentName}` : ''}`);
    console.error('Error:', validation.error);
    console.log('Original value:', value);
    console.log('Original children:', children);
    console.log('Sanitized value:', validation.sanitizedValue);
    console.log('Sanitized children:', validation.sanitizedChildren);
    console.groupEnd();
  }
}

export default {
  validateSelectItem,
  sanitizeSelectText,
  hasProblematicCharacters,
  debugSelectItem
};
