/**
 * Validation test for geolocation timeout fix
 * This runs comprehensive tests to ensure the fix is working
 */

import { emergencyGPSFix, testTimeoutIssue } from './quickLocationFix';
import { getLocationEmergency, testGeolocationStrategies } from './geolocationTimeoutFix';
import { getCurrentPositionAsync } from './geolocationUtils';

export interface TestResult {
  name: string;
  success: boolean;
  time: number;
  error?: string;
  data?: any;
}

/**
 * Run comprehensive geolocation fix validation
 */
export const validateGeolocationFix = async (): Promise<{
  passed: number;
  failed: number;
  total: number;
  results: TestResult[];
  summary: string;
}> => {
  console.log('🧪 Starting comprehensive geolocation fix validation...');
  const results: TestResult[] = [];
  
  // Test 1: Emergency GPS Fix
  const test1Start = Date.now();
  try {
    const result1 = await emergencyGPSFix();
    results.push({
      name: 'Emergency GPS Fix',
      success: result1 !== null,
      time: Date.now() - test1Start,
      data: result1
    });
  } catch (error) {
    results.push({
      name: 'Emergency GPS Fix',
      success: false,
      time: Date.now() - test1Start,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 2: Timeout Issue Detection
  const test2Start = Date.now();
  try {
    const result2 = await testTimeoutIssue();
    results.push({
      name: 'Timeout Issue Detection',
      success: true,
      time: Date.now() - test2Start,
      data: result2
    });
  } catch (error) {
    results.push({
      name: 'Timeout Issue Detection',
      success: false,
      time: Date.now() - test2Start,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 3: Emergency Location Service
  const test3Start = Date.now();
  try {
    const result3 = await getLocationEmergency();
    results.push({
      name: 'Emergency Location Service',
      success: result3 !== null,
      time: Date.now() - test3Start,
      data: result3
    });
  } catch (error) {
    results.push({
      name: 'Emergency Location Service',
      success: false,
      time: Date.now() - test3Start,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 4: Enhanced Geolocation Utils
  const test4Start = Date.now();
  try {
    const result4 = await getCurrentPositionAsync({ timeout: 5000 });
    results.push({
      name: 'Enhanced Geolocation Utils',
      success: true,
      time: Date.now() - test4Start,
      data: result4
    });
  } catch (error) {
    results.push({
      name: 'Enhanced Geolocation Utils',
      success: false,
      time: Date.now() - test4Start,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 5: Strategy Comparison
  const test5Start = Date.now();
  try {
    const result5 = await testGeolocationStrategies();
    results.push({
      name: 'Strategy Comparison',
      success: result5.summary.successfulMethods > 0,
      time: Date.now() - test5Start,
      data: result5.summary
    });
  } catch (error) {
    results.push({
      name: 'Strategy Comparison',
      success: false,
      time: Date.now() - test5Start,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;

  const summary = `Geolocation Fix Validation: ${passed}/${total} tests passed (${Math.round(passed/total*100)}% success rate)`;

  console.log('📊 Validation Results:', {
    passed,
    failed,
    total,
    results,
    summary
  });

  return {
    passed,
    failed,
    total,
    results,
    summary
  };
};

/**
 * Quick validation for immediate feedback
 */
export const quickValidation = async (): Promise<boolean> => {
  console.log('⚡ Running quick geolocation validation...');
  
  try {
    // Try emergency fix
    const emergencyResult = await emergencyGPSFix();
    if (emergencyResult) {
      console.log('✅ Quick validation passed: Emergency GPS working');
      return true;
    }
    
    // Try emergency location service
    const locationResult = await getLocationEmergency();
    if (locationResult) {
      console.log('✅ Quick validation passed: Emergency location working');
      return true;
    }
    
    console.log('❌ Quick validation failed: No location methods working');
    return false;
    
  } catch (error) {
    console.error('❌ Quick validation error:', error);
    return false;
  }
};

// Make validation functions available globally
if (typeof window !== 'undefined') {
  (window as any).validateGeolocationFix = validateGeolocationFix;
  (window as any).quickValidation = quickValidation;
}

export default validateGeolocationFix;
