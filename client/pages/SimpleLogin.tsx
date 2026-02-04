import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SimpleLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password });
    
    try {
      const response = await fetch("/api/supabase/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (data.success) {
        alert(`Welcome ${data.user.fullName}!`);
      } else {
        alert(`Login failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(`Error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Simple Login Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-fac-orange-500 hover:bg-fac-orange-600">
              Sign In
            </Button>
          </form>

          <div className="border-t pt-4">
            <h3 className="font-bold mb-2">Test Accounts:</h3>
            <ul className="text-sm space-y-1">
              <li>Admin: superadmin@fayeedautocare.com / SuperAdmin2024!</li>
              <li>User: premium.customer1@example.com / password123</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
