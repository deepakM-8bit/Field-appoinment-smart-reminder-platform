import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import { useNavigate, useSearchParams } from "react-router-dom";

function StepPill({ active, label }) {
  return (
    <span
      className={`rounded px-2 py-1 text-xs font-medium ${
        active
          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-300"
      }`}
    >
      {label}
    </span>
  );
}

export default function ForgotPassword() {
  const [params] = useSearchParams();
  const userType = params.get("type") || "admin"; // admin | technician
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 email, 2 otp, 3 reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [cooldown, setCooldown] = useState(0);

  // UX messages
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const loginRoute = useMemo(() => {
    return userType === "technician" ? "/tech-login" : "/login";
  }, [userType]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Auto-clear messages
  useEffect(() => {
    if (!error && !info) return;
    const t = setTimeout(() => {
      setError("");
      setInfo("");
    }, 3500);
    return () => clearTimeout(t);
  }, [error, info]);

  const sendOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your registered email.");
      return;
    }

    setSending(true);
    setError("");
    setInfo("");

    try {
      await api.post("/api/auth/password-otp/request", {
        email,
        userType,
      });

      setStep(2);
      setCooldown(60);
      setInfo(`OTP has been sent to ${email}`);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      setError("Please enter OTP.");
      return;
    }

    setVerifying(true);
    setError("");
    setInfo("");

    try {
      const res = await api.post("/api/auth/password-otp/verify", {
        email,
        userType,
        otp,
      });

      setResetToken(res.data.resetToken);
      setStep(3);
      setInfo("OTP verified successfully. Set a new password.");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifying(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setResetting(true);
    setError("");
    setInfo("");

    try {
      await api.post("/api/auth/password-otp/reset", {
        resetToken,
        newPassword,
      });

      setInfo("Password updated successfully. Redirecting to login…");

      setTimeout(() => {
        navigate(loginRoute);
      }, 900);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-blue-600 dark:text-blue-400">
            FIELD APPOINTMENT PLATFORM
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Forgot Password
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Reset password for{" "}
            <span className="font-medium text-slate-900 capitalize dark:text-slate-100">
              {userType}
            </span>
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="px-6 py-6">
            {/* Messages */}
            {(error || info) && (
              <div
                className={`mb-4 rounded-md border px-3 py-2 text-sm ${
                  error
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                    : "border-green-200 bg-green-50 text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300"
                }`}
              >
                {error || info}
              </div>
            )}

            {/* Step pills */}
            <div className="flex gap-2">
              <StepPill active={step >= 1} label="Email" />
              <StepPill active={step >= 2} label="OTP" />
              <StepPill active={step >= 3} label="Reset" />
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="mt-5 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
                               focus:outline-none focus:ring-2 focus:ring-blue-600
                               dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={sendOtp}
                  disabled={sending}
                  className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white
                             hover:bg-blue-700 disabled:opacity-60
                             dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {sending ? "Sending OTP…" : "Send OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(loginRoute)}
                  className="w-full text-sm text-slate-500 hover:underline dark:text-slate-400"
                >
                  Back to login
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="mt-5 space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  OTP sent to:{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {email}
                  </span>
                </p>

                <input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-blue-600
                             dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
                />

                <button
                  onClick={verifyOtp}
                  disabled={verifying}
                  className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white
                             hover:bg-blue-700 disabled:opacity-60
                             dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {verifying ? "Verifying…" : "Verify OTP"}
                </button>

                <button
                  onClick={sendOtp}
                  disabled={cooldown > 0 || sending}
                  className="w-full rounded-md bg-slate-100 py-2 text-sm font-medium text-slate-700
                             hover:bg-slate-200 disabled:opacity-60
                             dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {cooldown > 0 ? `Resend OTP (${cooldown}s)` : "Resend OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-slate-500 hover:underline dark:text-slate-400"
                >
                  Change email
                </button>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Set a new password
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>

                <input
                  type={showPw ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-blue-600
                             dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
                />

                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-blue-600
                             dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
                />

                <button
                  onClick={resetPassword}
                  disabled={resetting}
                  className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white
                             hover:bg-blue-700 disabled:opacity-60
                             dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {resetting ? "Updating…" : "Reset Password"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(loginRoute)}
                  className="w-full text-sm text-slate-500 hover:underline dark:text-slate-400"
                >
                  Back to login
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Secure reset flow • OTP verification required
        </p>
      </div>
    </div>
  );
}
