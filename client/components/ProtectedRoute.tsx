import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?:
    | "user"
    | "admin"
    | "superadmin"
    | "cashier"
    | "inventory_manager"
    | "manager";
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole = "user",
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userRole = localStorage.getItem("userRole");
    const userEmail = localStorage.getItem("userEmail");

    // Check if user is authenticated
    if (!isAuthenticated || isAuthenticated !== "true") {
      toast({
        title: "Access Denied",
        description: "Please log in to access this page",
        variant: "destructive",
      });
      navigate(redirectTo, { replace: true });
      return;
    }

    // Check if user data exists (prevent manual localStorage manipulation)
    if (!userEmail || !userRole) {
      toast({
        title: "Session Invalid",
        description: "Your session is invalid. Please log in again.",
        variant: "destructive",
      });
      localStorage.clear();
      navigate(redirectTo, { replace: true });
      return;
    }

    // Verify user exists in registered users only (production security)
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]",
    );

    const userExists = registeredUsers.find(
      (user: any) => user.email === userEmail,
    );

    if (!userExists) {
      toast({
        title: "User Not Found",
        description: "Your account was not found. Please register again.",
        variant: "destructive",
      });
      localStorage.clear();
      navigate("/signup", { replace: true });
      return;
    }

    // Check role-based access
    const roleHierarchy = {
      user: 1,
      cashier: 2,
      inventory_manager: 2,
      manager: 2,
      admin: 3,
      superadmin: 4,
    };

    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy];
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy];

    if (!userLevel || userLevel < requiredLevel) {
      toast({
        title: "Insufficient Permissions",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });

      // Redirect based on user role
      if (userRole === "admin" || userRole === "superadmin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (userRole === "manager") {
        navigate("/manager-dashboard", { replace: true });
      } else if (userRole === "cashier") {
        navigate("/pos", { replace: true });
      } else if (userRole === "inventory_manager") {
        navigate("/inventory-management", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
      return;
    }
  }, [navigate, requiredRole, redirectTo]);

  return <>{children}</>;
}
