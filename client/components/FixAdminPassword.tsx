import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { neonDbClient } from '@/services/neonDatabaseService';
import { authService } from '@/services/authService';
import { Wrench, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function FixAdminPassword() {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fixAdminPassword = async () => {
    setIsFixing(true);
    setResult(null);

    try {
      // Step 1: Trigger migration to fix admin password
      console.log('🔧 Step 1: Triggering migration to fix admin password...');
      const initResult = await neonDbClient.initialize();
      
      if (!initResult) {
        setResult({
          success: false,
          error: 'Failed to initialize database'
        });
        return;
      }

      // Step 2: Test the fixed login
      console.log('🔧 Step 2: Testing login with fixed password...');
      const loginResult = await authService.login({
        email: 'admin@fayeedautocare.com',
        password: 'admin123'
      });

      if (loginResult.success) {
        setResult({
          success: true,
          message: 'Admin password fixed! Login successful.',
          user: loginResult.user
        });
        
        toast({
          title: '✅ Password Fixed!',
          description: 'Admin login now works correctly',
        });
      } else {
        setResult({
          success: false,
          error: loginResult.error || 'Login still failed after password fix'
        });
      }

    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Failed to fix admin password'
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Wrench className="h-8 w-8 text-orange-500" />
          Fix Admin Password
        </h1>
        <p className="text-muted-foreground">
          Fix the admin user password by running database migration
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Password Repair</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Email:</strong> admin@fayeedautocare.com</p>
            <p><strong>Password:</strong> admin123</p>
            <p><strong>Issue:</strong> Password hash in database is incorrect</p>
            <p><strong>Solution:</strong> Run migration to regenerate proper bcrypt hash</p>
          </div>

          <Button
            onClick={fixAdminPassword}
            disabled={isFixing}
            className="w-full"
            size="lg"
          >
            {isFixing ? (
              <>
                <Wrench className="h-4 w-4 mr-2 animate-spin" />
                Fixing Password...
              </>
            ) : (
              <>
                <Wrench className="h-4 w-4 mr-2" />
                Fix Admin Password
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
                    {result.user && (
                      <div className="text-xs mt-1">
                        Logged in as: {result.user.fullName} ({result.user.role})
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold">Fix Failed</div>
                    <div className="text-xs mt-1">{result.error}</div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">What this does:</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>1. Runs database migration with updated password hashing</p>
          <p>2. Regenerates bcrypt hash for "admin123" password</p>
          <p>3. Updates admin user in database with correct hash</p>
          <p>4. Tests login to verify the fix worked</p>
        </CardContent>
      </Card>
    </div>
  );
}
