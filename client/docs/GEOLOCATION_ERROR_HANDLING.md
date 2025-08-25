# Geolocation Error Handling Guide

This guide explains how to properly handle geolocation errors to avoid the common "[object Object]" error that occurs when JavaScript objects are improperly logged or converted to strings.

## The Problem

When geolocation errors occur, they are instances of `GeolocationPositionError` which contain structured data. If these objects are logged directly or converted to strings improperly, they appear as "[object Object]" instead of meaningful error information.

## ❌ Incorrect Error Handling

```typescript
// DON'T DO THIS - Causes "[object Object]" error
navigator.geolocation.getCurrentPosition(
  (position) => { /* success */ },
  (error) => {
    console.error('Geolocation error:', error); // ❌ Logs [object Object]
    console.error('Geolocation error details:', {
      code: error.code,
      message: error.message,
      // ... other properties
    }); // ❌ Object may be stringified as [object Object]
  }
);
```

## ✅ Correct Error Handling

```typescript
import { 
  getGeolocationErrorDetails, 
  getGeolocationErrorMessage, 
  getGeolocationErrorHelp 
} from '@/utils/geolocationUtils';

navigator.geolocation.getCurrentPosition(
  (position) => { /* success */ },
  (error) => {
    // ✅ Proper error logging
    const errorDetails = getGeolocationErrorDetails(error);
    console.error('Geolocation error:', errorDetails);
    
    // ✅ User-friendly error message
    const errorMessage = getGeolocationErrorMessage(error);
    toast({
      title: "Location Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    // ✅ Detailed error help for users
    const errorHelp = getGeolocationErrorHelp(error);
    toast({
      title: errorHelp.title,
      description: errorHelp.description,
      variant: "destructive",
    });
  }
);
```

## Error Types and Codes

| Code | Type | Description |
|------|------|-------------|
| 1 | PERMISSION_DENIED | User denied location access |
| 2 | POSITION_UNAVAILABLE | Location information is unavailable |
| 3 | TIMEOUT | Location request timed out |
| Other | UNKNOWN | Unknown error occurred |

## Utility Functions

### `getGeolocationErrorDetails(error: GeolocationPositionError)`

Returns a structured error object with:
- `code`: Error code number
- `message`: Error message string
- `type`: Human-readable error type

### `getGeolocationErrorMessage(error: GeolocationPositionError)`

Returns a user-friendly error message suitable for displaying to users.

### `getGeolocationErrorHelp(error: GeolocationPositionError)`

Returns detailed error information with troubleshooting tips:
- `title`: Error title
- `description`: Error description
- `helpText`: Optional troubleshooting instructions

## Best Practices

### 1. Always Use Error Utilities
```typescript
// ✅ Good
const errorDetails = getGeolocationErrorDetails(error);
console.error('Location error:', errorDetails);

// ❌ Bad
console.error('Location error:', error);
```

### 2. Provide User-Friendly Messages
```typescript
// ✅ Good
const errorHelp = getGeolocationErrorHelp(error);
toast({
  title: errorHelp.title,
  description: errorHelp.description,
  variant: "destructive",
});

// ❌ Bad
toast({
  title: "Error",
  description: error.toString(), // May show [object Object]
  variant: "destructive",
});
```

### 3. Handle Different Error Types Appropriately
```typescript
const handleLocationError = (error: GeolocationPositionError) => {
  const errorDetails = getGeolocationErrorDetails(error);
  
  switch (error.code) {
    case 1: // PERMISSION_DENIED
      // Show permission help
      showPermissionHelp();
      break;
    case 2: // POSITION_UNAVAILABLE
      // Suggest GPS troubleshooting
      showGPSTroubleshooting();
      break;
    case 3: // TIMEOUT
      // Retry after delay
      setTimeout(() => retryLocation(), 5000);
      break;
    default:
      // Generic error handling
      showGenericError(errorDetails.message);
      break;
  }
};
```

### 4. Check Browser Support
```typescript
import { isGeolocationSupported, isGeolocationContextSecure } from '@/utils/geolocationUtils';

if (!isGeolocationSupported()) {
  console.warn('Geolocation is not supported');
  return;
}

if (!isGeolocationContextSecure()) {
  console.warn('Geolocation requires HTTPS');
  return;
}
```

## ⚠️ Important: Updated Error Format

**Note**: As of the latest update, the geolocation utilities (`getCurrentPositionAsync` and `watchPositionAsync`) now return properly formatted Error objects instead of raw `GeolocationPositionError` objects to prevent "[object Object]" logging issues.

The returned errors have the following structure:
- `error.name`: Set to "GeolocationError"
- `error.message`: Human-readable error message
- `error.details`: Formatted error details object (same as `getGeolocationErrorDetails()`)
- `error.originalError`: Original GeolocationPositionError for advanced handling

This means errors will now always stringify properly when logged or used in templates.

### 5. Use Async/Await Pattern
```typescript
import { getCurrentPositionAsync } from '@/utils/geolocationUtils';

try {
  const position = await getCurrentPositionAsync();
  console.log('Location:', position);
} catch (error) {
  // Error is now a properly formatted Error object
  console.error('Location error:', error.message); // Safe to log directly

  // For detailed information, access error.details or use the original error
  if (error.name === 'GeolocationError' && error.originalError) {
    const errorDetails = getGeolocationErrorDetails(error.originalError);
    console.error('Detailed error:', errorDetails);
  }
}
```

## Testing Error Handling

Use the debug page to test different error scenarios:

```typescript
// Navigate to /geolocation-debug in your app
// Test different error conditions:
// - Block location permission
// - Disable GPS
// - Use slow network
// - Access via HTTP
```

## Migration Guide

If you have existing geolocation code that might be causing "[object Object]" errors:

1. **Import the utilities**:
```typescript
import { 
  getGeolocationErrorDetails,
  getGeolocationErrorMessage,
  getGeolocationErrorHelp,
  isGeolocationSupported,
  isGeolocationContextSecure
} from '@/utils/geolocationUtils';
```

2. **Replace direct error logging**:
```typescript
// Replace this:
console.error('Geolocation error:', error);

// With this:
const errorDetails = getGeolocationErrorDetails(error);
console.error('Geolocation error:', errorDetails);
```

3. **Replace direct error display**:
```typescript
// Replace this:
alert(`Error: ${error}`);

// With this:
const errorMessage = getGeolocationErrorMessage(error);
alert(errorMessage);
```

4. **Add proper error handling**:
```typescript
// Replace basic error callback:
(error) => {
  console.error('Error:', error);
}

// With comprehensive error handling:
(error) => {
  const errorDetails = getGeolocationErrorDetails(error);
  const errorHelp = getGeolocationErrorHelp(error);
  
  console.error('Geolocation error:', errorDetails);
  
  toast({
    title: errorHelp.title,
    description: errorHelp.description,
    variant: "destructive",
  });
  
  // Handle specific error types
  if (error.code === 3) { // TIMEOUT
    setTimeout(() => retryLocation(), 5000);
  }
}
```

## Common Issues and Solutions

### Issue: "[object Object]" in console logs
**Solution**: Use `getGeolocationErrorDetails()` before logging

### Issue: Generic error messages for users
**Solution**: Use `getGeolocationErrorHelp()` for detailed user guidance

### Issue: No retry logic for timeouts
**Solution**: Check error code and implement retry logic for timeouts

### Issue: No permission status checking
**Solution**: Use browser permission API to check status before requesting location

By following this guide, you can ensure that geolocation errors are handled properly and users receive meaningful error messages instead of "[object Object]".
