import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api.js";

/* ---------------- Helpers ---------------- */
const to12Hour = (time) => {
  if (!time) return "-";
  const [hRaw, mRaw] = time.split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
};

const formatDateDDMMYYYY = (dateVal) => {
  if (!dateVal) return "-";
  const date = new Date(dateVal);
  const d = String(date.getUTCDate()).padStart(2, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const y = date.getUTCFullYear();
  return `${d}-${m}-${y}`;
};

const prettifyStatus = (status) => String(status || "").replaceAll("_", " ");

const getStatusBadgeClass = (status) => {
  const base =
    "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border";

  switch (status) {
    case "diagnosis_scheduled":
      return `${base} bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30`;

    case "diagnosis_in_progress":
      return `${base} bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30`;

    case "diagnosis_completed_waiting_approval":
      return `${base} bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30`;

    case "repair_scheduled":
      return `${base} bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30`;

    case "repair_in_progress":
      return `${base} bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30`;

    case "repair_completed":
      return `${base} bg-green-50 text-green-700 border-green-100 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/30`;

    case "waiting_for_assignment":
      return `${base} bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700`;

    case "cancelled":
      return `${base} bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30`;

    default:
      return `${base} bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700`;
  }
};

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-900 text-right dark:text-slate-100">
        {value}
      </span>
    </div>
  );
}

