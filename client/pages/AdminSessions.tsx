import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type Session = {
  id: string;
  userId: string;
  userEmail?: string | null;
  userFullName?: string | null;
  userRole?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt?: string | null;
};

export default function AdminSessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterUserId, setFilterUserId] = useState<string>("");

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterUserId) params.set("userId", filterUserId);
      params.set("activeOnly", "false");

      const resp = await fetch(`/api/supabase/sessions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sessionToken") || ""}`,
        },
      });
      const json = await resp.json();
      if (!resp.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch sessions");
      }
      setSessions(json.sessions || []);
    } catch (err: any) {
      console.error("Load sessions failed", err);
      toast({
        title: "Error",
        description: err.message || "Could not load sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (
      !role ||
      (role !== "admin" && role !== "superadmin" && role !== "manager")
    ) {
      toast({
        title: "Unauthorized",
        description: "You do not have access to this page",
        variant: "destructive",
      });
      navigate("/admin-dashboard");
      return;
    }

    fetchSessions();
  }, []);

  const revoke = async (opts: {
    sessionId?: string;
    sessionToken?: string;
    userId?: string;
  }) => {
    try {
      const body: any = {};
      if (opts.sessionId) body.sessionId = opts.sessionId;
      if (opts.sessionToken) body.sessionToken = opts.sessionToken;
      if (opts.userId) body.userId = opts.userId;

      const resp = await fetch("/api/supabase/sessions/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sessionToken") || ""}`,
        },
        body: JSON.stringify(body),
      });

      const json = await resp.json();
      if (!resp.ok || !json.success)
        throw new Error(json.error || "Revoke failed");

      toast({ title: "Success", description: json.message || "Revoked" });
      fetchSessions();
    } catch (err: any) {
      console.error("Revoke failed", err);
      toast({
        title: "Error",
        description: err.message || "Failed to revoke session",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      <AdminSidebar
        activeTab="sessions"
        onTabChange={(tab) => {
          // Map sidebar tab ids to routes
          switch (tab) {
            case "overview":
              navigate("/admin-dashboard");
              break;
            case "user-management":
              navigate("/admin-user-management");
              break;
            case "sessions":
              navigate("/admin-sessions");
              break;
            default:
              // Generic mapping for known admin routes
              navigate(`/admin-${tab}`);
          }
        }}
        userRole={localStorage.getItem("userRole") || "admin"}
        notificationCount={0}
      />

      <div className="flex-1 ml-0 lg:ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Active Sessions</h1>
          <div className="flex items-center space-x-2">
            <input
              placeholder="Filter by user id"
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="input"
            />
            <Button onClick={() => fetchSessions()}>
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2">User</th>
                <th className="p-2">Role</th>
                <th className="p-2">IP</th>
                <th className="p-2">Agent</th>
                <th className="p-2">Expires</th>
                <th className="p-2">Active</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-4 text-center text-muted-foreground"
                  >
                    No sessions found
                  </td>
                </tr>
              )}

              {sessions.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">
                    <div className="text-sm font-medium">
                      {s.userFullName || s.userEmail || s.userId}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.userEmail}
                    </div>
                  </td>
                  <td className="p-2">{s.userRole}</td>
                  <td className="p-2">{s.ipAddress}</td>
                  <td className="p-2 break-words max-w-xs">{s.userAgent}</td>
                  <td className="p-2">
                    {s.expiresAt ? new Date(s.expiresAt).toLocaleString() : "-"}
                  </td>
                  <td className="p-2">{s.isActive ? "Yes" : "No"}</td>
                  <td className="p-2 space-x-2">
                    <Button
                      onClick={() => revoke({ sessionId: s.id })}
                      variant="destructive"
                    >
                      Revoke
                    </Button>
                    <Button
                      onClick={() => revoke({ userId: s.userId })}
                      variant="outline"
                    >
                      Revoke All
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
