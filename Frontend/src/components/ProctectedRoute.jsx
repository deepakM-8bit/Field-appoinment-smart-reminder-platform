import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  let token = null;
  let userRole = null;
  
  if(role === "admin") {
    token = localStorage.getItem("adminToken");
    userRole = localStorage.getItem("adminRole");
  }else if (role === "technician") {
    token = localStorage.getItem("techToken");
    userRole = localStorage.getItem("techRole");
  }

  if (!token || userRole !== role){
    return <Navigate to={role === "technician" ? "/tech-login" : "/login"} replace />;
  }

  return children;
}
