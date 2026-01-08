import { Outlet, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import AppointmentsModal from "../pages/admin/Appointments.jsx";

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
  const [searchParams, setSearchParams] = useSearchParams();

  const appointmentsOpen =
  searchParams.get("modal") === "appointments";

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
            <AdminNavLink to="/admin/dashboard" onClick={() => setSidebarOpen(false)}>
              Dashboard
            </AdminNavLink>
            <button 
              onClick={() => setSearchParams({modal: "appointments"})}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm font-medium ${
                appointmentsOpen
                  ? "bg-slate-900 text-white"
                  : "text-slate-200 hover:bg-slate-800"
              }`}
            >
              Appointments
            </button>
            <AdminNavLink to="/admin/customers" onClick={() => setSidebarOpen(false)}>
              Customers
            </AdminNavLink>
            <AdminNavLink to="/admin/technicians" onClick={() => setSidebarOpen(false)}>
              Technicians
            </AdminNavLink>
            <AdminNavLink to="/admin/create-diagnosis" onClick={() => setSidebarOpen(false)}>
              Create Diagnosis
            </AdminNavLink>
          </nav>

          <div className="border-t border-slate-800 p-4">
            <button
              onClick={logout}
              className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
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
        <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm lg:hidden">
          <span className="text-sm font-semibold text-slate-900">
            Admin Panel
          </span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-slate-700 hover:bg-gray-100"
          >
            ☰
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
        {appointmentsOpen && (
          <AppointmentsModal onClose={() => setSearchParams({})} />
        )}
      </div>
    </div>
  );
}
