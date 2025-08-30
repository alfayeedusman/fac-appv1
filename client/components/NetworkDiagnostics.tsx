import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Wifi, Server, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function NetworkDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: any = {};

    // Test 1: Basic network connectivity
    console.log('🔍 Testing basic network connectivity...');
    try {
      const response = await fetch('/api/health', { method: 'GET' });
      results.health = {
        success: response.ok,
        status: response.status,
        data: response.ok ? await response.json() : null,
        error: response.ok ? null : `HTTP ${response.status}`
      };
    } catch (error: any) {
      results.health = {
        success: false,
        status: 0,
        data: null,
        error: error.message
      };
    }

    // Test 2: Neon database test endpoint
    console.log('🔍 Testing Neon database endpoint...');
    try {
      const response = await fetch('/api/neon/test', { method: 'GET' });
      results.neonTest = {
        success: response.ok,
        status: response.status,
        data: response.ok ? await response.json() : null,
        error: response.ok ? null : `HTTP ${response.status}`
      };
    } catch (error: any) {
      results.neonTest = {
        success: false,
        status: 0,
        data: null,
        error: error.message
      };
    }

    // Test 3: Database stats endpoint
    console.log('🔍 Testing database stats endpoint...');
    try {
      const response = await fetch('/api/neon/stats', { method: 'GET' });
      results.neonStats = {
        success: response.ok,
        status: response.status,
        data: response.ok ? await response.json() : null,
        error: response.ok ? null : `HTTP ${response.status}`
      };
    } catch (error: any) {
      results.neonStats = {
        success: false,
        status: 0,
        data: null,
        error: error.message
      };
    }

    // Test 4: Login endpoint (with dummy data)
    console.log('🔍 Testing login endpoint...');
    try {
      const response = await fetch('/api/neon/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' })
      });
      results.loginEndpoint = {
        success: true, // We expect this to fail with 401, but endpoint should be reachable
        status: response.status,
        data: response.status === 401 ? { message: 'Endpoint reachable' } : await response.json(),
        error: null
      };
    } catch (error: any) {
      results.loginEndpoint = {
        success: false,
        status: 0,
        data: null,
        error: error.message
      };
    }

    // Test 5: SuperAdmin login
    console.log('🔍 Testing SuperAdmin login...');
    try {
      const response = await fetch('/api/neon/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'superadmin@fayeedautocare.com', 
          password: 'SuperAdmin2025!' 
        })
      });
      results.superAdminLogin = {
        success: response.ok,
        status: response.status,
        data: response.ok ? await response.json() : await response.text(),
        error: response.ok ? null : `HTTP ${response.status}`
      };
    } catch (error: any) {
      results.superAdminLogin = {
        success: false,
        status: 0,
        data: null,
        error: error.message
      };
    }

    setDiagnostics(results);
    setIsRunning(false);

    // Show summary toast
    const failedTests = Object.values(results).filter((test: any) => !test.success).length;
    const totalTests = Object.keys(results).length;
    
    if (failedTests === 0) {
      toast({
        title: '✅ All Tests Passed!',
        description: `${totalTests} network tests completed successfully`,
      });
    } else {
      toast({
        title: '⚠️ Some Tests Failed',
        description: `${failedTests}/${totalTests} tests failed. Check results below.`,
        variant: 'destructive',
      });
    }
  };

  const renderTestResult = (testName: string, result: any) => {
    if (!result) return null;

    const Icon = result.success ? CheckCircle : XCircle;
    const variant = result.success ? "default" : "destructive";

    return (
      <Card key={testName} className="mb-3">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${result.success ? 'text-green-500' : 'text-red-500'}`} />
              {testName}
            </div>
            <div className="flex gap-2">
              {result.status && (
                <Badge variant={result.status < 400 ? "default" : "destructive"}>
                  {result.status}
                </Badge>
              )}
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "PASS" : "FAIL"}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {result.error && (
            <Alert variant={variant} className="mb-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {result.error}
              </AlertDescription>
            </Alert>
          )}
          
          {result.data && (
            <div className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-20">
              <pre>{JSON.stringify(result.data, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Wifi className="h-8 w-8 text-blue-500" />
          Network Diagnostics
        </h1>
        <p className="text-muted-foreground">
          Test all API endpoints and network connectivity
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Run Network Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 mr-2" />
                Run Full Network Diagnostic
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {Object.keys(diagnostics).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Test Results</h2>
          
          {renderTestResult("Health Check (/api/health)", diagnostics.health)}
          {renderTestResult("Database Test (/api/neon/test)", diagnostics.neonTest)}
          {renderTestResult("Database Stats (/api/neon/stats)", diagnostics.neonStats)}
          {renderTestResult("Login Endpoint (/api/neon/auth/login)", diagnostics.loginEndpoint)}
          {renderTestResult("SuperAdmin Login Test", diagnostics.superAdminLogin)}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div>Total Tests: {Object.keys(diagnostics).length}</div>
                <div>Passed: {Object.values(diagnostics).filter((test: any) => test.success).length}</div>
                <div>Failed: {Object.values(diagnostics).filter((test: any) => !test.success).length}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
