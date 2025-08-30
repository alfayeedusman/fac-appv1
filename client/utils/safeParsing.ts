/**
 * Safe parsing utilities to prevent SelectItem rendering errors
 */

/**
 * Safely parse JSON from localStorage with fallback
 */
export function safeParseLocalStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    
    const parsed = JSON.parse(stored);
    if (parsed === null || parsed === undefined) return fallback;
    
    return parsed;
  } catch (error) {
    console.warn(`Failed to parse localStorage key "${key}":`, error);
    return fallback;
  }
}

/**
 * Validate array data for SelectItem usage
 */
export function validateArrayForSelect<T>(
  data: any, 
  validator: (item: any) => boolean,
  fallback: T[]
): T[] {
  if (!Array.isArray(data)) {
    console.warn('Expected array for SelectItem data, got:', typeof data);
    return fallback;
  }
  
  const validItems = data.filter(item => {
    if (!item || typeof item !== 'object') return false;
    return validator(item);
  });
  
  if (validItems.length === 0) {
    console.warn('No valid items found in SelectItem data');
    return fallback;
  }
  
  return validItems;
}

/**
 * Ensure a value is safe for SelectItem
 */
export function sanitizeSelectValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  
  // For objects, try to extract a meaningful string
  if (typeof value === 'object') {
    if (value.toString && typeof value.toString === 'function') {
      const str = value.toString();
      if (str !== '[object Object]') return str;
    }
    if (value.name) return String(value.name);
    if (value.label) return String(value.label);
    if (value.id) return String(value.id);
  }
  
  console.warn('Cannot sanitize SelectItem value:', value);
  return 'Invalid Value';
}

/**
 * Ensure children are safe for SelectItem
 */
export function sanitizeSelectChildren(children: any): string {
  if (children === null || children === undefined) return '';
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (typeof children === 'boolean') return String(children);
  
  // If it's a React element, extract text content if possible
  if (typeof children === 'object' && children.props) {
    if (children.props.children) {
      return sanitizeSelectChildren(children.props.children);
    }
  }
  
  console.warn('Cannot sanitize SelectItem children:', children);
  return 'Invalid Content';
}

export default {
  safeParseLocalStorage,
  validateArrayForSelect,
  sanitizeSelectValue,
  sanitizeSelectChildren
};
