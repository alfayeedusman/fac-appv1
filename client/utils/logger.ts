// Lightweight logger utility that silences debug logs in production
// Usage: import { log, info, warn, error } from '@/utils/logger'

const isProd = typeof import.meta !== 'undefined' && !!(import.meta as any).env && (import.meta as any).env.PROD;

export const log = (...args: any[]) => {
  if (!isProd) console.log(...args);
};

export const info = (...args: any[]) => {
  if (!isProd) console.info(...args);
};

export const warn = (...args: any[]) => {
  if (!isProd) console.warn(...args);
};

export const error = (...args: any[]) => {
  // Always show errors even in production to aid debugging
  console.error(...args);
};

export default { log, info, warn, error };
