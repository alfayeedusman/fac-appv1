import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';

export function DatabaseInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState('');

  const initializeDatabase = async () => {
    setIsInitializing(true);
    setStatus('loading');
    setMessage('Initializing database...');
    setDetails('Running migrations and seeding data...');

    try {
      const response = await fetch('/api/neon/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Database initialized successfully!');
        setDetails(data.message || 'All migrations and seeds completed');
      } else {
        setStatus('error');
        setMessage('Initialization failed');
        setDetails(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to initialize database');
      setDetails(error instanceof Error ? error.message : 'Network error');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Database Initialization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Click the button below to initialize the Neon database with all tables and seed data.
        </p>

        {status === 'idle' && (
          <Button 
            onClick={initializeDatabase}
            disabled={isInitializing}
            size="lg"
            className="w-full"
          >
            {isInitializing ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              'Initialize Database'
            )}
          </Button>
        )}

        {status === 'loading' && (
          <Alert>
            <Loader className="h-4 w-4 animate-spin" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === 'success' && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>{message}</strong>
              <p className="mt-1 text-xs">{details}</p>
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert className="border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{message}</strong>
              <p className="mt-1 text-xs">{details}</p>
              <Button
                onClick={initializeDatabase}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
