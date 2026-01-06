import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";

export default function TechnicianDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("/api/appointments/technician/today");
        setAppointments(res.data);
      } catch (err) {
        console.error("Technician dashboard error:", err);
        setError("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) return <p>Loading today's appointments...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Today's Appointments</h2>

      {appointments.length === 0 ? (
        <p>No appointments assigned for today.</p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Category</th>
              <th>Type</th>
              <th>Status</th>
              <th>Time</th>
              <th>Address</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((a) => (
              <tr 
                key={a.id}
                onClick={() => navigate('/technician/appointments/${a.id}')}
                style={{cursor: "pointer"}}
              >
                <td>{a.id}</td>
                <td>{a.customer_name}</td>
                <td>{a.category}</td>
                <td>{a.appointment_type}</td>
                <td>{a.status}</td>
                <td>{a.scheduled_time}</td>
                <td>{a.customer_address || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
