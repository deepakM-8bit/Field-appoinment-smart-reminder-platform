import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";

/* ---------- Small UI helpers ---------- */
function Section({ title, action, children }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-sm text-slate-500">{text}</div>
  );
}

export default function AdminDashboard() {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const approvalsRes = await api.get(
          "/api/appointments/pending-approvals"
        );
        setPendingApprovals(approvalsRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const approveRepair = async (id) => {
    try {
      await api.post(`/api/appointments/${id}/repair-approval`);
      setPendingApprovals((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert("Approval failed");
      console.log("approve failed error:",err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        Loading dashboard…
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
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Focus on approvals and assignments that need attention
        </p>
      </div>

      {/* P0: Pending Repair Approvals */}
      <Section
        title="Pending Repair Approvals"
        action={
          <Link
            to="/admin/pending-approvals"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all
          </Link>
        }
      >
        {pendingApprovals.length === 0 ? (
          <EmptyState text="No pending repair approvals 🎉" />
        ) : (
          <div className="space-y-3">
            {pendingApprovals.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-3 rounded-md border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="text-sm">
                  <p className="font-medium text-slate-900">
                    {a.customer_name}
                  </p>
                  <p className="text-slate-500">
                    {a.category} · ₹ {a.estimated_cost}
                  </p>
                </div>

                <button
                  onClick={() => approveRepair(a.id)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* P1: Unassigned appointments (placeholder, wired next) */}
      <Section
        title="Unassigned Appointments"
        action={
          <Link
            to="/admin/appointments"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all
          </Link>
        }
      >
        <EmptyState text="No unassigned appointments at the moment." />
      </Section>

      {/* P2: Secondary info */}
      <Section title="Today’s Overview">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md border border-gray-200 p-4">
            <p className="text-sm text-slate-500">Today’s Appointments</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              —{/* wire later */}
            </p>
          </div>

          <div className="rounded-md border border-gray-200 p-4">
            <p className="text-sm text-slate-500">Completed Repairs</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              —
            </p>
          </div>

          <div className="rounded-md border border-gray-200 p-4">
            <p className="text-sm text-slate-500">Revenue (Today)</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              ₹ —
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
