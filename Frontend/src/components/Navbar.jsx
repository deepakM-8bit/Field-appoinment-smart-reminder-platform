import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

/* ---------------- Helpers ---------------- */
function safeScrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

/* ✅ MUST be outside component (eslint rule) */
function DrawerNavItem({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full text-left
        rounded-lg px-4 py-3
        text-sm font-semibold
        text-slate-900
        hover:bg-slate-900/5
        active:scale-[0.99]
        dark:text-white
        dark:hover:bg-white/10
        border border-slate-200/60
        dark:border-white/10
      "
      style={{
        all: "revert",
        display: "block",
        width: "100%",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

export default function Navbar({ variant = "full" }) {
  const navigate = useNavigate();
  const location = useLocation();

  /* ---------------- Breakpoints ---------------- */
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isDesktop = width >= 910;
  const isTablet = width >= 770 && width < 910;
  const isMobile = width < 770;

  /* ---------------- Drawer ---------------- */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerOpenRef = useRef(drawerOpen);

  useEffect(() => {
    drawerOpenRef.current = drawerOpen;
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  // ✅ Fix ESLint warning by using setTimeout to make it asynchronous
  useEffect(() => {
    const timer = setTimeout(() => {
      if (drawerOpenRef.current) {
        setDrawerOpen(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

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

  const emoji = useMemo(() => (theme === "dark" ? "☀️" : "🌙"), [theme]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  /* ---------------- Scroll Handling ---------------- */
  const goToSection = (id) => {
    if (location.pathname === "/") {
      safeScrollTo(id);
      return;
    }
    navigate("/");
    setTimeout(() => safeScrollTo(id), 200);
  };

  const closeThen = (fn) => {
    setDrawerOpen(false);
    setTimeout(fn, 120);
  };

  return (
    <header
      className="
        sticky top-0 z-50
        border-b border-slate-200
        bg-white/85 backdrop-blur
        dark:border-slate-800
        dark:bg-slate-950/75
      "
    >
      <div className="w-full overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <Link
              to="/"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-2 min-w-0"
            >
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                FA
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  Field Appointment
                </p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  Service Workflow Platform
                </p>
              </div>
            </Link>

            {/* Desktop inline links */}
            {variant === "full" && isDesktop && (
              <nav className="hidden md:flex items-center gap-1">
                {[
                  ["features", "Features"],
                  ["how", "How it works"],
                  ["security", "Security"],
                  ["footer", "Contact"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => goToSection(id)}
                    className="
                      rounded-md px-3 py-2 text-sm font-semibold
                      text-slate-700 hover:bg-slate-100 hover:text-slate-900
                      dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white
                    "
                  >
                    {label}
                  </button>
                ))}
              </nav>
            )}

            {/* Right */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Theme */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="
                  rounded-md border border-slate-200 bg-white px-2.5 py-2
                  text-sm hover:bg-slate-50
                  dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900
                "
              >
                {emoji}
              </button>

              {/* Desktop + Tablet => login stays OUTSIDE */}
              {variant === "full" && (isDesktop || isTablet) && (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => navigate("/login")}
                    className="
                      rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white
                      hover:bg-slate-800
                      dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white
                    "
                  >
                    Admin Login
                  </button>
                  <button
                    onClick={() => navigate("/tech-login")}
                    className="
                      rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800
                      hover:bg-slate-50
                      dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900
                    "
                  >
                    Technician Login
                  </button>
                </div>
              )}

              {/* Hamburger menu for tablet and mobile when variant is full */}
              {(isTablet || isMobile) && variant === "full" && (
                <button
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open menu"
                  className="
                    rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800
                    hover:bg-slate-50
                    dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900
                  "
                >
                  ☰
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Drawer - Fixed: Remove variant condition here, only check drawerOpen */}
        {drawerOpen && (
          <div className="fixed inset-0 z-[9999]">
            {/* overlay */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm z-0"
              onClick={() => setDrawerOpen(false)}
            />

            {/* drawer panel */}
            <div
              className="
                absolute right-0 top-0 h-full w-[85%] max-w-sm
                overflow-y-auto
                border-l border-slate-200/60
                bg-white/90 backdrop-blur-xl
                shadow-2xl
                dark:border-white/10
                dark:bg-slate-950/90
                z-10
              "
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200/60 dark:border-white/10">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Menu
                </p>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100
                             dark:text-slate-200 dark:hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              {/* Nav Links */}
              <div className="p-4 space-y-3">
                {/* Show all navigation links in the drawer */}
                <DrawerNavItem label="Features" onClick={() => closeThen(() => goToSection("features"))} />
                <DrawerNavItem label="How it works" onClick={() => closeThen(() => goToSection("how"))} />
                <DrawerNavItem label="Security" onClick={() => closeThen(() => goToSection("security"))} />
                <DrawerNavItem label="Contact" onClick={() => closeThen(() => goToSection("footer"))} />

                {/* Mobile logins - also show for tablet in drawer */}
                {(isMobile || isTablet) && (
                  <div className="pt-4 space-y-2">
                    <button
                      onClick={() => closeThen(() => navigate("/login"))}
                      className="w-full rounded-md bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800
                                 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                    >
                      Admin Login
                    </button>

                    <button
                      onClick={() => closeThen(() => navigate("/tech-login"))}
                      className="w-full rounded-md border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50
                                 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:hover:bg-white/10"
                    >
                      Technician Login
                    </button>
                  </div>
                )}
              </div>

              <p className="px-4 pb-6 text-xs text-slate-600 dark:text-slate-300">
                Smart scheduling • OTP verification • Automated reminders
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}