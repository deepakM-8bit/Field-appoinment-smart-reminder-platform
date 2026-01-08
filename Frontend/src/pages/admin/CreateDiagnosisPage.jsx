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
    api.get("/api/customers").then((res) => setCustomers(res.data));
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
        st: time,
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
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Create Diagnosis Appointment
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Existing customers in system: {customers.length}
        </p>
      </div>

      {/* Customer Details */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-slate-800">
          Customer Details
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Customer name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Phone number *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      {/* Appointment Details */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-slate-800">
          Appointment Details
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            type="date"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            type="time"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      {/* Action */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white
                     hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Diagnosis"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4">
          <h4 className="text-sm font-semibold text-green-800">
            Appointment Created
          </h4>
          <p className="mt-1 text-sm text-green-700">
            Appointment ID: {result.appointment.id}
          </p>
          <p className="text-sm text-green-700">
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
