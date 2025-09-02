import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Shield, Key, User, RefreshCw } from 'lucide-react';
import { authService } from '@/services/authService';
import { neonDbClient } from '@/services/neonDatabaseService';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginTest() {
  const [isTestingDatabase, setIsTestingDatabase] = useState(false);
  const [isTestingLogin, setIsTestingLogin] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [databaseResults, setDatabaseResults] = useState<any>(null);
  const [loginTestResults, setLoginTestResults] = useState<any>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [credentials, setCredentials] = useState({
    email: 'admin@fayeedautocare.com',
    password: 'admin123'
  });
  const navigate = useNavigate();

  const testDatabaseState = async () => {
    setIsTestingDatabase(true);
    setDatabaseResults(null);
    
    try {
      console.log('🔍 Testing database state...');
      
      // Test 1: Database connection
      const connectionTest = await neonDbClient.testConnection();
      
      // Test 2: Initialize database
      const initResult = await neonDbClient.initialize();
      
      // Test 3: Check if admin users exist
      const statsResult = await neonDbClient.getStats();
      
      setDatabaseResults({
        connection: connectionTest,
        initialization: initResult,
        stats: statsResult,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: '✅ Database Test Complete',
        description: 'Check results below',
      });
      
    } catch (error: any) {
      console.error('Database test error:', error);
      setDatabaseResults({
        error: error.message || 'Database test failed',
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: '❌ Database Test Failed',
        description: error.message || 'Database test failed',
        variant: 'destructive',
      });
    } finally {
      setIsTestingDatabase(false);
    }
  };

  const testAdminLogin = async () => {
    setIsTestingLogin(true);
    setLoginTestResults(null);
    
    try {
      console.log('🔐 Testing admin login...');
      
      // Test both admin accounts
      const adminTests = [
        { email: 'admin@fayeedautocare.com', password: 'admin123', label: 'Regular Admin' },
        { email: 'superadmin@fayeedautocare.com', password: 'SuperAdmin2025!', label: 'Super Admin' }
      ];
      
      const results = [];
      
      for (const test of adminTests) {
        try {
          const result = await neonDbClient.login(test.email, test.password);
          results.push({
            ...test,
            success: result.success,
            user: result.user,
            error: result.error
          });
        } catch (error: any) {
          results.push({
            ...test,
            success: false,
            error: error.message || 'Login test failed'
          });
        }
      }
      
      setLoginTestResults({
        results,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: '✅ Login Test Complete',
        description: 'Check results below',
      });
      
    } catch (error: any) {
      console.error('Login test error:', error);
      setLoginTestResults({
        error: error.message || 'Login test failed',
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: '❌ Login Test Failed',
        description: error.message || 'Login test failed',
        variant: 'destructive',
      });
    } finally {
      setIsTestingLogin(false);
    }
  };

  const performActualLogin = async () => {
    setIsLoggingIn(true);
    
    try {
      console.log('🚀 Performing actual login...');
      
      const result = await authService.login(credentials);
      
      if (result.success && result.user) {
        // Update session info
        const sessionInfo = authService.getSessionInfo();
        setSessionInfo(sessionInfo);
        
        toast({
          title: '🎉 Login Successful!',
          description: `Welcome ${result.user.fullName}! Redirecting to dashboard...`,
        });
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 2000);
        
      } else {
        toast({
          title: '❌ Login Failed',
          description: result.error || 'Login failed',
          variant: 'destructive',
        });
      }
      
    } catch (error: any) {
      console.error('Actual login error:', error);
      toast({
        title: '❌ Login Error',
        description: error.message || 'Login failed',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const checkCurrentSession = () => {
    const sessionInfo = authService.getSessionInfo();
    const currentUser = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();
    
    setSessionInfo({
      ...sessionInfo,
      currentUser,
      isAuthenticated,
      timestamp: new Date().toISOString()
    });
  };

  React.useEffect(() => {
    checkCurrentSession();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Admin Login Test Suite</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive testing and validation for admin authentication
        </p>
      </div>

      {/* Current Session Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current Session Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button onClick={checkCurrentSession} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          </div>
          
          {sessionInfo && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Authenticated:</Label>
                <Badge variant={sessionInfo.isAuthenticated ? "default" : "destructive"}>
                  {sessionInfo.isAuthenticated ? "Yes" : "No"}
                </Badge>
              </div>
              
              {sessionInfo.currentUser && (
                <>
                  <div className="flex items-center gap-2">
                    <Label>User:</Label>
                    <span>{sessionInfo.currentUser.fullName} ({sessionInfo.currentUser.email})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>Role:</Label>
                    <Badge variant="secondary">{sessionInfo.currentUser.role}</Badge>
                  </div>
                </>
              )}
              
              {sessionInfo.loginTime && (
                <div className="flex items-center gap-2">
                  <Label>Login Time:</Label>
                  <span className="text-sm text-muted-foreground">
                    {new Date(sessionInfo.loginTime).toLocaleString()}
                  </span>
                </div>
              )}
              
              {sessionInfo.hoursRemaining !== undefined && (
                <div className="flex items-center gap-2">
                  <Label>Session Valid:</Label>
                  <Badge variant={sessionInfo.isValid ? "default" : "destructive"}>
                    {sessionInfo.isValid ? `${sessionInfo.hoursRemaining.toFixed(1)} hours remaining` : "Expired"}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Database State Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testDatabaseState} 
            disabled={isTestingDatabase}
            className="mb-4"
          >
            {isTestingDatabase ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            Test Database & Seeding
          </Button>
          
          {databaseResults && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  {databaseResults.error ? (
                    <div className="text-red-600">❌ Error: {databaseResults.error}</div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span>Connection:</span>
                        {databaseResults.connection?.connected ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span>Initialization:</span>
                        {databaseResults.initialization?.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      
                      {databaseResults.stats && (
                        <div className="mt-2 text-sm">
                          <div>Users: {databaseResults.stats.userCount}</div>
                          <div>Bookings: {databaseResults.stats.bookingCount}</div>
                        </div>
                      )}
                    </>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Tested at: {new Date(databaseResults.timestamp).toLocaleString()}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Login Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Admin Login Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testAdminLogin} 
            disabled={isTestingLogin}
            className="mb-4"
          >
            {isTestingLogin ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Key className="h-4 w-4 mr-2" />
            )}
            Test Admin Credentials
          </Button>
          
          {loginTestResults && (
            <Alert>
              <AlertDescription>
                <div className="space-y-3">
                  {loginTestResults.error ? (
                    <div className="text-red-600">❌ Error: {loginTestResults.error}</div>
                  ) : (
                    loginTestResults.results?.map((result: any, index: number) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{result.label}:</span>
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.email}
                        </div>
                        {result.success && result.user && (
                          <div className="text-sm">
                            ✅ {result.user.fullName} ({result.user.role})
                          </div>
                        )}
                        {!result.success && result.error && (
                          <div className="text-sm text-red-600">
                            ❌ {result.error}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div className="text-xs text-muted-foreground">
                    Tested at: {new Date(loginTestResults.timestamp).toLocaleString()}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Actual Login */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="mt-1"
              />
            </div>
            
            <Button 
              onClick={performActualLogin} 
              disabled={isLoggingIn}
              className="w-full"
            >
              {isLoggingIn ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <User className="h-4 w-4 mr-2" />
              )}
              Login & Go to Dashboard
            </Button>
          </div>
          
          <Alert className="mt-4">
            <AlertDescription>
              <div className="space-y-1">
                <div><strong>Regular Admin:</strong> admin@fayeedautocare.com / admin123</div>
                <div><strong>Super Admin:</strong> superadmin@fayeedautocare.com / SuperAdmin2025!</div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
