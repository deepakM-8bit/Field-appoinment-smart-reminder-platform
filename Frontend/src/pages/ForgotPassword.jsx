import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useNavigate, useSearchParams } from "react-router-dom";

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

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const sendOtp = async () => {
    if (!email.trim()) return alert("Enter email");
    setSending(true);

    try {
      await api.post("/api/auth/password-otp/request", {
        email,
        userType,
      });

      setStep(2);
      setCooldown(60);
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) return alert("Enter OTP");
    setVerifying(true);

    try {
      const res = await api.post("/api/auth/password-otp/verify", {
        email,
        userType,
        otp,
      });

      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifying(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword.length < 6) return alert("Password must be 6+ characters");
    if (newPassword !== confirmPassword) return alert("Passwords do not match");

    setResetting(true);
    try {
      await api.post("/api/auth/password-otp/reset", {
        resetToken,
        newPassword,
      });

      alert("Password updated successfully");

      // Redirect to correct login
      if (userType === "technician") navigate("/tech-login");
      else navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Forgot Password
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Reset password for{" "}
          <span className="font-medium text-slate-900 capitalize">{userType}</span>
        </p>

        {/* Step indicator */}
        <div className="mt-4 flex gap-2 text-xs">
          <span className={`rounded px-2 py-1 ${step >= 1 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
            Email
          </span>
          <span className={`rounded px-2 py-1 ${step >= 2 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
            OTP
          </span>
          <span className={`rounded px-2 py-1 ${step >= 3 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
            Reset
          </span>
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <div className="mt-5 space-y-3">
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
            />

            <button
              onClick={sendOtp}
              disabled={sending}
              className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {sending ? "Sending OTP…" : "Send OTP"}
            </button>
          </div>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <div className="mt-5 space-y-3">
            <p className="text-xs text-slate-500">
              OTP sent to: <span className="font-medium text-slate-700">{email}</span>
            </p>

            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
            />

            <button
              onClick={verifyOtp}
              disabled={verifying}
              className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {verifying ? "Verifying…" : "Verify OTP"}
            </button>

            <button
              onClick={sendOtp}
              disabled={cooldown > 0 || sending}
              className="w-full rounded-md bg-slate-100 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-60"
            >
              {cooldown > 0 ? `Resend OTP (${cooldown}s)` : "Resend OTP"}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full text-sm text-slate-500 hover:underline"
            >
              Change email
            </button>
          </div>
        )}

        {/* Step 3: Reset */}
        {step === 3 && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Set a new password</p>
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>

            <input
              type={showPw ? "text" : "password"}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
            />

            <input
              type={showPw ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
            />

            <button
              onClick={resetPassword}
              disabled={resetting}
              className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {resetting ? "Updating…" : "Reset Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
