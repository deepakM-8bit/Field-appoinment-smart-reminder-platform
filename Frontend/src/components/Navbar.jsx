import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Navbar modes:
 * - variant="full"    -> Home style: links + hamburger + CTA buttons
 * - variant="minimal" -> Login/Signup/Forgot: only logo + theme toggle + optional back/login buttons
 */
export default function Navbar({ variant = "full" }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // ----- Theme toggle (emoji) -----
  // stores theme in localStorage: "dark" | "light"
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" ? "dark" : "light";
  });

  // apply theme on mount + whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const themeEmoji = useMemo(() => (theme === "dark" ? "☀️" : "🌙"), [theme]);

  // close drawer when resizing
  useEffect(() => {
    const close = () => setMobileOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  // Prevent background scrolling when drawer open
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "");
  }, [mobileOpen]);

  const NavLink = ({ to, children, onClick }) => (
    <a
      href={to}
      onClick={(e) => {
        // allow hash navigation while closing drawer
        if (to.startsWith("/#") || to.startsWith("#")) {
          // keep browser anchor behavior but close drawer
          setMobileOpen(false);
        }
        onClick?.(e);
      }}
      className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900
                 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      {children}
    </a>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur
                       dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
              FA
            </div>
            <div className="leading-4">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Field Appointment
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Service Workflow Platform
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          {variant === "full" && (
            <nav className="hidden items-center gap-1 md:flex">
              <NavLink to="/#features">Features</NavLink>
              <NavLink to="/#how">How it works</NavLink>
              <NavLink to="/#security">Security</NavLink>
              <NavLink to="/#footer">Contact</NavLink>
            </nav>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle emoji */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
              className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm hover:bg-slate-50
                         dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900"
            >
              {themeEmoji}
            </button>

            {/* Desktop CTA buttons */}
            {variant === "full" && (
              <div className="hidden items-center gap-2 md:flex">
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800
                             dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  Admin Login
                </button>

                <button
                  onClick={() => navigate("/tech-login")}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50
                             dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  Technician Login
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            {variant === "full" && (
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50
                           dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                aria-label="Open menu"
              >
                ☰
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Mobile Drawer (Off-canvas) ---------------- */}
      {variant === "full" && (
        <div
          className={`fixed inset-0 z-[60] transition ${
            mobileOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {/* Overlay */}
          <div
            onClick={() => setMobileOpen(false)}
            className={`absolute inset-0 bg-black/40 transition-opacity ${
              mobileOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Drawer Panel */}
          <div
            className={`absolute right-0 top-0 h-full w-[82%] max-w-sm transform border-l border-slate-200 bg-white shadow-2xl transition-transform
                        dark:border-slate-800 dark:bg-slate-950
                        ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Menu
              </p>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100
                           dark:text-slate-200 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              {/* Links vertical */}
              <div className="space-y-1">
                <NavLink to="/#features">Features</NavLink>
                <NavLink to="/#how">How it works</NavLink>
                <NavLink to="/#security">Security</NavLink>
                <NavLink to="/#footer">Contact</NavLink>
              </div>

              {/* CTA */}
              <div className="mt-4 grid gap-2">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/login");
                  }}
                  className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800
                             dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  Admin Login
                </button>

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/tech-login");
                  }}
                  className="w-full rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50
                             dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  Technician Login
                </button>
              </div>

              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                Secure appointments • OTP verification • Automated reminders
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
