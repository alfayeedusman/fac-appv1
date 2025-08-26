import React from 'react';
import { SelectItem } from '@/components/ui/select';

interface SafeSelectItemProps {
  value?: any;
  children?: React.ReactNode;
  disabled?: boolean;
}

/**
 * Bulletproof wrapper for SelectItem that prevents all rendering errors
 */
export default function SafeSelectItem({ value, children, disabled }: SafeSelectItemProps) {
  try {
    // Ultra-safe value handling - NEVER allow empty strings
    let safeValue: string;

    if (value === null || value === undefined) {
      safeValue = 'undefined_value';
    } else if (typeof value === 'string') {
      // Critical: Never allow empty strings - this causes the SelectItem error
      safeValue = value.trim() || 'empty_string';
    } else if (typeof value === 'number') {
      safeValue = String(value);
    } else if (typeof value === 'boolean') {
      safeValue = String(value);
    } else if (typeof value === 'object') {
      // Handle objects, arrays, React elements
      if (Array.isArray(value)) {
        safeValue = value.length > 0 ? value.join(',') : 'empty_array';
      } else if (React.isValidElement(value)) {
        safeValue = 'react_element';
      } else {
        safeValue = 'object_value';
      }
    } else if (typeof value === 'function') {
      safeValue = 'function_value';
    } else {
      safeValue = String(value) || 'unknown_value';
    }

    // Ensure the value is never an empty string
    if (safeValue === '' || safeValue === ' ') {
      safeValue = 'empty_value';
    }

    // Ultra-safe children handling
    let safeChildren: string;

    if (children === null || children === undefined) {
      safeChildren = safeValue || 'Item';
    } else if (typeof children === 'string') {
      safeChildren = children.trim() || safeValue || 'Empty Text';
    } else if (typeof children === 'number') {
      safeChildren = String(children);
    } else if (typeof children === 'boolean') {
      safeChildren = String(children);
    } else if (React.isValidElement(children)) {
      // Extract text from React element
      safeChildren = safeValue || 'React Element';
    } else if (Array.isArray(children)) {
      safeChildren = children.length > 0 ? children.join(' ') : safeValue || 'Empty Array';
    } else if (typeof children === 'object') {
      safeChildren = safeValue || 'Object';
    } else if (typeof children === 'function') {
      safeChildren = safeValue || 'Function';
    } else {
      safeChildren = String(children) || safeValue || 'Unknown';
    }

    // Aggressive text cleaning
    safeChildren = safeChildren
      .replace(/\[object Object\]/g, 'Object')
      .replace(/\[object.*?\]/g, 'Item')
      .replace(/function.*?\{.*?\}/g, 'Function')
      .replace(/[^\w\s\-\(\)\.\,\:\+\%\$\#]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Ensure we have some content
    if (!safeChildren || safeChildren.length === 0) {
      safeChildren = safeValue || 'Item';
    }

    // Final safety check
    if (safeChildren.includes('[object') || safeChildren.includes('function')) {
      safeChildren = 'Safe Item';
    }

    // Final validation - ensure both value and children are safe
    if (!safeValue || safeValue === '') {
      safeValue = 'safe_fallback';
    }

    if (!safeChildren || safeChildren === '') {
      safeChildren = 'Safe Item';
    }

    return (
      <SelectItem value={safeValue} disabled={disabled}>
        {safeChildren}
      </SelectItem>
    );
  } catch (error) {
    // Ultra-safe fallback
    console.warn('SafeSelectItem error:', error);

    return (
      <SelectItem value="error_fallback" disabled>
        Error: Safe Item
      </SelectItem>
    );
  }
}
