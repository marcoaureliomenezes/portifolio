import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggleTheme}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-header-text " +
        "hover:bg-white/10 hover:text-accent focus-visible:outline-none " +
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 " +
        "focus-visible:ring-offset-header-bg transition-colors " +
        (className ?? "")
      }
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
