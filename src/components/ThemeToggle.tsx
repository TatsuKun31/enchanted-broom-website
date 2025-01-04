import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-purple-primary/10 hover:bg-purple-primary/20 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-purple-primary" />
      ) : (
        <Moon className="h-5 w-5 text-purple-primary" />
      )}
    </button>
  );
};

export default ThemeToggle;