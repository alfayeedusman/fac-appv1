/**
 * Utility functions for safe error formatting and handling
 */

/**
 * Safely format an error object to a readable string
 * Prevents "[object Object]" when logging or displaying errors
 */
export const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  
  return String(error);
};

/**
 * Format an error with additional context
 */
export const formatErrorWithContext = (error: unknown, context: string): string => {
  const formattedError = formatError(error);
  return `${context}: ${formattedError}`;
};
