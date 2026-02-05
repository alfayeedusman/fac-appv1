import { useState } from "react";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";

export default function MinimalLogin() {
  const [email, setEmail] = useState("superadmin@fayeedautocare.com");
  const [password, setPassword] = useState("SuperAdmin2024!");
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
        setStatus(`✅ Login successful! Welcome ${result.user?.fullName}`);
        setTimeout(() => {
          navigate("/admin-dashboard", { replace: true });
        }, 1000);
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
          <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Demo Account:</p>
          <p>Email: superadmin@fayeedautocare.com</p>
          <p>Password: SuperAdmin2024!</p>
        </div>
      </div>
    </div>
  );
}
