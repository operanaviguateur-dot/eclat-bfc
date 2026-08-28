import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button
      onClick={onToggle}
      aria-label="Basculer le mode sombre"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent transition"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}