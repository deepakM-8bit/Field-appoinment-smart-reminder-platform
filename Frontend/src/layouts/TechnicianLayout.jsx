import { Outlet, useNavigate } from "react-router-dom";

export default function TechnicianLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/tech-login");
  };

  return (
    <div>
      {/* Top bar placeholder */}
      <div style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
        <span>Technician</span>
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
