import { Outlet, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function TechnicianLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/tech-login");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur px-4 py-3 dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              🛠️
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Technician Panel
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your assigned appointments
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={logout}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto w-full max-w-6xl p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
}
