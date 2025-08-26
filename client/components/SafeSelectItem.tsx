import React from 'react';
import { SelectItem } from '@/components/ui/select';

interface SafeSelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

/**
 * Simple wrapper for SelectItem that ensures safe rendering
 */
export default function SafeSelectItem({ value, children, disabled }: SafeSelectItemProps) {
  try {
    // Ensure value is always a string
    const safeValue = String(value || '');
    
    // Ensure children is safe text content
    let safeChildren: string;
    
    if (typeof children === 'string') {
      safeChildren = children;
    } else if (typeof children === 'number') {
      safeChildren = String(children);
    } else if (React.isValidElement(children)) {
      // If it's a React element, extract text content
      safeChildren = String(value || 'Item');
    } else {
      safeChildren = String(children || 'Item');
    }
    
    // Clean up any problematic characters
    safeChildren = safeChildren.replace(/[^\w\s\-\(\)\.\,]/g, '');
    
    return (
      <SelectItem value={safeValue} disabled={disabled}>
        {safeChildren}
      </SelectItem>
    );
  } catch (error) {
    // Fallback rendering
    return (
      <SelectItem value={String(value || 'error')} disabled>
        Error: {String(value || 'Unknown')}
      </SelectItem>
    );
  }
}
