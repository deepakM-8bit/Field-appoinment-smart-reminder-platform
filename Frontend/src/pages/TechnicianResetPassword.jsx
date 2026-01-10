import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

export default function TechnicianResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const mustChange = localStorage.getItem("mustChangePassword");
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    // basic protection
    if (!token || role !== "technician") {
      navigate("/tech-login");
      return;
    }

    // if already false, just go dashboard
    if (mustChange === "false") {
      navigate("/technician/dashboard");
    }
  }, [navigate]);

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/technician-passwordUpdate", {
        newPassword,
      });

      // once reset success
      localStorage.setItem("mustChangePassword", "false");
      navigate("/technician/dashboard");
    } catch (err) {
      console.error("Reset password error:", err);
      alert("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Set New Password
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Your account uses a temporary password. Please set a new password to continue.
        </p>

        <div className="mt-5 space-y-3">
          <input
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
          />

          <input
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
          />

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
