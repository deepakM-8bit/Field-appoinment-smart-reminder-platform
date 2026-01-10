import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProctectedRoute.jsx";

import PublicLayout from "./layouts/PublicLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import TechnicianLayout from "./layouts/TechnicianLayout.jsx";

import Home from "./pages/Home.jsx";
import LoginAdmin from "./pages/LoginAdmin.jsx";
import Signup from "./pages/Signup.jsx";
import LoginTechnician from "./pages/LoginTechnician.jsx";
import TechnicianResetPassword from "./pages/TechnicianResetPassword.jsx";


import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import CustomersPage from "./pages/admin/CustomerPage.jsx";
import TechniciansPage from "./pages/admin/TechniciansPage.jsx";
import CreateDiagnosisPage from "./pages/admin/CreateDiagnosisPage.jsx";
import PendingApprovals from "./pages/admin/PendingApprovals.jsx";
import AdminAppointments from "./pages/admin/Appointments.jsx";

import TechnicianDashboard from "./pages/technician/TechnicianDashboard.jsx";
import AppointmentDetail from "./pages/technician/AppointmentDetail.jsx";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginAdmin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/tech-login" element={<LoginTechnician />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="technicians" element={<TechniciansPage />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="create-diagnosis" element={<CreateDiagnosisPage />} />
          <Route path="pending-approvals" element={<PendingApprovals />} />
        </Route>

        {/* Technician */}  
        <Route
          path="/technician"
          element={
            <ProtectedRoute role="technician">
              <TechnicianLayout />
            </ProtectedRoute>
          } 
        >
          <Route path="dashboard" element={<TechnicianDashboard />} />
          <Route path="update-password" element={<TechnicianResetPassword />} />
          <Route path="appointments/:id" element={<AppointmentDetail />} /> 
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
