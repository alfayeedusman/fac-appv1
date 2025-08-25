import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  runCacheDiagnostic, 
  clearCacheAndReload, 
  formatAnyError,
  showSafeErrorToast 
} from '@/utils/globalErrorHandler';
import { 
  testApiConnectivity, 
  getNetworkDiagnostics,
  logNetworkDiagnostics 
} from '@/utils/networkDiagnostics';
import { 
  getCurrentPositionAsync,
  getGeolocationErrorDetails,
  isGeolocationSupported,
  isGeolocationContextSecure 
} from '@/utils/geolocationUtils';
import { formatError } from '@/lib/errorUtils';
import { 
  RefreshCw, 
  Trash2, 
  MapPin, 
  Wifi, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

export default function DiagnosticsPage() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);

  const runAllDiagnostics = async () => {
    setIsRunning(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      browser: {
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        geolocationSupported: isGeolocationSupported(),
        isSecureContext: isGeolocationContextSecure(),
      },
      cache: {},
      network: {},
      geolocation: {},
      errors: []
    };

    try {
      // Cache diagnostics
      console.log('🔍 Running cache diagnostics...');
      runCacheDiagnostic();
      results.cache.status = 'completed';

      // Network diagnostics  
      console.log('🌐 Running network diagnostics...');
      const networkTest = await testApiConnectivity();
      const networkDiag = getNetworkDiagnostics();
      results.network = { ...networkTest, ...networkDiag };

      // Geolocation diagnostics
      console.log('📍 Running geolocation diagnostics...');
      try {
        if (isGeolocationSupported()) {
          const position = await getCurrentPositionAsync({ timeout: 5000 });
          results.geolocation = {
            status: 'success',
            latitude: position.lat,
            longitude: position.lng,
            accuracy: position.accuracy,
          };
        } else {
          results.geolocation = {
            status: 'not_supported',
            message: 'Geolocation not supported in this browser'
          };
        }
      } catch (error) {
        results.geolocation = {
          status: 'error',
          message: formatAnyError(error),
          details: error
        };
      }

      // Test error formatting utilities
      console.log('🛠️ Testing error formatting utilities...');
      const testError = new Error('Test error message');
      const formattedError = formatError(testError);
      results.errorFormatting = {
        testPassed: formattedError === 'Test error message',
        result: formattedError
      };

      setDiagnosticResults(results);
      
      toast({
        title: "Diagnostics Complete",
        description: "All diagnostic tests have been completed. Check results below.",
      });

    } catch (error) {
      results.errors.push(formatAnyError(error));
      setDiagnosticResults(results);
      
      showSafeErrorToast(error, "Diagnostic Error", toast);
    } finally {
      setIsRunning(false);
    }
  };

  const testGeolocationError = () => {
    // Simulate a geolocation error to test our error handling
    const mockError = {
      code: 3,
      message: 'Position acquisition timed out',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    } as GeolocationPositionError;

    try {
      const errorDetails = getGeolocationErrorDetails(mockError);
      const formattedError = formatAnyError(mockError);

      console.log('🧪 Test geolocation error formatting:');
      console.log('Error details:', JSON.stringify(errorDetails));
      console.log('Formatted error:', formattedError);

      toast({
        title: "Geolocation Error Test",
        description: formattedError,
        variant: "destructive",
      });
    } catch (error) {
      showSafeErrorToast(error, "Test Error", toast);
    }
  };

  const testTimeoutScenario = async () => {
    setIsRunning(true);

    try {
      toast({
        title: "Testing Timeout Handling",
        description: "Testing GPS with very short timeout to simulate timeout scenario...",
      });

      // Test with very short timeout to force timeout error
      const position = await getCurrentPositionAsync({
        timeout: 1000, // 1 second - very short to force timeout
        enableHighAccuracy: true
      });

      toast({
        title: "Location Acquired",
        description: `Got location despite short timeout: ±${Math.round(position.accuracy)}m`,
      });

    } catch (error) {
      const formattedError = formatAnyError(error);
      console.log('🧪 Timeout test result:', formattedError);

      toast({
        title: "Timeout Test Result",
        description: formattedError,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
      case true:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
      case 'failed':
      case false:
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string | boolean) => {
    if (status === true || status === 'success' || status === 'completed') {
      return <Badge className="bg-green-100 text-green-800">✓ Good</Badge>;
    } else if (status === false || status === 'error' || status === 'failed') {
      return <Badge className="bg-red-100 text-red-800">✗ Issue</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">⚠ Warning</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Diagnostics</h1>
            <p className="text-muted-foreground">
              Debug and troubleshoot geolocation and network issues
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={testGeolocationError}
              variant="outline"
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Test Error Format
            </Button>
            <Button
              onClick={testTimeoutScenario}
              variant="outline"
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Test Timeout Handling
            </Button>
            <Button
              onClick={runAllDiagnostics}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Run Diagnostics
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Quick Fixes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button 
              onClick={clearCacheAndReload}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cache & Reload
            </Button>
            <Button 
              onClick={() => logNetworkDiagnostics()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Wifi className="h-4 w-4" />
              Test Network
            </Button>
          </CardContent>
        </Card>

        {/* Diagnostic Results */}
        {diagnosticResults && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Browser Status */}
            <Card>
              <CardHeader>
                <CardTitle>Browser Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Online Status:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnosticResults.browser.online)}
                    {getStatusBadge(diagnosticResults.browser.online)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Geolocation Support:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnosticResults.browser.geolocationSupported)}
                    {getStatusBadge(diagnosticResults.browser.geolocationSupported)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Secure Context:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnosticResults.browser.isSecureContext)}
                    {getStatusBadge(diagnosticResults.browser.isSecureContext)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Status */}
            <Card>
              <CardHeader>
                <CardTitle>Network Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>API Connection:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnosticResults.network.success)}
                    {getStatusBadge(diagnosticResults.network.success)}
                  </div>
                </div>
                {diagnosticResults.network.responseTime && (
                  <div className="flex items-center justify-between">
                    <span>Response Time:</span>
                    <Badge variant="outline">
                      {diagnosticResults.network.responseTime}ms
                    </Badge>
                  </div>
                )}
                {diagnosticResults.network.error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                    {diagnosticResults.network.error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Geolocation Status */}
            <Card>
              <CardHeader>
                <CardTitle>Geolocation Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnosticResults.geolocation.status)}
                    {getStatusBadge(diagnosticResults.geolocation.status)}
                  </div>
                </div>
                {diagnosticResults.geolocation.latitude && (
                  <div className="text-sm bg-green-50 p-3 rounded">
                    <strong>Location:</strong> {diagnosticResults.geolocation.latitude.toFixed(6)}, {diagnosticResults.geolocation.longitude.toFixed(6)}
                    <br />
                    <strong>Accuracy:</strong> ±{Math.round(diagnosticResults.geolocation.accuracy)}m
                  </div>
                )}
                {diagnosticResults.geolocation.message && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                    {diagnosticResults.geolocation.message}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error Formatting Test */}
            <Card>
              <CardHeader>
                <CardTitle>Error Formatting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Format Test:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnosticResults.errorFormatting.testPassed)}
                    {getStatusBadge(diagnosticResults.errorFormatting.testPassed)}
                  </div>
                </div>
                <div className="text-sm bg-gray-50 p-3 rounded font-mono">
                  Result: "{diagnosticResults.errorFormatting.result}"
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Debug Info */}
        {diagnosticResults && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-64">
                {JSON.stringify(diagnosticResults, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
