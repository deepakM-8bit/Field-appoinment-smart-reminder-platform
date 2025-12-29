import { useEffect, useState } from "react";
import api from "../../services/api.js";

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [workStart, setWorkStart] = useState("");
  const [workEnd, setWorkEnd] = useState("");
  const [active, setActive] = useState(true);

  const fetchTechnicians = async () => {
    try {
      const res = await api.get("/api/technicians");
      setTechnicians(res.data);
    } catch (err) {
      console.error("Fetch technicians error:", err);
      setError("Failed to load technicians");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleAddTechnician = async () => {
    if (!name || !phone || !category || !workStart || !workEnd) {
      alert("Please fill all required fields");
      return;
    }

    try {
      await api.post("/api/technicians", {
        name,
        phoneno: phone,
        email,
        category,
        WST: workStart,
        WET: workEnd,
        active
      });

      setName("");
      setPhone("");
      setEmail("");
      setCategory("");
      setWorkStart("");
      setWorkEnd("");
      setActive(true);

      fetchTechnicians();
    } catch (err) {
      console.error("Add technician error:", err);
      alert("Failed to add technician");
    }
  };

  if (loading) return <p>Loading technicians...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Technicians</h2>

      {/* Add technician form */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px"
        }}
      >
        <h4>Add Technician</h4>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: "8px" }}
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ marginRight: "8px" }}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginRight: "8px" }}
        />

        <input
          placeholder="Category (comma separated)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ marginRight: "8px" }}
        />

        <input
          type="time"
          value={workStart}
          onChange={(e) => setWorkStart(e.target.value)}
          style={{ marginRight: "8px" }}
        />

        <input
          type="time"
          value={workEnd}
          onChange={(e) => setWorkEnd(e.target.value)}
          style={{ marginRight: "8px" }}
        />

        <label style={{ marginLeft: "8px" }}>
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />{" "}
          Active
        </label>

        <br /><br />

        <button onClick={handleAddTechnician}>Add Technician</button>
      </div>

      {/* Technicians table */}
      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Category</th>
            <th>Work Hours</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {technicians.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.name}</td>
              <td>{t.phone}</td>
              <td>{t.email || "-"}</td>
              <td>{t.category}</td>
              <td>
                {t.work_start_time} - {t.work_end_time}
              </td>
              <td>{t.active ? "Active" : "Inactive"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
