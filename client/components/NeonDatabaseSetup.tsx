import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Database,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Loader,
  Users,
  Calendar,
  Bell,
  Settings,
  Megaphone,
  Upload,
  HardDrive,
  ArrowRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabaseDbClient } from '@/services/supabaseDatabaseService';
import { migrationHelper } from '@/utils/migrationHelper';

export default function NeonDatabaseSetup() {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [stats, setStats] = useState<any>(null);
  const [databaseUrl, setDatabaseUrl] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationSummary, setMigrationSummary] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    checkConnection();
    // Check for local data that can be migrated
    const summary = migrationHelper.getMigrationSummary();
    setMigrationSummary(summary);
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('connecting');
    try {
      const result = await supabaseDbClient.testConnection();
      setConnectionStatus(result.connected ? 'connected' : 'disconnected');
      setStats(result.stats || null);
      setError(null);
    } catch (error) {
      setConnectionStatus('disconnected');
      setError(error instanceof Error ? error.message : 'Connection failed');
    }
  };

  const initializeDatabase = async () => {
    setIsInitializing(true);
    setError(null);
    
    try {
      const success = await supabaseDbClient.initialize();
      if (success) {
        setConnectionStatus('connected');
        await checkConnection(); // Refresh stats
        toast({
          title: 'Database Initialized',
          description: 'Supabase database has been set up successfully!',
        });
      } else {
        throw new Error('Database initialization failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Initialization failed');
      toast({
        title: 'Initialization Failed',
        description: 'Please check your database configuration.',
        variant: 'destructive',
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Text has been copied to your clipboard.',
    });
  };

  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      const result = await migrationHelper.migrateAllData();

      if (result.success) {
        toast({
          title: 'Migration Successful',
          description: `Successfully migrated ${result.migrated} items to Supabase database.`,
        });

        // Clear localStorage after successful migration
        migrationHelper.clearLocalStorageData();

        // Update migration summary
        setMigrationSummary({});

        // Refresh connection stats
        await checkConnection();
      } else {
        toast({
          title: 'Migration Failed',
          description: `Migrated ${result.migrated} items. Errors: ${result.errors.join(', ')}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Migration Error',
        description: error instanceof Error ? error.message : 'Migration failed',
        variant: 'destructive',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-blue-100 text-blue-800"><Loader className="h-3 w-3 mr-1 animate-spin" />Connecting...</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Neon Database Setup
            </div>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="migration">Migration</TabsTrigger>
              <TabsTrigger value="guide">Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Database Status</p>
                        <p className="text-xs text-muted-foreground">Current connection state</p>
                      </div>
                      {getStatusBadge()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Data Source</p>
                        <p className="text-xs text-muted-foreground">
                          {connectionStatus === 'connected' ? 'Neon Database' : 'LocalStorage'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {connectionStatus === 'connected' ? '🐘' : '💾'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {stats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Database Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{stats.totalUsers}</p>
                        <p className="text-sm text-muted-foreground">Users</p>
                      </div>
                      <div className="text-center">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">{stats.totalBookings}</p>
                        <p className="text-sm text-muted-foreground">Bookings</p>
                      </div>
                      <div className="text-center">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                        <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                        <p className="text-sm text-muted-foreground">Pending</p>
                      </div>
                      <div className="text-center">
                        <Megaphone className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                        <p className="text-2xl font-bold">{stats.activeAds}</p>
                        <p className="text-sm text-muted-foreground">Active Ads</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button onClick={checkConnection} variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                {connectionStatus === 'disconnected' && (
                  <Button 
                    onClick={initializeDatabase} 
                    disabled={isInitializing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isInitializing ? (
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Initialize Database
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="setup" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You can set up Supabase database in two ways: via MCP integration (recommended) or manual setup.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Option 1: MCP Integration (Recommended)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Connect to Neon via Builder.io's MCP integration for automatic setup.
                  </p>
                  <Button className="w-full" asChild>
                    <a href="#open-mcp-popover" className="flex items-center justify-center">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Connect to Neon via MCP
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Option 2: Manual Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="database-url">Neon Database URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="database-url"
                        placeholder="postgresql://username:password@hostname/database"
                        value={databaseUrl}
                        onChange={(e) => setDatabaseUrl(e.target.value)}
                        type="password"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(databaseUrl)}
                        disabled={!databaseUrl}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Set the NEON_DATABASE_URL environment variable in your server configuration.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Environment Variables Required:</p>
                    <div className="bg-muted p-3 rounded-lg text-sm font-mono">
                      <div>NEON_DATABASE_URL=your_neon_connection_string</div>
                      <div>DATABASE_URL=your_neon_connection_string</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="migration" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Data Migration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.values(migrationSummary).some(count => count > 0) ? (
                    <>
                      <Alert>
                        <HardDrive className="h-4 w-4" />
                        <AlertDescription>
                          Local data found in browser storage. Migrate to Supabase database for better performance and reliability.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Found Local Data:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(migrationSummary).map(([type, count]) => (
                            count > 0 && (
                              <div key={type} className="flex justify-between p-2 bg-muted rounded">
                                <span>{type}</span>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                            )
                          ))}
                        </div>
                      </div>

                      {connectionStatus === 'connected' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={handleMigration}
                            disabled={isMigrating}
                            className="flex-1"
                          >
                            {isMigrating ? (
                              <Loader className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <ArrowRight className="h-4 w-4 mr-2" />
                            )}
                            {isMigrating ? 'Migrating...' : 'Migrate to Neon Database'}
                          </Button>
                        </div>
                      )}

                      {connectionStatus !== 'connected' && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Connect to Supabase database first before migrating data.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <h3 className="font-semibold mb-2">No Local Data Found</h3>
                      <p className="text-muted-foreground">
                        All data is already stored in the Supabase database or no data exists.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guide" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Migration Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">What will be migrated:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-blue-500" />
                          <span>User authentication & profiles</span>
                        </li>
                        <li className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-green-500" />
                          <span>Booking management</span>
                        </li>
                        <li className="flex items-center">
                          <Bell className="h-4 w-4 mr-2 text-orange-500" />
                          <span>System notifications</span>
                        </li>
                        <li className="flex items-center">
                          <Settings className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Admin settings</span>
                        </li>
                        <li className="flex items-center">
                          <Megaphone className="h-4 w-4 mr-2 text-purple-500" />
                          <span>Ads management</span>
                        </li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">Migration Process:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Connect to Supabase database</li>
                        <li>Initialize database schema and tables</li>
                        <li>System automatically falls back to localStorage if database is unavailable</li>
                        <li>Existing localStorage data remains as backup</li>
                        <li>Test all functionality with new database</li>
                      </ol>
                    </div>

                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Safe Migration:</strong> Your existing localStorage data will be preserved. 
                        The system automatically uses the database when available and falls back to localStorage when not.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
