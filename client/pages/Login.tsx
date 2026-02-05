import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authService.login({
        email: email.trim(),
        password,
      });

      if (result.success) {
        navigate("/admin-dashboard", { replace: true });
      } else {
        setError(result.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fac-orange-50 to-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-lg border-fac-orange-100">
        <CardHeader className="space-y-3 border-b border-fac-orange-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-fac-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">FAC</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Fayeed Auto Care</h1>
              <p className="text-xs text-muted-foreground">Management Portal</p>
            </div>
          </div>
          <CardTitle className="text-xl">Sign In</CardTitle>
          <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="border-fac-orange-200 focus:border-fac-orange-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-fac-orange-600 hover:text-fac-orange-700 font-medium"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                className="border-fac-orange-200 focus:border-fac-orange-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-semibold py-2.5 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-fac-orange-100">
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-fac-orange-600 hover:text-fac-orange-700 font-semibold"
              >
                Create one
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
