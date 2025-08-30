import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?:
    | "user"
    | "admin"
    | "superadmin"
    | "cashier"
    | "inventory_manager"
    | "manager"
    | "crew";
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

    // Check both predefined valid users and registered users
    const predefinedValidUsers = [
      { email: "admin@fac.com", password: "admin123", role: "admin" },
      { email: "superadmin@fac.com", password: "super123", role: "superadmin" },
      { email: "fffayeed@gmail.com", password: "Fayeed22beats", role: "superadmin" },
      { email: "manager@fayeedautocare.com", password: "manager123", role: "manager" },
      { email: "juan.cruz@fayeedautocare.com", password: "crew123", role: "crew" },
      { email: "maria.santos@fayeedautocare.com", password: "crew123", role: "crew" },
      { email: "carlos.mendoza@fayeedautocare.com", password: "crew123", role: "crew" },
      { email: "ana.reyes@fayeedautocare.com", password: "crew123", role: "crew" },
      { email: "user@fac.com", password: "user123", role: "user" },
      { email: "demo@fac.com", password: "demo123", role: "user" },
      { email: "fayeedtest@g.com", password: "test101", role: "user" },
    ];

    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]",
    );

    // Check if user exists in either predefined users or registered users
    const userExistsInPredefined = predefinedValidUsers.find(
      (user: any) => user.email === userEmail,
    );

    const userExistsInRegistered = registeredUsers.find(
      (user: any) => user.email === userEmail,
    );

    const userExists = userExistsInPredefined || userExistsInRegistered;

    if (!userExists) {
      // Only redirect non-admin users to signup
      if (userRole === "admin" || userRole === "superadmin") {
        toast({
          title: "Admin Session Invalid",
          description: "Admin session error. Please log in again.",
          variant: "destructive",
        });
        localStorage.clear();
        navigate("/login", { replace: true });
        return;
      } else {
        toast({
          title: "User Not Found",
          description: "Your account was not found. Please register again.",
          variant: "destructive",
        });
        localStorage.clear();
        navigate("/signup", { replace: true });
        return;
      }
    }

    // Check role-based access
    const roleHierarchy = {
      user: 1,
      crew: 2,
      cashier: 2,
      inventory_manager: 2,
      manager: 3,
      admin: 4,
      superadmin: 5,
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
      } else if (userRole === "crew") {
        navigate("/crew-dashboard", { replace: true });
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
