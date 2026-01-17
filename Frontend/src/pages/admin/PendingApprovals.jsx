import { useEffect, useState } from "react";
import api from "../../services/api.js";

export default function PendingApprovals() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchApprovals = async () => {
    try {
      const res = await api.get("/api/appointments/pending-approvals");
      setAppointments(res.data);
    } catch (err) {
      setMessage("Failed to load approvals");
      console.log("approval load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const approveRepair = async (id) => {
    try {
      await api.post(`/api/appointments/${id}/repair-approval`);
      setMessage("Repair approved successfully");
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert("Approval failed");
      console.log("approval error:", err.message);
    }
  };

  if (loading)
    return (
      <p className="py-20 text-center text-slate-500 dark:text-slate-400">
        Loading approvals...
      </p>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Pending Repair Approvals
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Approve repair requests submitted after diagnosis completion
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
          {message}
        </div>
      )}

      {/* Empty */}
      {appointments.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          No pending approvals.
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 text-left text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Estimated Cost</th>
                  <th className="py-3">Schedule</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {appointments.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                      #{a.id}
                    </td>
                    <td className="py-4 text-slate-700 dark:text-slate-200">
                      {a.customer_name}
                    </td>
                    <td className="py-4 text-slate-700 dark:text-slate-200">
                      {a.category}
                    </td>
                    <td className="py-4 text-slate-700 dark:text-slate-200">
                      ₹ {a.estimated_cost}
                    </td>
                    <td className="py-4 text-slate-700 dark:text-slate-200">
                      {a.scheduled_date}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => approveRepair(a.id)}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        Approve Repair
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
