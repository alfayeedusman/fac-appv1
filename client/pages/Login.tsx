import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Lock, Mail, Eye, EyeOff, Zap, Loader2 } from "lucide-react";
import { authService } from "@/services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        // Navigate immediately without waiting
        const userRole = result.user?.role;
        if (userRole === "admin" || userRole === "superadmin") {
          navigate("/admin-dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
        // Let loading state stay true - page is navigating anyway
      } else {
        setError(result.error || "Login failed. Please check your credentials.");
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
      >
        <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
      </button>

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-3xl md:text-4xl font-black text-fac-orange-500">
          FAYEED
        </div>
        <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
          AUTOCARE
        </div>
      </div>

      {/* Member Login Badge */}
      <div className="mb-6">
        <span className="px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900 text-fac-orange-600 dark:text-orange-300 text-sm font-semibold">
          Member Login
        </span>
      </div>

      {/* Heading */}
      <div className="text-center mb-2 max-w-md">
        <h1 className="text-3xl md:text-4xl font-bold">
          Welcome <span style={{ color: "#ec4899" }}>Back</span>
        </h1>
      </div>

      {/* Description */}
      <p className="text-center text-gray-600 dark:text-gray-400 text-base max-w-md mb-8">
        Sign in to access your account and manage your bookings
      </p>

      {/* Lock Icon */}
      <div className="mb-8 p-4 bg-fac-orange-500 rounded-2xl">
        <Lock className="w-8 h-8 text-white" />
      </div>

      {/* Sign In Form */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Sign In
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="flex items-center gap-2 text-gray-900 dark:text-white font-bold mb-3">
              <Mail className="w-5 h-5 text-fac-orange-500" />
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              disabled={loading}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="flex items-center gap-2 text-gray-900 dark:text-white font-bold mb-3">
              <Lock className="w-5 h-5 text-fac-orange-500" />
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-fac-orange-600 dark:text-fac-orange-400 font-bold hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold py-3 rounded-full text-lg flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>✓</span> Sign In <Zap className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-fac-orange-600 dark:text-fac-orange-400 font-bold hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
