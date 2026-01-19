import { useState, useMemo, useCallback, useEffect } from "react";

export default function ThemeToggle () {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("theme");
        return saved === "dark" ? "dark" : "light";
      });
    
      useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
      }, [theme]);
    
      const emoji = useMemo(() => (theme === "dark" ? "☀️" : "🌙"), [theme]);
      const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

      return(
        <>
        <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="rounded-3xl border border-gray-200 bg-white px-2.5 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                {emoji}
              </button>
        </>
      )
}