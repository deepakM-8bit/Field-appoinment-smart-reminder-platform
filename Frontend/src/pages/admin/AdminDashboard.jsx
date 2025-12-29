import { useEffect, useState } from "react";
import api from "../../services/api.js";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/api/dashboard/summary");
        setSummary(res.data);
      } catch (err) {
        console.error("Dashboard summary error:", err);
        setError("Failed to load dashboard summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginTop: "20px"
        }}
      >
        <DashboardCard
          title="Today's Diagnosis"
          value={summary.todayDiagnosis}
        />

        <DashboardCard
          title="Pending Repairs"
          value={summary.pendingRepairs}
        />

        <DashboardCard
          title="Today's Repairs"
          value={summary.todayRepairs}
        />

        <DashboardCard
          title="Revenue (Last 30 Days)"
          value={`₹ ${summary.revenueLast30Days}`}
        />
      </div>
    </div>
  );
}

function DashboardCard({ title, value }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "16px",
        borderRadius: "8px",
        backgroundColor: "#fafafa"
      }}
    >
      <h4>{title}</h4>
      <p style={{ fontSize: "22px", fontWeight: "bold" }}>{value}</p>
    </div>
  );
}
