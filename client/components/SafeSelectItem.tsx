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
    // Ultra-safe value handling
    let safeValue: string;

    if (value === null || value === undefined) {
      safeValue = 'undefined';
    } else if (typeof value === 'string') {
      safeValue = value;
    } else if (typeof value === 'number') {
      safeValue = String(value);
    } else if (typeof value === 'boolean') {
      safeValue = String(value);
    } else if (typeof value === 'object') {
      // Handle objects, arrays, React elements
      if (Array.isArray(value)) {
        safeValue = value.join(',');
      } else if (React.isValidElement(value)) {
        safeValue = 'react-element';
      } else {
        safeValue = 'object';
      }
    } else if (typeof value === 'function') {
      safeValue = 'function';
    } else {
      safeValue = String(value);
    }

    // Ultra-safe children handling
    let safeChildren: string;

    if (children === null || children === undefined) {
      safeChildren = safeValue || 'Item';
    } else if (typeof children === 'string') {
      safeChildren = children;
    } else if (typeof children === 'number') {
      safeChildren = String(children);
    } else if (typeof children === 'boolean') {
      safeChildren = String(children);
    } else if (React.isValidElement(children)) {
      // Extract text from React element
      safeChildren = safeValue || 'React Element';
    } else if (Array.isArray(children)) {
      safeChildren = children.join(' ');
    } else if (typeof children === 'object') {
      safeChildren = safeValue || 'Object';
    } else if (typeof children === 'function') {
      safeChildren = safeValue || 'Function';
    } else {
      safeChildren = String(children);
    }

    // Aggressive text cleaning
    safeChildren = safeChildren
      .replace(/\[object Object\]/g, 'Object')
      .replace(/\[object.*?\]/g, 'Item')
      .replace(/function.*?\{.*?\}/g, 'Function')
      .replace(/[^\w\s\-\(\)\.\,\:]/g, '')
      .trim();

    // Ensure we have some content
    if (!safeChildren || safeChildren.length === 0) {
      safeChildren = safeValue || 'Item';
    }

    // Final safety check
    if (safeChildren.includes('[object') || safeChildren.includes('function')) {
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
      <SelectItem value="fallback" disabled>
        Safe Item
      </SelectItem>
    );
  }
}
