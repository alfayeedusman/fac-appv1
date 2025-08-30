import React from 'react';

/**
 * Safely renders icons that can be either strings (emojis) or React components
 * This prevents SelectItem rendering errors when icons are React components
 */
export const renderIcon = (icon: any, className?: string) => {
  if (typeof icon === 'string') {
    // It's an emoji string - render as text
    return <span className={className}>{icon}</span>;
  } else if (icon && typeof icon === 'function') {
    // It's a React component constructor - instantiate it
    return React.createElement(icon, { className });
  } else if (React.isValidElement(icon)) {
    // It's already a React element
    return icon;
  }
  
  // Fallback
  return null;
};

/**
 * Safe text renderer for SelectItem - converts any icon to text representation
 */
export const getIconText = (icon: any): string => {
  if (typeof icon === 'string') {
    return icon;
  } else if (icon && typeof icon === 'function') {
    // Convert React component to appropriate emoji
    const componentName = icon.displayName || icon.name || '';
    switch (componentName.toLowerCase()) {
      case 'car': return '🚗';
      case 'star': return '⭐';
      case 'shield': return '🛡️';
      case 'sparkles': return '✨';
      case 'crown': return '👑';
      case 'zap': return '⚡';
      default: return '📦'; // Default fallback
    }
  }
  
  return '📦'; // Ultimate fallback
};

/**
 * Create a SelectItem-safe version of categories with text-only icons
 */
export const makeSelectItemSafe = (categories: any[]) => {
  return categories.map(category => ({
    ...category,
    iconText: getIconText(category.icon),
    originalIcon: category.icon
  }));
};

export default {
  renderIcon,
  getIconText,
  makeSelectItemSafe
};
