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

    // ✅ correct keys (based on your technician login page)
    const role = localStorage.getItem("techRole");
    const token = localStorage.getItem("techToken");

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Set New Password
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Your account uses a temporary password. Please set a new password to continue.
        </p>

        <div className="mt-5 space-y-3">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
                       focus:ring-2 focus:ring-blue-600 focus:outline-none
                       dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
                       focus:ring-2 focus:ring-blue-600 focus:outline-none
                       dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
          />

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60
                       dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
