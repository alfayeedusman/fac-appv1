import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem("theme") as Theme;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Update CSS custom properties for immediate theme change
    if (newTheme === "dark") {
      root.style.setProperty("--background", "12 10 9"); // bg-stone-950
      root.style.setProperty("--foreground", "250 250 249"); // text-stone-50
      root.style.setProperty("--card", "28 25 23"); // bg-stone-900
      root.style.setProperty("--card-foreground", "250 250 249");
      root.style.setProperty("--primary", "255 122 53"); // fac-orange-500
      root.style.setProperty("--primary-foreground", "255 255 255");
      root.style.setProperty("--secondary", "41 37 36"); // bg-stone-800
      root.style.setProperty("--secondary-foreground", "231 229 228");
      root.style.setProperty("--muted", "41 37 36");
      root.style.setProperty("--muted-foreground", "168 162 158");
      root.style.setProperty("--accent", "41 37 36");
      root.style.setProperty("--accent-foreground", "231 229 228");
      root.style.setProperty("--border", "68 64 60");
      root.style.setProperty("--input", "68 64 60");
      root.style.setProperty("--ring", "255 122 53");
    } else {
      root.style.setProperty("--background", "255 255 255");
      root.style.setProperty("--foreground", "2 8 23");
      root.style.setProperty("--card", "255 255 255");
      root.style.setProperty("--card-foreground", "2 8 23");
      root.style.setProperty("--primary", "255 122 53");
      root.style.setProperty("--primary-foreground", "255 255 255");
      root.style.setProperty("--secondary", "249 250 251");
      root.style.setProperty("--secondary-foreground", "17 24 39");
      root.style.setProperty("--muted", "249 250 251");
      root.style.setProperty("--muted-foreground", "107 114 128");
      root.style.setProperty("--accent", "249 250 251");
      root.style.setProperty("--accent-foreground", "17 24 39");
      root.style.setProperty("--border", "229 231 235");
      root.style.setProperty("--input", "229 231 235");
      root.style.setProperty("--ring", "255 122 53");
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
