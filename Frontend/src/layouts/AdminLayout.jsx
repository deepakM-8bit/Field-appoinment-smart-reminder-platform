import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import ThemeToggle from "../components/ThemeToggle";

/* ---------- Reusable NavLink (DECLARED OUTSIDE) ---------- */
function AdminNavLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
    >
      {children}
    </Link>
  );
}

/* ---------------------- Layout ---------------------- */
export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:static lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="px-6 py-4 text-lg font-semibold text-white">
            Admin Panel
          </div>

          <nav className="flex-1 space-y-1 px-3">
            <AdminNavLink
              to="/admin/dashboard"
              onClick={() => setSidebarOpen(false)}
            >
              Dashboard
            </AdminNavLink>
            <AdminNavLink
              to="/admin/appointments"
              onClick={() => setSidebarOpen(false)}
            >
              Appointments
            </AdminNavLink>
            <AdminNavLink
              to="/admin/customers"
              onClick={() => setSidebarOpen(false)}
            >
              Customers
            </AdminNavLink>
            <AdminNavLink
              to="/admin/technicians"
              onClick={() => setSidebarOpen(false)}
            >
              Technicians
            </AdminNavLink>

            <div className="border-t border-slate-800 p-4">
              <button
                onClick={logout}
                className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 ">
          <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 min-w-0"
            >
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                FA
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                  Field Appointment
                </p>
                <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                  Service Workflow Platform
                </p>
              </div>
          </Link>
          <div className="py-auto">
            <ThemeToggle />
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-md text-2xl p-2 text-slate-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              ☰
            </button>
          </div>  
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
