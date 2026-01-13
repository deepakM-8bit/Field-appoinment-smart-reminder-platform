import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";

/* ---------------- Helpers ---------------- */
const formatDateDDMMYYYY = (yyyyMMdd) => {
  if (!yyyyMMdd) return "-";
  const [y, m, d] = yyyyMMdd.split("-");
  return `${d}-${m}-${y}`;
};

const to12Hour = (time) => {
  if (!time) return "-";
  const [hRaw, mRaw] = time.split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
};

const getStatusBadge = (status) => {
  const base = "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium";

  switch (status) {
    case "diagnosis_scheduled":
      return `${base} bg-blue-50 text-blue-700 border border-blue-100`;
    case "repair_scheduled":
      return `${base} bg-indigo-50 text-indigo-700 border border-indigo-100`;
    case "diagnosis_in_progress":
    case "repair_in_progress":
      return `${base} bg-amber-50 text-amber-700 border border-amber-100`;
    case "repair_completed":
      return `${base} bg-green-50 text-green-700 border border-green-100`;
    case "waiting_for_assignment":
      return `${base} bg-slate-100 text-slate-700 border border-slate-200`;
    case "cancelled":
      return `${base} bg-red-50 text-red-700 border border-red-100`;
    default:
      return `${base} bg-slate-100 text-slate-700 border border-slate-200`;
  }
};

const prettifyStatus = (status) =>
  String(status || "").replaceAll("_", " ");

/* ---------------- Component ---------------- */
export default function TechnicianDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0] // YYYY-MM-DD (today)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const fetchAppointments = async (dateValue) => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/api/appointments/technician/appointments-bydate", {
        params: { date: dateValue },
      });

      setAppointments(res.data);
    } catch (err) {
      console.error("Technician dashboard error:", err);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate]);

  const summary = useMemo(() => {
    const total = appointments.length;
    const diagnosis = appointments.filter((a) => a.appointment_type === "diagnosis").length;
    const repair = appointments.filter((a) => a.appointment_type === "repair").length;
    return { total, diagnosis, repair };
  }, [appointments]);

  /* ---------- UI states ---------- */
  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        Loading appointments…
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Schedule
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View your assigned appointments by date
          </p>
        </div>

        {/* Date filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-sm font-medium text-slate-700">
              Date
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm text-slate-700 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
            className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Today
          </button>

          <button
            onClick={() => fetchAppointments(selectedDate)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {summary.total}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Diagnosis</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {summary.diagnosis}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Repair</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {summary.repair}
          </p>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Appointments — {formatDateDDMMYYYY(selectedDate)}
          </h2>

          <p className="text-sm text-slate-500">
            {appointments.length} item(s)
          </p>
        </div>

        {appointments.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-slate-900">
              No appointments scheduled
            </p>
            <p className="mt-1 text-sm text-slate-500">
              You have no assigned appointments for{" "}
              {formatDateDDMMYYYY(selectedDate)}.
            </p>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to Today
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Address</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {appointments.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => navigate(`/technician/appointments/${a.id}`)}
                    className="cursor-pointer hover:bg-slate-100"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      #{a.id}
                    </td>

                    <td className="px-4 py-3 text-slate-800">
                      {a.customer_name}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {a.category}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {a.appointment_type === "repair" ? "Repair" : "Diagnosis"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={getStatusBadge(a.status)}>
                        {prettifyStatus(a.status)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {to12Hour(a.scheduled_time)}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {a.customer_address || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
