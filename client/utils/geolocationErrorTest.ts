/**
 * Test utility to validate geolocation error handling
 * This helps ensure that geolocation errors are properly formatted and logged
 */

import { 
  getGeolocationErrorDetails, 
  getGeolocationErrorMessage, 
  getGeolocationErrorHelp 
} from './geolocationUtils';

// Mock GeolocationPositionError for testing
class MockGeolocationPositionError {
  code: number;
  message: string;
  PERMISSION_DENIED = 1;
  POSITION_UNAVAILABLE = 2;
  TIMEOUT = 3;

  constructor(code: number, message: string) {
    this.code = code;
    this.message = message;
  }
}

export const testGeolocationErrorHandling = () => {
  console.log('🧪 Testing Geolocation Error Handling...\n');

  // Test different error types
  const testCases = [
    { code: 1, message: 'User denied the request for Geolocation.' },
    { code: 2, message: 'Location information is unavailable.' },
    { code: 3, message: 'The request to get user location timed out.' },
    { code: 999, message: 'Unknown error occurred.' }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: Error Code ${testCase.code}`);
    
    const mockError = new MockGeolocationPositionError(testCase.code, testCase.message) as GeolocationPositionError;
    
    try {
      // Test error details extraction
      const errorDetails = getGeolocationErrorDetails(mockError);
      console.log('✅ Error Details:', errorDetails);
      
      // Test user-friendly message
      const errorMessage = getGeolocationErrorMessage(mockError);
      console.log('✅ User Message:', errorMessage);
      
      // Test error help
      const errorHelp = getGeolocationErrorHelp(mockError);
      console.log('✅ Error Help:', errorHelp);
      
      // Ensure no "[object Object]" appears in any output
      const allOutputs = [
        JSON.stringify(errorDetails),
        errorMessage,
        JSON.stringify(errorHelp)
      ];
      
      const hasObjectObject = allOutputs.some(output => 
        output.includes('[object Object]')
      );
      
      if (hasObjectObject) {
        console.error('❌ Found "[object Object]" in output!');
      } else {
        console.log('✅ No "[object Object]" found in output');
      }
      
    } catch (error) {
      console.error('❌ Error in test:', error);
    }
    
    console.log('---\n');
  });

  console.log('✅ Geolocation error handling test completed!');
};

// Auto-run test in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // Run test after a short delay to avoid interfering with app initialization
  setTimeout(testGeolocationErrorHandling, 2000);
}
