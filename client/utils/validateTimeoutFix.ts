/**
 * Quick validation to check if geolocation timeout fixes are working
 */

const validateTimeoutFixStatus = async () => {
  console.log('🔍 VALIDATING GEOLOCATION TIMEOUT FIX STATUS...');
  console.log('================================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    browser: {
      geolocationSupported: 'geolocation' in navigator,
      isSecure: location.protocol === 'https:' || location.hostname === 'localhost',
      userAgent: navigator.userAgent.substring(0, 50) + '...'
    },
    tests: [] as any[],
    summary: {
      passed: 0,
      failed: 0,
      total: 0
    }
  };

  // Test 1: Check if fix functions are available
  console.log('📋 Test 1: Checking if fix functions are loaded...');
  const fixFunctionsAvailable = typeof (window as any).debugAndFixTimeout === 'function' &&
                               typeof (window as any).immediateTimeoutFix === 'function';
  
  results.tests.push({
    name: 'Fix Functions Available',
    passed: fixFunctionsAvailable,
    details: fixFunctionsAvailable ? 'All fix functions loaded' : 'Fix functions not loaded'
  });

  if (fixFunctionsAvailable) {
    console.log('✅ Fix functions are loaded and available');
  } else {
    console.log('❌ Fix functions not available - refresh page or check imports');
  }

  // Test 2: Quick geolocation test
  console.log('📋 Test 2: Quick geolocation capability test...');
  try {
    const quickTest = await new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => resolve(false), 2000); // 2 second timeout
      
      navigator.geolocation.getCurrentPosition(
        () => {
          clearTimeout(timeout);
          resolve(true);
        },
        () => {
          clearTimeout(timeout);
          resolve(false);
        },
        { timeout: 1500, enableHighAccuracy: false, maximumAge: 600000 }
      );
    });
    
    results.tests.push({
      name: 'Quick Geolocation Test',
      passed: quickTest,
      details: quickTest ? 'Geolocation working' : 'Geolocation timeout/error'
    });

    if (quickTest) {
      console.log('✅ Quick geolocation test passed');
    } else {
      console.log('⚠️ Quick geolocation test failed - this is the timeout issue');
    }
  } catch (error) {
    results.tests.push({
      name: 'Quick Geolocation Test',
      passed: false,
      details: `Test error: ${error}`
    });
    console.log('❌ Quick geolocation test error:', error);
  }

  // Test 3: Check permissions
  console.log('📋 Test 3: Checking geolocation permissions...');
  try {
    if ('permissions' in navigator) {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      const permissionOK = permission.state !== 'denied';
      
      results.tests.push({
        name: 'Geolocation Permissions',
        passed: permissionOK,
        details: `Permission state: ${permission.state}`
      });

      console.log(`📍 Permission state: ${permission.state}`);
      if (permission.state === 'denied') {
        console.log('❌ Permission denied - user needs to enable location access');
      }
    } else {
      results.tests.push({
        name: 'Geolocation Permissions',
        passed: true,
        details: 'Permissions API not available (legacy browser)'
      });
      console.log('⚠️ Permissions API not available');
    }
  } catch (error) {
    results.tests.push({
      name: 'Geolocation Permissions',
      passed: false,
      details: `Permission check error: ${error}`
    });
    console.log('❌ Permission check error:', error);
  }

  // Calculate summary
  results.summary.total = results.tests.length;
  results.summary.passed = results.tests.filter(t => t.passed).length;
  results.summary.failed = results.summary.total - results.summary.passed;

  console.log('================================================');
  console.log('📊 VALIDATION SUMMARY:');
  console.log(`✅ Passed: ${results.summary.passed}/${results.summary.total}`);
  console.log(`❌ Failed: ${results.summary.failed}/${results.summary.total}`);
  console.log('================================================');

  // Provide recommendations
  if (results.summary.failed > 0) {
    console.log('💡 RECOMMENDATIONS:');
    
    if (!fixFunctionsAvailable) {
      console.log('1. Refresh the page to load fix functions');
    }
    
    const permissionTest = results.tests.find(t => t.name === 'Geolocation Permissions');
    if (permissionTest && !permissionTest.passed) {
      console.log('2. Enable location permissions in browser (click lock icon in address bar)');
    }
    
    const geoTest = results.tests.find(t => t.name === 'Quick Geolocation Test');
    if (geoTest && !geoTest.passed) {
      console.log('3. Try: await debugAndFixTimeout() to apply comprehensive fix');
      console.log('4. Move closer to window or outdoors for better GPS signal');
    }
  } else {
    console.log('🎉 All tests passed! Geolocation should be working.');
  }

  return results;
};

/**
 * Run immediate fix if validation fails
 */
const autoFixIfNeeded = async () => {
  console.log('🔄 RUNNING AUTO-FIX IF NEEDED...');
  
  const validation = await validateTimeoutFixStatus();
  
  if (validation.summary.failed > 0) {
    console.log('🔧 Issues detected, applying automatic fix...');
    
    try {
      // Try to run the fix function if available
      if (typeof (window as any).debugAndFixTimeout === 'function') {
        const fixResult = await (window as any).debugAndFixTimeout();
        console.log('✅ Auto-fix completed:', fixResult.summary);
        return { success: true, message: 'Auto-fix applied', result: fixResult };
      } else {
        console.log('❌ Fix functions not available - manual intervention needed');
        return { success: false, message: 'Fix functions not loaded' };
      }
    } catch (error) {
      console.log('❌ Auto-fix failed:', error);
      return { success: false, message: 'Auto-fix failed', error };
    }
  } else {
    console.log('✅ No fix needed - all tests passed');
    return { success: true, message: 'No fix needed' };
  }
};

// Make functions available globally
if (typeof window !== 'undefined') {
  (window as any).validateTimeoutFixStatus = validateTimeoutFixStatus;
  (window as any).autoFixIfNeeded = autoFixIfNeeded;
  
  console.log('🔧 Timeout fix validation tools loaded!');
  console.log('💡 Run: await autoFixIfNeeded() for automatic diagnosis and fix');
}

export { validateTimeoutFixStatus, autoFixIfNeeded };
