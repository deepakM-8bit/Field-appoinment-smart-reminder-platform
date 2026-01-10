import { useState } from "react";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";

export default function LoginTechnician() {
  const [phoneno, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/api/auth/technician-login", {
        phoneno,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // Phase 3B flag
      localStorage.setItem(
        "mustChangePassword",
        res.data.mustChangePassword ? "true" : "false"
      );

      // Redirect based on mustChangePassword
      if (res.data.mustChangePassword) {
        navigate("/technician/reset-password");
      } else {
        navigate("/technician/dashboard");
      }
    } catch (err) {
      alert("Login failed");
      console.log("technician login error:", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Technician Login
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to view today’s assigned appointments
        </p>

        <div className="mt-5 space-y-3">
          <input
            placeholder="Phone"
            value={phoneno}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
          />

          <button
            onClick={handleLogin}
            className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
