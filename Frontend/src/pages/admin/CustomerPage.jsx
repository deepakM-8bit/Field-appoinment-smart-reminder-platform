import { useEffect, useState } from "react";
import api from "../../services/api.js";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/api/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Fetch customers error:", err);
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async () => {
    if (!phone) {
      alert("Phone number is required");
      return;
    }

    try {
      await api.post("/api/customers", {
        name,
        phoneno: phone,
        email,
        address
      });

      setName("");
      setPhone("");
      setEmail("");
      setAddress("");

      fetchCustomers();
    } catch (err) {
      console.error("Add customer error:", err);
      alert("Failed to add customer");
    }
  };

  if (loading) return <p>Loading customers...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Customers</h2>

      {/* Add customer form */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px"
        }}
      >
        <h4>Add Customer</h4>

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
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ marginRight: "8px" }}
        />

        <button onClick={handleAddCustomer}>Add</button>
      </div>

      {/* Customers table */}
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
            <th>Address</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.phone}</td>
              <td>{c.email || "-"}</td>
              <td>{c.address || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
