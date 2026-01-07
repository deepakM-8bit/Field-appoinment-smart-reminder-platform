import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div>
      {/* Navbar will come later */}
      <Outlet />
      {/* Footer will come later */}
    </div>
  );
}
