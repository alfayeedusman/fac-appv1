import { useState } from "react";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";

export default function MinimalLogin() {
  const [email, setEmail] = useState("superadmin@fayeedautocare.com");
  const [password, setPassword] = useState("password123");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("Attempting login...");

    try {
      const result = await authService.login({
        email,
        password,
      });

      if (result.success) {
        // Redirect immediately without delay
        const userRole = result.user?.role;
        if (userRole === "admin" || userRole === "superadmin") {
          navigate("/admin-dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
        // Don't set status - navigation happens instantly
      } else {
        setStatus(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backgroundColor: "#f5f5f5" }}>
      <div style={{ width: "100%", maxWidth: "400px", backgroundColor: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h1 style={{ marginBottom: "30px", textAlign: "center", fontSize: "24px", fontWeight: "bold" }}>Login</h1>
        
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "bold" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box" }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "bold" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box" }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: loading ? "#d97706" : "#f97316", color: "white", padding: "10px", border: "none", borderRadius: "4px", fontSize: "16px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {status && (
          <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "4px", fontSize: "14px", fontFamily: "monospace" }}>
            {status}
          </div>
        )}

        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#e8f4f8", borderRadius: "4px", fontSize: "13px" }}>
          <p style={{ fontWeight: "bold", marginBottom: "8px" }}>Available Demo Accounts:</p>
          <div style={{ marginBottom: "10px", paddingBottom: "10px", borderBottom: "1px solid #ccc" }}>
            <p style={{ marginBottom: "2px" }}><strong>Superadmin:</strong></p>
            <p style={{ margin: "0 0 2px 0", fontSize: "12px" }}>superadmin@fayeedautocare.com</p>
            <p style={{ margin: "0", fontSize: "12px" }}>password123</p>
          </div>
          <div style={{ marginBottom: "10px", paddingBottom: "10px", borderBottom: "1px solid #ccc" }}>
            <p style={{ marginBottom: "2px" }}><strong>Admin:</strong></p>
            <p style={{ margin: "0 0 2px 0", fontSize: "12px" }}>admin@fayeedautocare.com</p>
            <p style={{ margin: "0", fontSize: "12px" }}>password123</p>
          </div>
          <div>
            <p style={{ marginBottom: "2px" }}><strong>User:</strong></p>
            <p style={{ margin: "0 0 2px 0", fontSize: "12px" }}>customer@test.com</p>
            <p style={{ margin: "0", fontSize: "12px" }}>password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
