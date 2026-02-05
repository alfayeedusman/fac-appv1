import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginDebug() {
  const [email, setEmail] = useState("superadmin@fayeedautocare.com");
  const [password, setPassword] = useState("SuperAdmin2024!");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState("");
  const [dbStatus, setDbStatus] = useState("");

  useEffect(() => {
    testAPI();
    testDatabase();
  }, []);

  const testAPI = async () => {
    try {
      const response = await fetch("/api/supabase/test");
      const data = await response.json();
      setApiStatus(`✅ API OK: ${JSON.stringify(data)}`);
    } catch (error) {
      setApiStatus(`❌ API Error: ${error}`);
    }
  };

  const testDatabase = async () => {
    try {
      const response = await fetch("/api/supabase/db-check");
      const data = await response.json();
      setDbStatus(`✅ DB OK: ${JSON.stringify(data)}`);
    } catch (error) {
      setDbStatus(`⚠️ DB Check: ${error}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Attempting login...");

    try {
      console.log("📤 Sending login request:", { email, passwordLength: password.length });
      
      const response = await fetch("/api/supabase/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("📥 Response status:", response.status);
      const data = await response.json();
      console.log("📥 Response data:", data);

      if (response.ok && data.success) {
        setMessage(`✅ Login Success! User: ${data.user.fullName}`);
        setTimeout(() => {
          window.location.href = "/admin-dashboard";
        }, 1000);
      } else {
        setMessage(`❌ Login Failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Login Debug Page</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API Status</CardTitle>
            </CardHeader>
            <CardContent className="text-sm font-mono">
              {apiStatus || "Testing..."}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Database Status</CardTitle>
            </CardHeader>
            <CardContent className="text-sm font-mono">
              {dbStatus || "Testing..."}
            </CardContent>
          </Card>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Login Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-fac-orange-500 hover:bg-fac-orange-600"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            {message && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                {message}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Available Test Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>Superadmin:</strong>
              <p>Email: superadmin@fayeedautocare.com</p>
              <p>Password: SuperAdmin2024!</p>
            </div>
            <hr className="my-3" />
            <div>
              <strong>Admin:</strong>
              <p>Email: test.admin@example.com</p>
              <p>Password: password123</p>
            </div>
            <hr className="my-3" />
            <div>
              <strong>User:</strong>
              <p>Email: premium.customer1@example.com</p>
              <p>Password: password123</p>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-mono space-y-2">
            <p>Location: {window.location.pathname}</p>
            <p>Component: LoginDebug</p>
            <p>Status: Rendering properly</p>
            <p>Ready: ✅</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
