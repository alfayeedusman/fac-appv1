import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function SuperAdminStatus() {
  const [status, setStatus] = useState<'checking' | 'working' | 'error'>('checking');
  const [lastChecked, setLastChecked] = useState<string>('');

  useEffect(() => {
    checkSuperAdminStatus();
  }, []);

  const checkSuperAdminStatus = async () => {
    setStatus('checking');
    
    try {
      // Quick test to see if SuperAdmin credentials work
      const response = await fetch('/api/neon/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'superadmin@fayeedautocare.com',
          password: 'SuperAdmin2025!'
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user?.role === 'superadmin') {
          setStatus('working');
        } else {
          setStatus('error');
        }
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('SuperAdmin status check failed:', error);
      setStatus('error');
    }
    
    setLastChecked(new Date().toLocaleTimeString());
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'working':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking...';
      case 'working':
        return 'SuperAdmin Working';
      case 'error':
        return 'SuperAdmin Error';
    }
  };

  const getStatusVariant = (): "default" | "destructive" | "secondary" => {
    switch (status) {
      case 'checking':
        return 'secondary';
      case 'working':
        return 'default';
      case 'error':
        return 'destructive';
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">SuperAdmin Status</span>
          </div>
          <Badge variant={getStatusVariant()} className="flex items-center gap-1">
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </div>
        
        {status === 'working' && (
          <div className="mt-2 text-xs text-muted-foreground">
            ✅ SuperAdmin login verified at {lastChecked}
          </div>
        )}
        
        {status === 'error' && (
          <div className="mt-2 text-xs text-red-600">
            ❌ SuperAdmin login failed. Try network diagnostics.
          </div>
        )}

        <div className="mt-2 text-xs text-muted-foreground">
          Email: superadmin@fayeedautocare.com
        </div>
      </CardContent>
    </Card>
  );
}
