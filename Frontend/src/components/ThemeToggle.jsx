import useTheme from "../context/useTheme.js";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-sm hover:bg-slate-50
                 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <span className="text-sm">{isDark ? "🌙" : "☀️"}</span>

      <span
        className={`relative inline-flex h-5 w-10 items-center rounded-full transition
        ${isDark ? "bg-blue-600" : "bg-slate-300"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition
          ${isDark ? "translate-x-5" : "translate-x-1"}`}
        />
      </span>

      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
