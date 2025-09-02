import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { neonDbClient } from '@/services/neonDatabaseService';
import { authService } from '@/services/authService';
import { Crown, CheckCircle, XCircle, Loader2, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function QuickSuperAdminLogin() {
  const navigate = useNavigate();
  const [isWorking, setIsWorking] = useState(false);
  const [result, setResult] = useState<any>(null);

  const setupAndLogin = async () => {
    setIsWorking(true);
    setResult(null);

    try {
      console.log('🚀 Setting up SuperAdmin and logging in...');

      // Step 1: Initialize database
      console.log('📍 Step 1: Initializing database...');
      const initResult = await neonDbClient.initialize();
      if (!initResult) {
        throw new Error('Database initialization failed');
      }

      // Step 2: Login with SuperAdmin credentials
      console.log('📍 Step 2: Logging in as SuperAdmin...');
      const loginResult = await authService.login({
        email: 'superadmin@fayeedautocare.com',
        password: 'SuperAdmin2025!'
      });

      if (loginResult.success && loginResult.user) {
        setResult({
          success: true,
          user: loginResult.user,
          message: 'SuperAdmin login successful!'
        });

        toast({
          title: '🎉 SuperAdmin Access Granted!',
          description: `Welcome ${loginResult.user.fullName}!`,
        });

        // Redirect to admin dashboard
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 1500);
      } else {
        throw new Error(loginResult.error || 'Login failed after setup');
      }

    } catch (error: any) {
      console.error('Setup and login error:', error);
      setResult({
        success: false,
        error: error.message || 'Setup and login failed'
      });

      toast({
        title: '❌ Setup Failed',
        description: error.message || 'Could not setup SuperAdmin',
        variant: 'destructive',
      });
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            SuperAdmin Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Click below to setup the database and login as SuperAdmin</p>
            <div className="bg-muted p-3 rounded-lg text-left">
              <div className="font-semibold text-foreground mb-1">Credentials:</div>
              <div className="text-xs space-y-1">
                <div>📧 Email: superadmin@fayeedautocare.com</div>
                <div>🔑 Password: SuperAdmin2025!</div>
                <div>👑 Role: SuperAdmin</div>
              </div>
            </div>
          </div>

          <Button
            onClick={setupAndLogin}
            disabled={isWorking}
            className="w-full"
            size="lg"
          >
            {isWorking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up & Logging in...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Setup & Login as SuperAdmin
              </>
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {result.success ? (
                  <div>
                    <div className="font-semibold">{result.message}</div>
                    <div className="text-xs mt-1">
                      Logged in as: {result.user.fullName} ({result.user.role})
                    </div>
                    <div className="text-xs mt-1 text-green-600">
                      🚀 Redirecting to Admin Dashboard...
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold">Setup Failed</div>
                    <div className="text-xs mt-1">{result.error}</div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground text-center">
            This will initialize the database, create the SuperAdmin user, and log you in automatically.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
