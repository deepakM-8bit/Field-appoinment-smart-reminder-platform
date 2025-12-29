import { useEffect, useState } from "react";
import api from "../../services/api.js";

export default function CreateDiagnosisPage() {
  const [customers, setCustomers] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/api/customers").then(res => setCustomers(res.data));
  }, []);

  const handleSubmit = async () => {
    if (!phone || !category || !date || !time) {
      alert("Phone, category, date and time are required");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post("/api/appointments/diagnosis", {
        name,
        phoneno: phone,
        email,
        address,
        category,
        sd: date,
        st: time
      });

      setResult(res.data);
    } catch (err) {
      console.error("Create diagnosis error:", err);
      alert("Failed to create diagnosis appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Diagnosis Appointment</h2>

      <div
        style={{
          border: "1px solid #ddd",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px"
        }}
      >
        <h4>Customer Details</h4>

        <p style={{ fontSize: "12px", color: "#666" }}>
          Existing customers in system: {customers.length}
        </p>

        <input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ marginRight: "8px" }}
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={{ marginRight: "8px" }}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ marginRight: "8px" }}
        />

        <input
          placeholder="Address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          style={{ marginRight: "8px" }}
        />
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px"
        }}
      >
        <h4>Appointment Details</h4>

        <input
          placeholder="Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ marginRight: "8px" }}
        />

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ marginRight: "8px" }}
        />

        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
        />
      </div>

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Creating..." : "Create Diagnosis"}
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h4>Appointment Created</h4>
          <p>Appointment ID: {result.appointment.id}</p>
          <p>
            Technician:{" "}
            {result.autoAssignedTechnicianId
              ? result.autoAssignedTechnicianId
              : "Waiting for assignment"}
          </p>
        </div>
      )}
    </div>
  );
}
