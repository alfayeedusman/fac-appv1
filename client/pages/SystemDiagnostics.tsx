import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import {
  testDatabaseConnection,
  getDatabaseDiagnostics,
} from "@/services/dbInitService";

interface StatusItem {
  name: string;
  status: "healthy" | "warning" | "error" | "checking";
  message: string;
  details?: Record<string, any>;
}

export default function SystemDiagnostics() {
  const [statuses, setStatuses] = useState<StatusItem[]>([
    { name: "Database Connection", status: "checking", message: "Testing..." },
    { name: "API Endpoints", status: "checking", message: "Testing..." },
    { name: "Authentication", status: "checking", message: "Testing..." },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const newStatuses: StatusItem[] = [];

      try {
        // Check database connection
        const dbConnected = await testDatabaseConnection();
        newStatuses.push({
          name: "Database Connection",
          status: dbConnected ? "healthy" : "error",
          message: dbConnected
            ? "✅ Database is connected"
            : "❌ Database connection failed",
        });

        // Get database diagnostics
        const diagnostics = await getDatabaseDiagnostics();
        if (diagnostics) {
          newStatuses.push({
            name: "Database Diagnostics",
            status: diagnostics.success ? "healthy" : "warning",
            message:
              diagnostics.checks?.databaseUrlConfigured || "Not configured",
            details: diagnostics.checks,
          });
        }

        // Check API endpoints
        try {
          const healthResponse = await fetch("/api/health");
          const health = await healthResponse.json();
          newStatuses.push({
            name: "API Endpoints",
            status: healthResponse.ok ? "healthy" : "error",
            message: `API Status: ${health.status}`,
            details: health,
          });
        } catch (error) {
          newStatuses.push({
            name: "API Endpoints",
            status: "error",
            message: "❌ API endpoints not accessible",
          });
        }

        // Check authentication
        const isAuthenticated =
          localStorage.getItem("isAuthenticated") === "true";
        newStatuses.push({
          name: "Authentication",
          status: isAuthenticated ? "healthy" : "warning",
          message: isAuthenticated
            ? "✅ User is logged in"
            : "⚠️ No active session",
        });
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        newStatuses.push({
          name: "System Diagnostics",
          status: "error",
          message: `Error during diagnostics: ${errorMsg}`,
        });
      }

      setStatuses(newStatuses);
      setIsLoading(false);
    };

    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "checking":
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      healthy: "default",
      warning: "secondary",
      error: "destructive",
      checking: "outline",
    };
    return variants[status] || "outline";
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">System Diagnostics</h1>
          <p className="text-muted-foreground">
            Check the status of all system components
          </p>
        </div>

        <div className="space-y-4">
          {statuses.map((status, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {getStatusIcon(status.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {status.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {status.message}
                      </p>
                      {status.details && (
                        <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-48 mb-2">
                          {JSON.stringify(status.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                  <Badge variant={getStatusBadge(status.status)}>
                    {status.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex-1"
          >
            Refresh
          </Button>
          <Button onClick={() => window.history.back()} className="flex-1">
            Back
          </Button>
        </div>

        {isLoading && (
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
            <Loader className="h-5 w-5 animate-spin inline-block mr-2" />
            <span className="text-blue-900 dark:text-blue-100">
              Running diagnostics...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
