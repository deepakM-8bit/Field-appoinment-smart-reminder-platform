import { Outlet, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function TechnicianLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/tech-login");
  };

  return (
    <div className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top bar placeholder */}
      <div style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
        <span>Technician</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div> 
        <button style={{ float: "right" }} onClick={logout}>
          Logout
        </button>
      </div>

      <div style={{ padding: "16px" }}>
        <Outlet />
      </div>
    </div>
  );
}
