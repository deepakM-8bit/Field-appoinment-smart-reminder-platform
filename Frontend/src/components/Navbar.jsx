import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

/* ---------------- Helpers ---------------- */
function safeScrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

export default function Navbar({ variant = "full" }) {
  const navigate = useNavigate();
  const location = useLocation();

  /* ---------------- Breakpoints ---------------- */
  const [width, setWidth] = useState(() => window.innerWidth);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isDesktop = width >= 1055;
  const isTablet = width >= 770 && width < 1054;
  const isMobile = width < 770;

  /* ---------------- Drawer Logic ---------------- */
  useEffect(() => {
    let timeoutId;
    if (drawerOpen) {
      timeoutId = setTimeout(() => {
        setDrawerOpen(false);
      }, 10);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Body overflow handling
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [drawerOpen]);

  /* ---------------- Scroll Handling ---------------- */
  const goToSection = useCallback(
    (id) => {
      if (location.pathname === "/") {
        safeScrollTo(id);
        return;
      }
      navigate("/");
      setTimeout(() => safeScrollTo(id), 200);
    },
    [location.pathname, navigate],
  );

  const closeThen = useCallback((fn) => {
    setDrawerOpen(false);
    setTimeout(fn, 150);
  }, []);

  // Navigation items
  const navItems = useMemo(
    () => [
      { id: "features", label: "Features" },
      { id: "how", label: "How it works" },
      { id: "security", label: "Security" },
      { id: "footer", label: "Contact" },
    ],
    [],
  );

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Brand Name */}
            <Link
              to="/"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-2 min-w-0"
            >
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                FA
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-gray-900 dark:text-white">
                  Field Appointment
                </p>
                <p className="truncate text-[12px] text-gray-500 dark:text-gray-400">
                  Service Workflow Platform
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {variant === "full" && isDesktop && (
              <nav className="flex items-center gap-1">
                {navItems.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => goToSection(id)}
                    className="rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
                  >
                    {label}
                  </button>
                ))}
              </nav>
            )}

            {/* Right Side Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Desktop Login/Signup Buttons */}
              {variant === "full" && (isDesktop || isTablet) && (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => navigate("/signup")}
                    className="rounded-md border border-blue-600 text-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Admin Login
                  </button>
                  <button
                    onClick={() => navigate("/tech-login")}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                  >
                    Technician Login
                  </button>
                </div>
              )}

              {/* Hamburger Menu for Mobile & Tablet */}
              {(isTablet || isMobile) && variant === "full" && (
                <button
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open menu"
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  ☰
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE/TABLET DRAWER */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ease-in-out ${
          drawerOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        style={{ zIndex: 99999 }}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            drawerOpen ? "opacity-40" : "opacity-0"
          }`}
          onClick={() => setDrawerOpen(false)}
        />

        {/* Drawer Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl dark:bg-gray-900 transform transition-transform duration-300 ease-in-out ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                FA
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Menu
              </p>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              aria-label="Close menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Drawer Content */}
          <div className="h-[calc(100%-4rem)] overflow-y-auto">
            <div className="p-6">
              {/* Navigation Links */}
              <div className="mb-8">
                <div className="space-y-2">
                  {navItems.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => closeThen(() => goToSection(id))}
                      className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Buttons for Mobile/Tablet */}
              {(isMobile || isTablet) && (
                <div className="mb-8">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    Account Access
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => closeThen(() => navigate("/signup"))}
                      className="w-full border border-blue-600 text-blue-600 font-medium py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={() => closeThen(() => navigate("/login"))}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      Admin Login
                    </button>
                    <button
                      onClick={() => closeThen(() => navigate("/tech-login"))}
                      className="w-full border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Technician Login
                    </button>
                  </div>
                </div>
              )}

              {/* Footer Note */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Field Appointment v1.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
