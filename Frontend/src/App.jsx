import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginAdmin from "./pages/LoginAdmin.jsx";
import LoginTechnician from "./pages/LoginTechnician.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProctectedRoute.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginAdmin />} />
        <Route path="/tech-login" element={<LoginTechnician />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
