import { useCallback, useEffect, useState } from "react";
import api from "../../services/api.js";

const FILTERS = [
  { key: "completed", label: "Repair Completed" },
  { key: "diagnosis", label: "Diagnosis" },
  { key: "repair", label: "Repair" },
];

export default function AppointmentsModal({ onClose }) {
  const [filter, setFilter] = useState("completed");
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/appointments-list/admin-list", {
        params: { filter, page, phone },
      });

      setAppointments(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to load appointments", err);
    } finally {
      setLoading(false);
    }
  }, [filter, page, phone]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );
    if (!confirm) return;

    try {
      await api.post(`/api/appointments-list/${id}/cancel`);
      fetchAppointments();
    } catch (err) {
      alert("Failed to cancel appointment");
      console.log("failed to cancel the appointment error:",err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Appointments
          </h2>
          <button
            onClick={onClose}
            className="text-xl text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setFilter(f.key);
                  setPage(1);
                }}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  filter === f.key
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search by phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchAppointments()}
            className="w-64 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {/* Table */}
        <div className="px-6 flex-1 overflow-auto">
          {loading ? (
            <p className="py-10 text-center text-slate-500">
              Loading appointments...
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-slate-600">
                  <tr>
                    <th className="py-2">ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Schedule</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {appointments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-6 text-center text-slate-500"
                      >
                        No appointments found
                      </td>
                    </tr>
                  ) : (
                    appointments.map((a) => (
                      <tr key={a.id}>
                        <td className="py-3 font-medium">#{a.id}</td>
                        <td>{a.customer_name}</td>
                        <td>{a.customer_phone}</td>
                        <td className="capitalize">{a.appointment_type}</td>
                        <td>{a.status.replaceAll("_", " ")}</td>
                        <td>
                          {a.scheduled_date}{" "}
                          <span className="text-xs text-slate-500">
                            {a.scheduled_time}
                          </span>
                        </td>
                        <td className="text-right">
                          {a.status !== "repair_completed" && (
                            <button
                              onClick={() => handleCancel(a.id)}
                              className="text-sm font-medium text-red-600 hover:underline"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 border-t px-6 py-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`rounded-md px-3 py-1 text-sm ${
                page === i + 1
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
