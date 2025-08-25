import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDatabaseContext } from './DatabaseProvider';
import DatabaseService from '@/services/databaseService';
import { CheckCircle, XCircle, Loader2, Database, Wifi, WifiOff } from 'lucide-react';

export function DatabaseConnectionTest() {
  const { isConnected, isLoading, healthCheck } = useDatabaseContext();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const results: any[] = [];

    // Test 1: Health Check
    try {
      const health = await DatabaseService.healthCheck();
      results.push({
        test: 'Health Check',
        status: 'success',
        result: health,
        message: `Status: ${health.status}`
      });
    } catch (error: any) {
      results.push({
        test: 'Health Check',
        status: 'error',
        result: null,
        message: error.message
      });
    }

    // Test 2: OTP Send (Demo)
    try {
      const otpResult = await DatabaseService.sendOTP('test@example.com', 'signup');
      results.push({
        test: 'OTP Send',
        status: otpResult.success ? 'success' : 'error',
        result: otpResult,
        message: otpResult.message
      });
    } catch (error: any) {
      results.push({
        test: 'OTP Send',
        status: 'error',
        result: null,
        message: error.message
      });
    }

    // Test 3: OTP Verify (Demo)
    try {
      const verifyResult = await DatabaseService.verifyOTP('test@example.com', '123456', 'signup');
      results.push({
        test: 'OTP Verify',
        status: verifyResult.success ? 'success' : 'error',
        result: verifyResult,
        message: verifyResult.message || verifyResult.error
      });
    } catch (error: any) {
      results.push({
        test: 'OTP Verify',
        status: 'error',
        result: null,
        message: error.message
      });
    }

    setTestResults(results);
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isLoading ? 'Checking...' : isConnected ? 'Backend Connected' : 'Offline Mode'}
          </Badge>
        </div>

        {/* Test Button */}
        <Button 
          onClick={runTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Connection Tests'
          )}
        </Button>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Test Results:</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{result.test}</span>
                </div>
                <div className="text-sm text-muted-foreground max-w-md text-right">
                  {result.message}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          <p><strong>ℹ️ How it works:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>If backend is running: Uses real API endpoints</li>
            <li>If backend is offline: Uses demo/fallback mode</li>
            <li>Demo OTP code: <code className="bg-background px-1 rounded">123456</code></li>
            <li>All data is stored locally in demo mode</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default DatabaseConnectionTest;
