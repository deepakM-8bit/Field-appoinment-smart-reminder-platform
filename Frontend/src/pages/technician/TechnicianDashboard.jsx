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

const prettifyStatus = (status) => String(status || "").replaceAll("_", " ");

const getStatusBadge = (status) => {
  const base =
    "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border";

  switch (status) {
    case "diagnosis_scheduled":
      return `${base} bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30`;

    case "repair_scheduled":
      return `${base} bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30`;

    case "diagnosis_in_progress":
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

function TypeBadge({ type }) {
  const base =
    "inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold";

  if (type === "repair") {
    return (
      <span className={`${base} bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300`}>
        Repair
      </span>
    );
  }

  return (
    <span className={`${base} bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200`}>
      Diagnosis
    </span>
  );
}

/* ---------------- Component ---------------- */
export default function TechnicianDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const fetchAppointments = async (dateValue) => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get(
        "/api/appointments/technician/appointments-bydate",
        {
          params: { date: dateValue },
        }
      );
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
    const diagnosis = appointments.filter(
      (a) => a.appointment_type === "diagnosis"
    ).length;
    const repair = appointments.filter((a) => a.appointment_type === "repair")
      .length;
    const completed = appointments.filter((a) => a.status === "repair_completed")
      .length;

    return { total, diagnosis, repair, completed };
  }, [appointments]);

  const today = new Date().toISOString().split("T")[0];

  /* ---------- UI states ---------- */
  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-slate-400">
        Loading appointments…
      </div>
    );
  }

  if (error) {
    return <div className="py-20 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-xl border-b border-gray-400 inline font-semibold text-slate-900 dark:text-slate-100">
        Technician Dashboard
      </h1>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>        
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Schedule
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View your assigned appointments by date
          </p>
        </div>

        {/* Date filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Date
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm text-slate-700 focus:outline-none dark:bg-transparent dark:text-slate-200"
            />
          </div>

          <button
            onClick={() => setSelectedDate(today)}
            className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Today
          </button>

          <button
            onClick={() => fetchAppointments(selectedDate)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ✅ Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {summary.total}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">Diagnosis</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {summary.diagnosis}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">Repair</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {summary.repair}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">Completed</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {summary.completed}
          </p>
        </div>
      </div>

      {/* Appointment list container */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Appointments — {formatDateDDMMYYYY(selectedDate)}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Tap an appointment to open details
            </p>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {appointments.length} item(s)
          </p>
        </div>

        {appointments.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              No appointments scheduled
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              You have no assigned appointments for{" "}
              {formatDateDDMMYYYY(selectedDate)}.
            </p>

            <button
              onClick={() => setSelectedDate(today)}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Go to Today
            </button>
          </div>
        ) : (
          <>
            {/* ✅ Mobile cards */}
            <div className="p-4 space-y-3 lg:hidden">
              {appointments.map((a) => (
                <button
                  key={a.id}
                  onClick={() => navigate(`/technician/appointments/${a.id}`)}
                  className="w-full text-left rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-slate-100 transition
                             dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {a.customer_name}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        #{a.id} • {a.category}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <TypeBadge type={a.appointment_type} />
                      <span className={getStatusBadge(a.status)}>
                        {prettifyStatus(a.status)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {to12Hour(a.scheduled_time)}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                        {a.customer_address || "-"}
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      View →
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* ✅ Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600 dark:bg-slate-950/40 dark:text-slate-300">
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

                <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                  {appointments.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => navigate(`/technician/appointments/${a.id}`)}
                      className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        #{a.id}
                      </td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                        {a.customer_name}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                        {a.category}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                          {a.appointment_type === "repair"
                            ? "Repair"
                            : "Diagnosis"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className={getStatusBadge(a.status)}>
                          {prettifyStatus(a.status)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                        {to12Hour(a.scheduled_time)}
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {a.customer_address || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
