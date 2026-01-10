import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api.js";

const FILTERS = [
  { key: "completed", label: "Repair Completed" },
  { key: "diagnosis", label: "Diagnosis" },
  { key: "repair", label: "Repair" },
];

function formatDateDDMMYYYY(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function formatTime12h(timeStr) {
  if (!timeStr) return "-";
  const [h, m] = timeStr.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return timeStr;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export default function AdminAppointmentsPage() {
  const [filter, setFilter] = useState("completed");
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // detail panel
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
      // if cancelled appointment is selected, refresh detail
      fetchAppointments();
      if (selectedId === id) {
        setDetail(null);
        setSelectedId(null);
      }
    } catch (err) {
      alert("Failed to cancel appointment");
      console.log("failed to cancel the appointment error:", err.message);
    }
  };

  const fetchDetail = useCallback(async (id) => {
    if (!id) return;
    setDetailLoading(true);
    setDetail(null);

    try {
      // ✅ Recommended admin detail endpoint
      // If your backend uses another route, update only this line.
      const res = await api.get(`/api/appointments-list/admin/${id}`);
      setDetail(res.data);
    } catch (err) {
      console.error("Failed to load appointment detail", err);
      setDetail({
        error: true,
        message:
          "Detail endpoint not found or returned error. Confirm backend route: GET /api/appointments-list/admin/:id",
      });
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const onRowClick = (appt) => {
    setSelectedId(appt.id);
    fetchDetail(appt.id);
  };

  const selectedAppointment = useMemo(
    () => appointments.find((a) => a.id === selectedId),
    [appointments, selectedId]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Appointments</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track diagnosis and repair appointments in one place
        </p>
      </div>

      {/* Filters + search */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setFilter(f.key);
                  setPage(1);
                  setSelectedId(null);
                  setDetail(null);
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

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchAppointments()}
              className="w-full max-w-xs rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              onClick={() => {
                setPage(1);
                fetchAppointments();
              }}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* List */}
        <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Appointment List
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Click a row to view full details
            </p>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <p className="py-10 text-center text-slate-500">
                Loading appointments...
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="py-3">Customer</th>
                    <th className="py-3">Phone</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Schedule</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-slate-500">
                        No appointments found
                      </td>
                    </tr>
                  ) : (
                    appointments.map((a) => {
                      const isSelected = selectedId === a.id;
                      return (
                        <tr
                          key={a.id}
                          onClick={() => onRowClick(a)}
                          className={`cursor-pointer hover:bg-slate-50 ${
                            isSelected ? "bg-blue-50" : ""
                          }`}
                        >
                          <td className="px-5 py-4 font-medium text-slate-900">
                            #{a.id}
                          </td>
                          <td className="py-4">{a.customer_name}</td>
                          <td className="py-4">{a.customer_phone}</td>
                          <td className="py-4 capitalize">{a.appointment_type}</td>
                          <td className="py-4">
                            {a.status?.replaceAll("_", " ")}
                          </td>

                          {/* ✅ Schedule formatting */}
                          <td className="py-4">
                            <div className="flex flex-col leading-4">
                              <span className="font-medium text-slate-900">
                                {formatDateDDMMYYYY(a.scheduled_date)}
                              </span>
                              <span className="text-xs text-slate-500">
                                {formatTime12h(a.scheduled_time)}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-right">
                            {a.status !== "repair_completed" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // don't open detail
                                  handleCancel(a.id);
                                }}
                                className="text-sm font-medium text-red-600 hover:underline"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap justify-center gap-2 border-t px-5 py-4">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`rounded-md px-3 py-1 text-sm ${
                  page === i + 1
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 h-fit">
          <h2 className="text-sm font-semibold text-slate-900">
            Appointment Details
          </h2>

          {!selectedId ? (
            <p className="mt-3 text-sm text-slate-500">
              Select an appointment from the list to view full details.
            </p>
          ) : detailLoading ? (
            <p className="mt-3 text-sm text-slate-500">
              Loading details…
            </p>
          ) : detail?.error ? (
            <p className="mt-3 text-sm text-red-600">
              {detail.message}
            </p>
          ) : detail ? (
            <div className="mt-4 space-y-4 text-sm">
              <div className="rounded-md border border-gray-200 p-4">
                <p className="text-xs text-slate-500">Appointment</p>
                <p className="mt-1 font-semibold text-slate-900">
                  #{detail.id} · {detail.appointment_type?.toUpperCase()}
                </p>
                <p className="mt-1 text-slate-600">
                  Status: <span className="font-medium">{detail.status?.replaceAll("_", " ")}</span>
                </p>
              </div>

              <div className="rounded-md border border-gray-200 p-4">
                <p className="text-xs text-slate-500">Customer</p>
                <p className="mt-1 font-medium text-slate-900">
                  {detail.customer_name}
                </p>
                <p className="text-slate-600">{detail.customer_phone}</p>
                <p className="text-slate-600">{detail.customer_email || "-"}</p>
                <p className="mt-1 text-slate-600">{detail.customer_address || "-"}</p>
              </div>

              {/* Technician */}
              <div className="rounded-md border border-gray-200 p-4">
                <p className="text-xs text-slate-500">Assigned Technician</p>

                {detail.technician_name ? (
                  <>
                    <p className="mt-1 font-medium text-slate-900">
                      {detail.technician_name}
                    </p>
                    <p className="text-slate-600">{detail.technician_phone || "-"}</p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">
                    Not assigned yet
                  </p>
                )}
              </div>


              <div className="rounded-md border border-gray-200 p-4">
                <p className="text-xs text-slate-500">Schedule</p>
                <p className="mt-1 font-medium text-slate-900">
                  {formatDateDDMMYYYY(detail.scheduled_date)}
                </p>
                <p className="text-slate-600">{formatTime12h(detail.scheduled_time)}</p>
              </div>

              <div className="rounded-md border border-gray-200 p-4">
                <p className="text-xs text-slate-500">Service</p>
                <p className="mt-1 font-medium text-slate-900">
                  {detail.category}
                </p>
                <p className="mt-2 text-slate-600">
                  Issue: {detail.issue_description || "-"}
                </p>
                <p className="text-slate-600">
                  Requires parts:{" "}
                  <span className="font-medium">
                    {detail.requires_parts ? "Yes" : "No"}
                  </span>
                </p>
              </div>

              {/* Costs */}
              <div className="rounded-md border border-gray-200 p-4">
                <p className="text-xs text-slate-500">Cost</p>
                <p className="mt-2 text-slate-600">
                  Estimated:{" "}
                  <span className="font-semibold text-slate-900">
                    ₹ {detail.estimated_cost ?? "-"}
                  </span>
                </p>
                <p className="text-slate-600">
                  Final:{" "}
                  <span className="font-semibold text-slate-900">
                    ₹ {detail.final_cost ?? "-"}
                  </span>
                </p>
                <p className="text-slate-600">
                  Duration:{" "}
                  <span className="font-medium">
                    {detail.estimated_duration ? `${detail.estimated_duration} mins` : "-"}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No details loaded.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
