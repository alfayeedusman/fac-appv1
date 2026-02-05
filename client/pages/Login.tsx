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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@fayeedautocare.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="SuperAdmin2024!"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>

          {message && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
              {message}
            </div>
          )}

          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900 rounded text-sm">
            <p className="font-bold mb-3">Available Demo Accounts:</p>
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Superadmin</p>
                <p>Email: superadmin@fayeedautocare.com</p>
                <p>Password: password123</p>
              </div>
              <div>
                <p className="font-semibold">Admin</p>
                <p>Email: admin@fayeedautocare.com</p>
                <p>Password: password123</p>
              </div>
              <div>
                <p className="font-semibold">User</p>
                <p>Email: customer@test.com</p>
                <p>Password: password123</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
