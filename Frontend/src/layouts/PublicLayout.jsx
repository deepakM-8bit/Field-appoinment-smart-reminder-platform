import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Navbar will come later */}
      <Outlet />
      {/* Footer will come later */}
    </div>
  );
}
