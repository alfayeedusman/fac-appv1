/**
 * Network diagnostic utilities for debugging connection issues
 */

import { formatError } from '../lib/errorUtils';

export interface NetworkDiagnostics {
  online: boolean;
  apiBaseUrl: string;
  origin: string;
  userAgent: string;
  timestamp: string;
}

export interface NetworkTestResult {
  success: boolean;
  status?: number;
  responseTime: number;
  error?: string;
  diagnostics: NetworkDiagnostics;
}

/**
 * Get current network diagnostics
 */
export const getNetworkDiagnostics = (): NetworkDiagnostics => ({
  online: navigator.onLine,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  origin: window.location.origin,
  userAgent: navigator.userAgent,
  timestamp: new Date().toISOString(),
});

/**
 * Test API connectivity
 */
export const testApiConnectivity = async (endpoint: string = '/health'): Promise<NetworkTestResult> => {
  const startTime = Date.now();
  const diagnostics = getNetworkDiagnostics();
  const apiBaseUrl = diagnostics.apiBaseUrl;
  
  try {
    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        success: true,
        status: response.status,
        responseTime,
        diagnostics,
      };
    } else {
      return {
        success: false,
        status: response.status,
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
        diagnostics,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      success: false,
      responseTime,
      error: formatError(error),
      diagnostics,
    };
  }
};

/**
 * Log network diagnostics to console
 */
export const logNetworkDiagnostics = async () => {
  console.group('🔍 Network Diagnostics');
  
  const diagnostics = getNetworkDiagnostics();
  console.log('📊 Current Status:', diagnostics);
  
  console.log('🌐 Testing API connectivity...');
  const testResult = await testApiConnectivity();
  
  if (testResult.success) {
    console.log('✅ API is reachable:', testResult);
  } else {
    console.warn('❌ API connection failed:', testResult);
    
    // Additional debugging info
    console.log('🔧 Troubleshooting tips:');
    console.log('- Check if backend server is running');
    console.log('- Verify API_BASE_URL in environment:', diagnostics.apiBaseUrl);
    console.log('- Check browser network tab for CORS errors');
    console.log('- Ensure server CORS allows origin:', diagnostics.origin);
  }
  
  console.groupEnd();
  return testResult;
};

/**
 * Format network error for user display
 */
export const formatNetworkError = (error: unknown): string => {
  const errorStr = formatError(error).toLowerCase();
  
  if (!navigator.onLine) {
    return 'No internet connection. Please check your network and try again.';
  }
  
  if (errorStr.includes('cors') || errorStr.includes('cross-origin')) {
    return 'Unable to connect to server. Please contact support if this persists.';
  }
  
  if (errorStr.includes('timeout') || errorStr.includes('network')) {
    return 'Connection timeout. Please check your internet connection and try again.';
  }
  
  if (errorStr.includes('404') || errorStr.includes('not found')) {
    return 'Server endpoint not found. The service may be temporarily unavailable.';
  }
  
  return 'Unable to connect to server. Please try again later.';
};
