import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { neonDbClient } from '@/services/neonDatabaseService';
import { authService } from '@/services/authService';
import { Database, CheckCircle, XCircle, AlertCircle, RefreshCw, User, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function NeonConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    loading: boolean;
    stats?: any;
    error?: string;
  }>({
    connected: false,
    loading: true,
  });

  const [loginTest, setLoginTest] = useState<{
    loading: boolean;
    success?: boolean;
    error?: string;
    user?: any;
  }>({
    loading: false,
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionStatus({ connected: false, loading: true });
    
    try {
      const result = await neonDbClient.testConnection();
      
      if (result.connected) {
        setConnectionStatus({
          connected: true,
          loading: false,
          stats: result.stats,
        });
        
        toast({
          title: '✅ Connection Successful',
          description: 'Neon database is connected and ready!',
        });
      } else {
        setConnectionStatus({
          connected: false,
          loading: false,
          error: 'Database connection failed',
        });
      }
    } catch (error: any) {
      setConnectionStatus({
        connected: false,
        loading: false,
        error: error.message || 'Connection test failed',
      });
    }
  };

  const testLogin = async () => {
    setLoginTest({ loading: true });
    
    try {
      const result = await authService.login({
        email: 'admin@fayeedautocare.com',
        password: 'admin123',
      });
      
      if (result.success && result.user) {
        setLoginTest({
          loading: false,
          success: true,
          user: result.user,
        });
        
        toast({
          title: '✅ Login Successful',
          description: `Logged in as ${result.user.fullName} (${result.user.role})`,
        });
      } else {
        setLoginTest({
          loading: false,
          success: false,
          error: result.error || 'Login failed',
        });
      }
    } catch (error: any) {
      setLoginTest({
        loading: false,
        success: false,
        error: error.message || 'Login test failed',
      });
    }
  };

  const initializeDatabase = async () => {
    try {
      const initialized = await neonDbClient.initialize();
      if (initialized) {
        toast({
          title: '✅ Database Initialized',
          description: 'Neon database has been initialized successfully!',
        });
        await testConnection();
      } else {
        toast({
          title: '❌ Initialization Failed',
          description: 'Failed to initialize Neon database',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: '❌ Initialization Error',
        description: error.message || 'Database initialization failed',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Neon Database Connection Test</h1>
        <p className="text-muted-foreground">
          Test and verify your Neon database connection and authentication
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {connectionStatus.loading ? (
                <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
              ) : connectionStatus.connected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                {connectionStatus.loading
                  ? 'Testing connection...'
                  : connectionStatus.connected
                  ? 'Connected to Neon'
                  : 'Not connected'}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={connectionStatus.loading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Test
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={initializeDatabase}
              >
                Initialize DB
              </Button>
            </div>
          </div>

          {connectionStatus.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{connectionStatus.error}</AlertDescription>
            </Alert>
          )}

          {connectionStatus.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {connectionStatus.stats.totalUsers || 0}
                </div>
                <div className="text-sm text-muted-foreground">Users</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {connectionStatus.stats.totalBookings || 0}
                </div>
                <div className="text-sm text-muted-foreground">Bookings</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {connectionStatus.stats.activeAds || 0}
                </div>
                <div className="text-sm text-muted-foreground">Active Ads</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {connectionStatus.stats.pendingBookings || 0}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Login Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Authentication Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="font-medium">
                Test login with admin credentials
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={testLogin}
              disabled={loginTest.loading || !connectionStatus.connected}
            >
              {loginTest.loading ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <User className="h-4 w-4 mr-1" />
              )}
              Test Login
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <strong>Email:</strong> admin@fayeedautocare.com<br />
            <strong>Password:</strong> admin123
          </div>

          {loginTest.success !== undefined && (
            <Alert variant={loginTest.success ? "default" : "destructive"}>
              {loginTest.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {loginTest.success
                  ? `Login successful! Welcome ${loginTest.user?.fullName} (${loginTest.user?.role})`
                  : loginTest.error || 'Login failed'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Connection Info */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Environment:</span>
            <Badge variant="outline">
              {import.meta.env.MODE || 'development'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Database URL:</span>
            <Badge variant="outline">
              {process.env.NEON_DATABASE_URL ? 'Configured' : 'Not configured'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">API Base:</span>
            <Badge variant="outline">/api/neon</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
