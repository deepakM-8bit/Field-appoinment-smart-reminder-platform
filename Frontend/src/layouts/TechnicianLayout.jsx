import { Outlet, useNavigate, Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function TechnicianLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur px-4 py-3 dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          {/* Left */}
          <Link to="/technician" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
              FA
            </div>
            <div className="leading-tight">
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                Field Appointment
              </p>
              <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                Service workflow platform
              </p>
            </div>
          </Link>

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
