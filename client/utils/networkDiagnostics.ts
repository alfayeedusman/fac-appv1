/**
 * Network diagnostics utility to help debug connection issues
 */

export interface DiagnosticResult {
  test: string;
  success: boolean;
  details: string;
  error?: string;
}

export class NetworkDiagnostics {
  private results: DiagnosticResult[] = [];

  async runDiagnostics(): Promise<DiagnosticResult[]> {
    this.results = [];

    await this.testHealthEndpoint();
    await this.testSupabaseConnection();
    await this.testRegistrationEndpoint();
    await this.testCORS();

    return this.results;
  }

  private async testHealthEndpoint(): Promise<void> {
    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 5000);
      const response = await fetch("/api/health", {
        method: "GET",
        signal: ac.signal,
      });
      clearTimeout(to);

      if (response.ok) {
        const data = await response.json();
        this.results.push({
          test: "Health Endpoint",
          success: true,
          details: `Status: ${data.status}, Supabase: ${data.services?.supabase}`,
        });
      } else {
        this.results.push({
          test: "Health Endpoint",
          success: false,
          details: `HTTP ${response.status}: ${response.statusText}`,
        });
      }
    } catch (error) {
      this.results.push({
        test: "Health Endpoint",
        success: false,
        details: "Failed to connect",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async testSupabaseConnection(): Promise<void> {
    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 5000);
      const response = await fetch("/api/supabase/test", {
        method: "GET",
        signal: ac.signal,
      });
      clearTimeout(to);

      if (response.ok) {
        const data = await response.json();
        this.results.push({
          test: "Supabase Database Test",
          success: data.connected || data.success,
          details: `Connected: ${data.connected}, Stats: ${data.stats ? "Available" : "N/A"}`,
        });
      } else {
        this.results.push({
          test: "Supabase Database Test",
          success: false,
          details: `HTTP ${response.status}: ${response.statusText}`,
        });
      }
    } catch (error) {
      this.results.push({
        test: "Supabase Database Test",
        success: false,
        details: "Failed to connect",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async testRegistrationEndpoint(): Promise<void> {
    try {
      // Test with invalid data to see if endpoint is reachable
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 5000);
      const response = await fetch("/api/supabase/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "diagnostic" }),
        signal: ac.signal,
      });
      clearTimeout(to);

      // We expect 400 or 500 (invalid data), not network error
      this.results.push({
        test: "Registration Endpoint",
        success: true,
        details: `Endpoint reachable (HTTP ${response.status})`,
      });
    } catch (error) {
      this.results.push({
        test: "Registration Endpoint",
        success: false,
        details: "Failed to reach endpoint",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async testCORS(): Promise<void> {
    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 5000);
      const response = await fetch("/api/health", {
        method: "GET",
        headers: {
          Origin: window.location.origin,
        },
        signal: ac.signal,
      });
      clearTimeout(to);

      const corsHeaders = {
        "access-control-allow-origin": response.headers.get(
          "access-control-allow-origin",
        ),
        "access-control-allow-credentials": response.headers.get(
          "access-control-allow-credentials",
        ),
      };

      this.results.push({
        test: "CORS Configuration",
        success: true,
        details: `Origin: ${window.location.origin}, CORS Headers: ${JSON.stringify(corsHeaders)}`,
      });
    } catch (error) {
      this.results.push({
        test: "CORS Configuration",
        success: false,
        details: "Failed to test CORS",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  getFormattedResults(): string {
    let output = "🔍 Network Diagnostics Report\n";
    output += "=".repeat(50) + "\n\n";

    this.results.forEach((result) => {
      const icon = result.success ? "✅" : "❌";
      output += `${icon} ${result.test}\n`;
      output += `   ${result.details}\n`;
      if (result.error) {
        output += `   Error: ${result.error}\n`;
      }
      output += "\n";
    });

    output += "=".repeat(50) + "\n";
    output += `Browser: ${navigator.userAgent}\n`;
    output += `Location: ${window.location.href}\n`;
    output += `Online: ${navigator.onLine}\n`;

    return output;
  }

  printResults(): void {
    console.log(this.getFormattedResults());
  }
}

// Export singleton instance
export const networkDiagnostics = new NetworkDiagnostics();

// Helper functions for compatibility
export async function testApiConnectivity(): Promise<{
  apiReachable: boolean;
  supabaseConnected: boolean;
  registrationEndpoint: boolean;
  details?: string;
}> {
  const results = await networkDiagnostics.runDiagnostics();
  const healthTest = results.find((r) => r.test === "Health Endpoint");
  const neonTest = results.find((r) => r.test === "Neon Database Test");
  const regTest = results.find((r) => r.test === "Registration Endpoint");

  return {
    apiReachable: healthTest?.success || false,
    neonConnected: neonTest?.success || false,
    registrationEndpoint: regTest?.success || false,
    details: networkDiagnostics.getFormattedResults(),
  };
}

export function getNetworkDiagnostics(): {
  online: boolean;
  userAgent: string;
  location: string;
} {
  return {
    online: navigator.onLine,
    userAgent: navigator.userAgent,
    location: window.location.href,
  };
}

export async function logNetworkDiagnostics(): Promise<void> {
  await networkDiagnostics.runDiagnostics();
  networkDiagnostics.printResults();
}

// Add to window for easy access from console
if (typeof window !== "undefined") {
  (window as any).runNetworkDiagnostics = async () => {
    await networkDiagnostics.runDiagnostics();
    networkDiagnostics.printResults();
    return networkDiagnostics;
  };
}
