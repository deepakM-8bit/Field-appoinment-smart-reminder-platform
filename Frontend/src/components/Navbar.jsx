import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/* ---------------- Helpers ---------------- */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ✅ declared OUTSIDE component (fix ESLint static-components) */
function DrawerNavItem({ label, sectionId, onClick }) {
  return (
    <button
      type="button"
      onClick={() => {
        scrollToSection(sectionId);
        onClick?.();
      }}
      className="w-full text-left rounded-md px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-white/30
                 dark:text-slate-100 dark:hover:bg-white/10"
    >
      {label}
    </button>
  );
}

export default function Navbar({ variant = "full" }) {
  const navigate = useNavigate();

  /* ---------------- Breakpoints ---------------- */
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isDesktop = width >= 910;
  const isTablet = width < 910 && width >= 770;
  const isMobile = width < 770;

  /* ---------------- Drawer ---------------- */
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ✅ Lock body scroll only when drawer is open
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  // ✅ close drawer on resize
  useEffect(() => {
    const onResize = () => setDrawerOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ---------------- Theme Toggle ---------------- */
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const themeEmoji = useMemo(() => (theme === "dark" ? "☀️" : "🌙"), [theme]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  /* ---------------- UI ---------------- */
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur
                       dark:border-slate-800 dark:bg-slate-950/70">
      {/* ✅ prevent horizontal scroll issues */}
      <div className="w-full overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <Link
              to="/"
              className="flex items-center gap-2 min-w-0"
              onClick={() => setDrawerOpen(false)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shrink-0">
                FA
              </div>
              <div className="leading-4 min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  Field Appointment
                </p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  Service Workflow Platform
                </p>
              </div>
            </Link>

            {/* Desktop Nav links (ONLY >= 910) */}
            {variant === "full" && isDesktop && (
              <nav className="hidden md:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollToSection("features")}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900
                             dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  Features
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("how")}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900
                             dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  How it works
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("security")}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900
                             dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  Security
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("footer")}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900
                             dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  Contact
                </button>
              </nav>
            )}

            {/* Right side actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Theme emoji */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm hover:bg-slate-50
                           dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900"
              >
                {themeEmoji}
              </button>

              {/* ✅ Tablet: show login buttons inline, remove links, show hamburger */}
              {variant === "full" && (isDesktop || isTablet) && (
                <div className="hidden sm:flex items-center gap-2">
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

              {/* ✅ Tablet hamburger: nav links in drawer */}
              {variant === "full" && isTablet && (
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50
                             dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                  aria-label="Open menu"
                >
                  ☰
                </button>
              )}

              {/* ✅ Mobile hamburger only */}
              {variant === "full" && isMobile && (
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50
                             dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                  aria-label="Open menu"
                >
                  ☰
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ---------------- Drawer (Tablet + Mobile) ---------------- */}
        {variant === "full" && drawerOpen && (
          <div className="fixed inset-0 z-[60]">
            {/* Glass overlay */}
            <div
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-black/30 backdrop-blur-md"
            />

            {/* Glass drawer */}
            <div
              className="absolute right-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto border-l border-white/20
                         bg-white/30 shadow-2xl backdrop-blur-xl
                         dark:bg-slate-950/40 dark:border-white/10"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-white/20 px-4 py-4 dark:border-white/10">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Menu
                </p>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white/30
                             dark:text-slate-200 dark:hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              {/* Drawer links */}
              <div className="p-4">
                <div className="space-y-1">
                  <DrawerNavItem label="Features" sectionId="features" onClick={() => setDrawerOpen(false)} />
                  <DrawerNavItem label="How it works" sectionId="how" onClick={() => setDrawerOpen(false)} />
                  <DrawerNavItem label="Security" sectionId="security" onClick={() => setDrawerOpen(false)} />
                  <DrawerNavItem label="Contact" sectionId="footer" onClick={() => setDrawerOpen(false)} />
                </div>

                {/* ✅ Mobile only: login buttons inside drawer */}
                {isMobile && (
                  <div className="mt-6 space-y-2">
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        navigate("/login");
                      }}
                      className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800
                                 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                    >
                      Admin Login
                    </button>

                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        navigate("/tech-login");
                      }}
                      className="w-full rounded-md border border-white/30 bg-white/30 px-4 py-2 text-sm font-semibold text-slate-900
                                 hover:bg-white/40 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    >
                      Technician Login
                    </button>
                  </div>
                )}

                <p className="mt-5 text-xs text-slate-700 dark:text-slate-300">
                  Smart scheduling • OTP verification • Automated reminders
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
