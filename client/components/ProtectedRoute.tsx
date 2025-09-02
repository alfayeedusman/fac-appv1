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
    const checkAuth = async () => {
      // Use the improved authService validation
      if (!authService.isAuthenticated()) {
        toast({
          title: "Access Denied",
          description: "Please log in to access this page",
          variant: "destructive",
        });
        navigate(redirectTo, { replace: true });
        return;
      }

      // Validate session (checks expiry and integrity)
      if (!authService.validateSession()) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate(redirectTo, { replace: true });
        return;
      }

      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        toast({
          title: "Session Invalid",
          description: "Your session is invalid. Please log in again.",
          variant: "destructive",
        });
        authService.logout();
        navigate(redirectTo, { replace: true });
        return;
      }

      // Check role-based access using the improved role checking
      if (!authService.hasRole(requiredRole) && !authService.hasAnyRole([requiredRole])) {
        // Check role hierarchy for access
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
        const userLevel = roleHierarchy[currentUser.role as keyof typeof roleHierarchy];

        if (!userLevel || userLevel < requiredLevel) {
          toast({
            title: "Insufficient Permissions",
            description: `This page requires ${requiredRole} role or higher. You have ${currentUser.role} role.`,
            variant: "destructive",
          });

          // Redirect based on user role
          if (authService.hasAnyRole(["admin", "superadmin"])) {
            navigate("/admin-dashboard", { replace: true });
          } else if (authService.hasRole("manager")) {
            navigate("/manager-dashboard", { replace: true });
          } else if (authService.hasRole("crew")) {
            navigate("/crew-dashboard", { replace: true });
          } else if (authService.hasRole("cashier")) {
            navigate("/pos", { replace: true });
          } else if (authService.hasRole("inventory_manager")) {
            navigate("/inventory-management", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
          return;
        }
      }

      // Refresh session activity
      authService.refreshSession();
    };

    checkAuth();
  }, [navigate, requiredRole, redirectTo]);

  return <>{children}</>;
}
