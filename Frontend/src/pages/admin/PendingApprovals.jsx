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
      console.log("approval load error:",err.message);
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
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert("Approval failed");
      console.log("approval error:",err.message);
    }
  };

  if (loading) return <p>Loading approvals...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pending Repair Approvals</h2>

      {message && <p>{message}</p>}

      {appointments.length === 0 ? (
        <p>No pending approvals.</p>
      ) : (
        <table border="1" cellPadding="8" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Category</th>
              <th>Estimated Cost</th>
              <th>Schedule</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.customer_name}</td>
                <td>{a.category}</td>
                <td>{a.estimated_cost}</td>
                <td>{a.scheduled_date}</td>
                <td>
                  <button onClick={() => approveRepair(a.id)}>
                    Approve Repair
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
