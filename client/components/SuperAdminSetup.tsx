import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { neonDbClient } from '@/services/neonDatabaseService';
import { authService } from '@/services/authService';
import { Crown, User, CheckCircle, XCircle, Database, Key } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminSetup() {
  const navigate = useNavigate();
  const [isSetup, setIsSetup] = useState(false);
  const [setupResult, setSetupResult] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({
    email: 'superadmin@fayeedautocare.com',
    password: 'SuperAdmin2025!'
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const setupSuperAdmin = async () => {
    setIsSetup(true);
    setSetupResult(null);

    try {
      console.log('🔧 Setting up SuperAdmin...');
      
      // Step 1: Initialize database and run migrations
      const initResult = await neonDbClient.initialize();
      
      if (!initResult) {
        setSetupResult({
          success: false,
          error: 'Failed to initialize database'
        });
        return;
      }

      // Step 2: Test connection
      const connectionResult = await neonDbClient.testConnection();
      
      setSetupResult({
        success: true,
        message: 'SuperAdmin setup completed successfully!',
        details: {
          dbInitialized: initResult,
          dbConnected: connectionResult.connected,
          stats: connectionResult.stats
        }
      });
      
      toast({
        title: '✅ SuperAdmin Ready!',
        description: 'Database initialized and SuperAdmin user created',
      });

    } catch (error: any) {
      setSetupResult({
        success: false,
        error: error.message || 'Failed to setup SuperAdmin'
      });
    } finally {
      setIsSetup(false);
    }
  };

  const testSuperAdminLogin = async () => {
    setIsLoggingIn(true);
    
    try {
      const result = await authService.login({
        email: loginForm.email,
        password: loginForm.password
      });
      
      if (result.success && result.user) {
        toast({
          title: '🎉 Login Successful!',
          description: `Welcome ${result.user.fullName}!`,
        });
        
        // Redirect to admin dashboard
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 1000);
      } else {
        toast({
          title: '❌ Login Failed',
          description: result.error || 'Invalid credentials',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: '❌ Login Error',
        description: error.message || 'Login failed',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Crown className="h-8 w-8 text-yellow-500" />
          SuperAdmin Setup
        </h1>
        <p className="text-muted-foreground">
          Initialize database and create SuperAdmin credentials
        </p>
      </div>

      {/* Setup Database */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Initialization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will create the SuperAdmin user and fix all database issues.
          </p>

          <Button
            onClick={setupSuperAdmin}
            disabled={isSetup}
            className="w-full"
            size="lg"
          >
            {isSetup ? (
              <>
                <Database className="h-4 w-4 mr-2 animate-spin" />
                Setting up Database...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Initialize Database & Create SuperAdmin
              </>
            )}
          </Button>

          {setupResult && (
            <Alert variant={setupResult.success ? "default" : "destructive"}>
              {setupResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {setupResult.success ? (
                  <div>
                    <div className="font-semibold">{setupResult.message}</div>
                    {setupResult.details && (
                      <div className="text-xs mt-2 space-y-1">
                        <div>DB Connected: <Badge variant="outline">{setupResult.details.dbConnected ? 'Yes' : 'No'}</Badge></div>
                        {setupResult.details.stats && (
                          <div>Users: {setupResult.details.stats.totalUsers}, Bookings: {setupResult.details.stats.totalBookings}</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold">Setup Failed</div>
                    <div className="text-xs mt-1">{setupResult.error}</div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* SuperAdmin Login */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            SuperAdmin Login
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="font-mono"
              />
            </div>
          </div>

          <Button
            onClick={testSuperAdminLogin}
            disabled={isLoggingIn}
            className="w-full"
            variant="outline"
          >
            {isLoggingIn ? (
              <>
                <User className="h-4 w-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <Crown className="h-4 w-4 mr-2" />
                Login as SuperAdmin
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Credentials Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">SuperAdmin Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">superadmin@fayeedautocare.com</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Password:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">SuperAdmin2025!</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <Badge>SuperAdmin</Badge>
            </div>
          </div>
          
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription className="text-xs">
              After successful login, you'll be redirected to the Admin Dashboard with full SuperAdmin privileges.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