function Step({ title, active, done }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-6 w-6 rounded-full border flex items-center justify-center text-xs font-semibold
        ${
          done
            ? "bg-green-600 text-white border-green-600"
            : active
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-slate-500 border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-700"
        }`}
      >
        {done ? "✓" : ""}
      </div>
      <div className="min-w-0">
        <p
          className={`text-sm font-medium ${
            active
              ? "text-slate-900 dark:text-slate-100"
              : "text-slate-600 dark:text-slate-300"
          }`}
        >
          {title}
        </p>
      </div>
    </div>
  );
}

/* ---------------- Component ---------------- */
export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Notifications
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info | success | error

  // OTP
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Diagnosis form
  const [issue, setIssue] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [finalCost, setFinalCost] = useState("");
  const [requiresParts, setRequiresParts] = useState(false);
  const [repairDate, setRepairDate] = useState("");
  const [repairTime, setRepairTime] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [searchParams] = useSearchParams();
  const date = searchParams.get("date");

  const fetchAppointment = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/appointments/${id}`);
      setAppointment({ ...res.data });
    } catch (err) {
      console.error("Fetch appointment error:", err);
      setMessageType("error");
      setMessage("Failed to load appointment");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  // Clear message after some time
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 3500);
    return () => clearTimeout(t);
  }, [message]);

  const headerTitle = useMemo(() => {
    if (!appointment) return `Appointment`;
    return `Appointment #${appointment.id}`;
  }, [appointment]);

  const typeLabel =
    appointment?.appointment_type === "repair" ? "Repair" : "Diagnosis";

  // Stepper logic
  const stepState = useMemo(() => {
    if (!appointment) return { steps: [], activeIndex: 0 };

    const status = appointment.status;

    // diagnosis workflow
    if (appointment.appointment_type === "diagnosis") {
      const steps = ["OTP Verification", "Diagnosis In Progress", "Quote Sent"];
      let activeIndex = 0;

      if (status === "diagnosis_scheduled") activeIndex = 0;
      if (status === "diagnosis_in_progress") activeIndex = 1;
      if (status === "diagnosis_completed_waiting_approval") activeIndex = 2;

      return { steps, activeIndex };
    }

    // repair workflow
    if (appointment.appointment_type === "repair") {
      const steps = [
        "OTP Verification",
        "Repair In Progress",
        "Payment",
        "Completed",
      ];
      let activeIndex = 0;

      if (status === "repair_scheduled") activeIndex = 0;
      if (status === "repair_in_progress") activeIndex = otpRequested ? 2 : 1;
      if (status === "repair_completed") activeIndex = 3;

      return { steps, activeIndex };
    }

    return { steps: [], activeIndex: 0 };
  }, [appointment, otpRequested]);

  /* ---------------- OTP Actions ---------------- */
  const requestOtpDiagnosis = async () => {
    setOtpLoading(true);
    setMessage("");

    try {
      await api.post(`/api/otp/${id}/request-diagnosis-otp`);
      setOtpRequested(true);
      setMessageType("success");
      setMessage("OTP sent to customer");
    } catch (err) {
      console.error("Request OTP error:", err);
      setMessageType("error");
      setMessage("Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtpDiagnosis = async () => {
    if (!otp.trim()) return alert("Enter OTP");

    setOtpLoading(true);
    setMessage("");

    try {
      await api.post(`/api/otp/${id}/verify-diagnosis-otp`, { otp });
      setOtp("");
      setOtpRequested(false);
      setMessageType("success");
      setMessage("OTP verified. Diagnosis started.");

      await fetchAppointment();
    } catch (err) {
      console.error("Verify OTP error:", err);
      setMessageType("error");
      setMessage("Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const requestOtpRepair = async () => {
    setOtpLoading(true);
    setMessage("");

    try {
      await api.post(`/api/otp/${id}/request-repair-otp`);
      setOtpRequested(true);
      setMessageType("success");
      setMessage("Repair OTP sent to customer");
    } catch (err) {
      console.error("Request Repair OTP error:", err);
      setMessageType("error");
      setMessage("Failed to send repair OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtpRepair = async () => {
    if (!otp.trim()) return alert("Enter OTP");

    setOtpLoading(true);
    setMessage("");

    try {
      await api.post(`/api/otp/${id}/verify-repair-otp`, { otp });
      setOtp("");
      setOtpRequested(false);
      setMessageType("success");
      setMessage("Repair started");

      await fetchAppointment();
    } catch (err) {
      console.error("Verify Repair OTP error:", err);
      setMessageType("error");
      setMessage("Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const requestOtpPayment = async () => {
    if (!finalCost) return alert("Enter final amount");

    setOtpLoading(true);
    setMessage("");

    try {
      await api.post(`/api/otp/${id}/request-payment-otp`);
      setOtpRequested(true);
      setMessageType("success");
      setMessage("Payment OTP sent to customer");
    } catch (err) {
      console.error("Request Payment OTP error:", err);
      setMessageType("error");
      setMessage("Failed to send payment OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtpPayment = async () => {
    if (!otp.trim()) return alert("Enter OTP");

    setOtpLoading(true);
    setMessage("");

    try {
      await api.post(`/api/otp/${id}/verify-payment-otp`, {
        otp,
        final_cost: Number(finalCost),
      });

      setOtp("");
      setOtpRequested(false);
      setMessageType("success");
      setMessage("Payment completed successfully");

      await fetchAppointment();
    } catch (err) {
      console.error("Payment verification error:", err);
      setMessageType("error");
      setMessage("Payment verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  /* ---------------- Diagnosis Submission ---------------- */
  const submitDiagnosis = async () => {
    if (!issue || !durationHours || !estimatedCost || !repairDate) {
      alert("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      await api.post(`/api/appointments/${id}/diagnosis-complete`, {
        issue_description: issue,
        estimated_duration: Math.round(Number(durationHours) * 60),
        estimated_cost: Number(estimatedCost),
        final_cost: Number(finalCost),
        requires_parts: requiresParts,
        suggested_repair_date: repairDate,
        suggested_repair_time: repairTime,
      });

      setMessageType("success");
      setMessage("Diagnosis completed. Quote sent to customer.");

      // Clear form for UX
      setIssue("");
      setDurationHours("");
      setEstimatedCost("");
      setRequiresParts(false);
      setRepairDate("");
      setRepairTime("");

      await fetchAppointment();
    } catch (err) {
      console.error("Diagnosis completion error:", err);
      alert("Failed to complete diagnosis");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- UI states ---------------- */
  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-slate-400">
        Loading appointment…
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-slate-400">
        {message || "Appointment not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {headerTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review appointment details and complete tasks
          </p>
        </div>

        <button
          onClick={() => navigate(`/technician/dashboard?date=${date || ""}`)}
          className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200
                     dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Back
        </button>
      </div>

      {/* Summary Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {appointment.customer_name}
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                {typeLabel}
              </span>
              <span className={getStatusBadgeClass(appointment.status)}>
                {prettifyStatus(appointment.status)}
              </span>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Category:{" "}
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {appointment.category}
              </span>
            </p>
          </div>

          <div className="w-full max-w-sm space-y-2">
            <InfoRow
              label="Schedule"
              value={`${formatDateDDMMYYYY(appointment.scheduled_date)} • ${to12Hour(
                appointment.scheduled_time,
              )}`}
            />
            <InfoRow label="Phone" value={appointment.customer_phone || "-"} />
            <InfoRow
              label="Address"
              value={appointment.customer_address || "-"}
            />
          </div>
        </div>
      </div>

      {/* Stepper */}
      {appointment.status !== "cancelled" && stepState.steps.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Progress
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stepState.steps.map((s, idx) => (
              <Step
                key={s}
                title={s}
                active={idx === stepState.activeIndex}
                done={idx < stepState.activeIndex}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action Panel */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Actions
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Complete the required steps for this appointment
        </p>

        {/* Toast message */}
        {message && (
          <div
            className={`rounded-md border p-3 text-sm ${
              messageType === "success"
                ? "border-green-200 bg-green-50 text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300"
                : messageType === "error"
                  ? "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                  : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Diagnosis Scheduled */}
        {appointment.status === "diagnosis_scheduled" && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={requestOtpDiagnosis}
                disabled={otpLoading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60
                           dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {otpLoading ? "Sending…" : "Request OTP"}
              </button>

              <button
                onClick={() => fetchAppointment()}
                className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200
                           dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Refresh Status
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600
                           dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
              />
              <button
                onClick={verifyOtpDiagnosis}
                disabled={otpLoading || !otpRequested}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60
                           dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Verify OTP
              </button>
              <div className="text-xs text-slate-500 sm:flex sm:items-center dark:text-slate-400">
                Ask customer for OTP and verify to start diagnosis.
              </div>
            </div>
          </div>
        )}

        {/* Diagnosis In Progress */}
        {appointment.status === "diagnosis_in_progress" && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Diagnosis details */}
              <div className="rounded-md border border-gray-200 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Diagnosis Details
                </h3>

                <div className="mt-3 space-y-3">
                  <textarea
                    placeholder="Issue description *"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600
                               dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
                  />

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Estimated duration (hours) *
                      </label>
                      <input
                        placeholder="Eg: 1.5"
                        value={durationHours}
                        onChange={(e) => setDurationHours(e.target.value)}
                        type="number"
                        step="0.25"
                        min="0.25"
                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600
                                   dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
                      />
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Example: 1.5 hours = 90 minutes
                      </p>
                    </div>

                    <input
                      placeholder="Estimated cost (₹) *"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      type="number"
                      className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600
                                 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
                    />
                  </div>

                  <input
                    placeholder="Final cost (₹) *"
                    value={finalCost}
                    onChange={(e) => setFinalCost(e.target.value)}
                    type="number"
                    className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600
                               dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
                  />

                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={requiresParts}
                      onChange={(e) => setRequiresParts(e.target.checked)}
                      className="accent-blue-600"
                    />
                    Requires parts
                  </label>
                </div>
              </div>

              {/* Suggested repair schedule */}
              <div className="rounded-md border border-gray-200 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Suggested Repair Schedule
                </h3>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Repair Date *
                    </label>
                    <input
                      type="date"
                      value={repairDate}
                      onChange={(e) => setRepairDate(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600
                                 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Repair Time (optional)
                    </label>
                    <input
                      type="time"
                      value={repairTime}
                      onChange={(e) => setRepairTime(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600
                                 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={submitDiagnosis}
                  disabled={submitting}
                  className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60
                             dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {submitting ? "Submitting…" : "Submit Diagnosis"}
                </button>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Submitting diagnosis sends quote to customer for approval.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Repair Scheduled */}
        {appointment.status === "repair_scheduled" && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={requestOtpRepair}
                disabled={otpLoading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60
                           dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {otpLoading ? "Sending…" : "Start Repair (Request OTP)"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600
                           dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
              />
              <button
                onClick={verifyOtpRepair}
                disabled={otpLoading}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60
                           dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Verify OTP
              </button>
              <div className="text-xs text-slate-500 sm:flex sm:items-center dark:text-slate-400">
                Verify OTP to begin repair work.
              </div>
            </div>
          </div>
        )}

        {/* Repair In Progress */}
        {appointment.status === "repair_in_progress" && (
          <div className="mt-5 space-y-4">
            <div className="rounded-md border border-gray-200 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Complete Repair & Payment
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Enter final amount and verify payment OTP.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  placeholder="Final Amount (₹)"
                  type="number"
                  value={finalCost}
                  onChange={(e) => setFinalCost(e.target.value)}
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600
                             dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
                />

                <button
                  onClick={requestOtpPayment}
                  disabled={otpLoading}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60
                             dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {otpLoading ? "Sending…" : "Request Payment OTP"}
                </button>

                <div className="text-xs text-slate-500 sm:flex sm:items-center dark:text-slate-400">
                  OTP will be sent to customer for payment confirmation.
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  placeholder="Enter Payment OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600
                             dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
                />

                <button
                  onClick={verifyOtpPayment}
                  disabled={otpLoading}
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60
                             dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  Verify Payment
                </button>

                <div className="text-xs text-slate-500 sm:flex sm:items-center dark:text-slate-400">
                  Verify OTP to mark payment as completed.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completed */}
        {appointment.status === "repair_completed" && (
          <div className="mt-5 rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-500/30 dark:bg-green-500/10">
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              Repair completed successfully
            </p>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300/90">
              Payment is completed and appointment is closed.
            </p>
          </div>
        )}

        {/* Fallback */}
        {[
          "diagnosis_scheduled",
          "diagnosis_in_progress",
          "repair_scheduled",
          "repair_in_progress",
          "repair_completed",
        ].includes(appointment.status) === false && (
          <div className="mt-5 text-sm text-red-700 dark:text-red-300">
            No actions available for current status.
          </div>
        )}
      </div>
    </div>
  );
}
