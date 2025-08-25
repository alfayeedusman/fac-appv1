import React from 'react';
import { SelectItem } from '@/components/ui/select';

interface SafeSelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Safe wrapper for SelectItem that handles rendering errors gracefully
 */
export default function SafeSelectItem({ value, children, className }: SafeSelectItemProps) {
  try {
    // Validate props
    if (!value || typeof value !== 'string') {
      console.warn('SafeSelectItem: Invalid value prop:', value);
      return null;
    }

    if (!children) {
      console.warn('SafeSelectItem: Missing children prop for value:', value);
      return null;
    }

    return (
      <SelectItem value={value} className={className}>
        {children}
      </SelectItem>
    );
  } catch (error) {
    console.error('SafeSelectItem: Rendering error for value:', value, error);
    
    // Return a fallback SelectItem with safe content
    return (
      <SelectItem value={value || 'error'} className={className}>
        {typeof children === 'string' ? children : value || 'Error'}
      </SelectItem>
    );
  }
}

/**
 * Higher-order component that wraps SelectItem usage with error boundary
 */
export function withSafeSelectItem<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function SafeSelectItemWrapper(props: P) {
    try {
      return <Component {...props} />;
    } catch (error) {
      console.error('SelectItem wrapper error:', error);
      return (
        <SelectItem value="error">
          Error loading option
        </SelectItem>
      );
    }
  };
}
