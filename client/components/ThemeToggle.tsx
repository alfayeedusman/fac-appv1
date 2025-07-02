import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  showText?: boolean;
}

export default function ThemeToggle({
  variant = "outline",
  size = "sm",
  className = "",
  showText = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={`theme-transition ${className}`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <>
          <Moon className="h-4 w-4" />
          {showText && <span className="ml-2">Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          {showText && <span className="ml-2">Light Mode</span>}
        </>
      )}
    </Button>
  );
}
