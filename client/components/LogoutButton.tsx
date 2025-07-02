import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export default function LogoutButton({
  variant = "ghost",
  size = "icon",
  className = "",
  showText = false,
}: LogoutButtonProps) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    // Simulate logout process
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Clear all authentication data
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    localStorage.removeItem("hasSeenWelcome");
    localStorage.removeItem("registrationData");

    // Redirect to landing page
    navigate("/");

    setIsLoggingOut(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`${className} ${showText ? "" : "rounded-full"}`}
        >
          <LogOut className={`h-5 w-5 ${showText ? "mr-2" : ""}`} />
          {showText && "Logout"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white border border-gray-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center font-black text-black">
            <LogOut className="h-5 w-5 mr-2 text-fac-orange-500" />
            Confirm Logout
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 font-medium">
            Are you sure you want to logout? You'll need to sign in again to
            access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="font-bold border-gray-300 text-black hover:bg-gray-50">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
