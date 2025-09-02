import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { Crown, Shield, User, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function QuickSuperAdminLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      toast({
        title: 'Missing Credentials',
        description: 'Please enter both email and password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.login(credentials);

      if (result.success && result.user) {
        if (result.user.role !== 'superadmin') {
          toast({
            title: 'Access Denied',
            description: 'SuperAdmin privileges required',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'SuperAdmin Access Granted',
          description: `Welcome ${result.user.fullName}!`,
        });

        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 1500);
      } else {
        toast({
          title: 'Login Failed',
          description: result.error || 'Invalid credentials',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to authentication service',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            SuperAdmin Login
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Development Mode Only - Enter SuperAdmin credentials
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">SuperAdmin Email</Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                onKeyPress={handleKeyPress}
                placeholder="Enter superadmin email"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password">SuperAdmin Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                onKeyPress={handleKeyPress}
                placeholder="Enter superadmin password"
                className="mt-1"
              />
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Crown className="h-4 w-4 mr-2" />
                Login as SuperAdmin
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            Secure login for development testing only
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
