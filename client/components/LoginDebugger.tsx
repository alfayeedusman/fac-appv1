import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { neonDbClient } from '@/services/neonDatabaseService';
import { authService } from '@/services/authService';
import { Bug, Database, User, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function LoginDebugger() {
  const [debugResults, setDebugResults] = useState<any>({});
  const [isDebugging, setIsDebugging] = useState(false);

  const runFullDebug = async () => {
    setIsDebugging(true);
    const results: any = {};

    try {
      // Step 1: Test database connection
      console.log('🔍 Step 1: Testing database connection...');
      try {
        const dbConnection = await neonDbClient.testConnection();
        results.dbConnection = {
          success: dbConnection.connected,
          data: dbConnection,
          error: null
        };
        console.log('✅ Database connection result:', dbConnection);
      } catch (error: any) {
        results.dbConnection = {
          success: false,
          data: null,
          error: error.message
        };
        console.error('❌ Database connection failed:', error);
      }

      // Step 2: Test API endpoint accessibility
      console.log('🔍 Step 2: Testing API endpoint...');
      try {
        const response = await fetch('/api/neon/test', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          const data = await response.json();
          results.apiTest = {
            success: true,
            data: data,
            status: response.status,
            error: null
          };
          console.log('✅ API test result:', data);
        } else {
          const errorText = await response.text();
          results.apiTest = {
            success: false,
            data: null,
            status: response.status,
            error: `HTTP ${response.status}: ${errorText}`
          };
          console.error('❌ API test failed:', response.status, errorText);
        }
      } catch (error: any) {
        results.apiTest = {
          success: false,
          data: null,
          status: 0,
          error: error.message
        };
        console.error('❌ API endpoint error:', error);
      }

      // Step 3: Test login endpoint directly
      console.log('🔍 Step 3: Testing login endpoint...');
      try {
        const response = await fetch('/api/neon/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@fayeedautocare.com',
            password: 'admin123'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          results.loginEndpoint = {
            success: data.success || false,
            data: data,
            status: response.status,
            error: data.error || null
          };
          console.log('✅ Login endpoint result:', data);
        } else {
          const errorText = await response.text();
          results.loginEndpoint = {
            success: false,
            data: null,
            status: response.status,
            error: `HTTP ${response.status}: ${errorText}`
          };
          console.error('❌ Login endpoint failed:', response.status, errorText);
        }
      } catch (error: any) {
        results.loginEndpoint = {
          success: false,
          data: null,
          status: 0,
          error: error.message
        };
        console.error('❌ Login endpoint error:', error);
      }

      // Step 4: Test neonDbClient.login method
      console.log('🔍 Step 4: Testing neonDbClient.login...');
      try {
        const loginResult = await neonDbClient.login('admin@fayeedautocare.com', 'admin123');
        results.neonClientLogin = {
          success: loginResult.success,
          data: loginResult,
          error: loginResult.error || null
        };
        console.log('✅ NeonDbClient login result:', loginResult);
      } catch (error: any) {
        results.neonClientLogin = {
          success: false,
          data: null,
          error: error.message
        };
        console.error('❌ NeonDbClient login error:', error);
      }

      // Step 5: Test authService.login method
      console.log('🔍 Step 5: Testing authService.login...');
      try {
        const authResult = await authService.login({
          email: 'admin@fayeedautocare.com',
          password: 'admin123'
        });
        results.authServiceLogin = {
          success: authResult.success,
          data: authResult,
          error: authResult.error || null
        };
        console.log('✅ AuthService login result:', authResult);
      } catch (error: any) {
        results.authServiceLogin = {
          success: false,
          data: null,
          error: error.message
        };
        console.error('❌ AuthService login error:', error);
      }

      // Step 6: Check neonDbClient connection state
      console.log('🔍 Step 6: Checking neonDbClient state...');
      results.clientState = {
        isConnected: (neonDbClient as any).isConnected,
        baseUrl: (neonDbClient as any).baseUrl
      };

    } catch (error: any) {
      console.error('❌ Debug process failed:', error);
      results.debugError = error.message;
    }

    setDebugResults(results);
    setIsDebugging(false);
    
    console.log('🎯 Final debug results:', results);
  };

  const renderTestResult = (title: string, result: any) => {
    if (!result) return null;

    const isSuccess = result.success;
    const Icon = isSuccess ? CheckCircle : XCircle;
    const variant = isSuccess ? "default" : "destructive";

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Icon className={`h-4 w-4 ${isSuccess ? 'text-green-500' : 'text-red-500'}`} />
            {title}
            {result.status && (
              <Badge variant={result.status < 400 ? "default" : "destructive"}>
                {result.status}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {result.error && (
            <Alert variant={variant} className="mb-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {result.error}
              </AlertDescription>
            </Alert>
          )}
          
          {result.data && (
            <div className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
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
          <Bug className="h-8 w-8 text-red-500" />
          Login Debugger
        </h1>
        <p className="text-muted-foreground">
          Comprehensive debugging for the database login issue
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Debug Login Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={runFullDebug}
            disabled={isDebugging}
            className="w-full"
            size="lg"
          >
            {isDebugging ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Debug Tests...
              </>
            ) : (
              <>
                <Bug className="h-4 w-4 mr-2" />
                Run Full Debug
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {Object.keys(debugResults).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Debug Results</h2>
          
          {renderTestResult("1. Database Connection", debugResults.dbConnection)}
          {renderTestResult("2. API Endpoint Test", debugResults.apiTest)}
          {renderTestResult("3. Login Endpoint", debugResults.loginEndpoint)}
          {renderTestResult("4. NeonDbClient Login", debugResults.neonClientLogin)}
          {renderTestResult("5. AuthService Login", debugResults.authServiceLogin)}
          
          {debugResults.clientState && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">NeonDbClient State</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  <div>Is Connected: <Badge>{debugResults.clientState.isConnected ? 'Yes' : 'No'}</Badge></div>
                  <div>Base URL: <code>{debugResults.clientState.baseUrl}</code></div>
                </div>
              </CardContent>
            </Card>
          )}

          {debugResults.debugError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Debug Error: {debugResults.debugError}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
