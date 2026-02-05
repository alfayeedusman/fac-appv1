import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/authService";

export default function Login() {
  const [email, setEmail] = useState("superadmin@fayeedautocare.com");
  const [password, setPassword] = useState("password123");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Logging in...");

    try {
      const result = await authService.login({
        email,
        password,
      });

      if (result.success) {
        setMessage(`✅ Login Success! Welcome ${result.user?.fullName}`);
        setTimeout(() => {
          navigate("/admin-dashboard", { replace: true });
        }, 1000);
      } else {
        setMessage(`❌ ${result.error || "Login failed"}`);
      }
    } catch (err) {
      setMessage("❌ Error: " + (err instanceof Error ? err.message : String(err)));
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

            <Button type="submit" className="w-full bg-fac-orange-500 hover:bg-fac-orange-600">
              Login
            </Button>
          </form>

          {message && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
              {message}
            </div>
          )}

          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900 rounded text-sm">
            <p className="font-bold mb-2">Test Account:</p>
            <p><strong>Email:</strong> superadmin@fayeedautocare.com</p>
            <p><strong>Password:</strong> SuperAdmin2024!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
