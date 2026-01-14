import { useMemo, useState } from "react";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return (
      name.trim() &&
      email.trim() &&
      password.trim() &&
      confirmPassword.trim() &&
      !submitting
    );
  }, [name, email, password, confirmPassword, submitting]);

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.post("/api/auth/signup", { name, email, password });
      navigate("/login");
    } catch (err) {
      console.log("signup error:", err);
      setError("Signup failed. This email may already exist.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand / Header */}
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-blue-600">
            FIELD APPOINTMENT PLATFORM
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Create Admin Account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create your business profile to manage appointments & technicians
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Avatar */}
          <div className="flex justify-center pt-8">
            <div className="h-16 w-16 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-100">
              {/* User Logo */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                className="text-blue-700"
              >
                <path
                  d="M20 21a8 8 0 0 0-16 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          <div className="px-6 pb-7 pt-6">
            {/* Error */}
            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              {/* Business Name */}
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Business / Owner Name
                </label>
                <input
                  type="text"
                  placeholder="Eg: Ace Services"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Password
                </label>

                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 pr-12 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Signup button */}
              <button
                onClick={handleSignup}
                disabled={!canSubmit}
                className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white
                           hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating account..." : "Create Account"}
              </button>

              {/* Link back */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-sm text-slate-500 hover:underline"
                >
                  Already have an account? Login
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Secure signup • Admin-only access
        </p>
      </div>
    </div>
  );
}
