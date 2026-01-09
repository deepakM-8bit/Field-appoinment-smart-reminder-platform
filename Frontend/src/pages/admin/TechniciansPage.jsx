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
  const [password, setPassword] = useState("");

// Convert 24h time (HH:mm) → 12h format (h:mm AM/PM)
  const to12Hour = (time) => {
    if (!time) return "";
      const [h, m] = time.split(":").map(Number);
      const period = h >= 12 ? "PM" : "AM";
      const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
  };

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
    if (
      !name ||
      !phone ||
      !category ||
      !workStart ||
      !workEnd ||
      !password
    ) {
      alert("Please fill all required fields, including temporary password");
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
        active,
        password,
      });

      // reset form
      setName("");
      setPhone("");
      setEmail("");
      setCategory("");
      setWorkStart("");
      setWorkEnd("");
      setActive(true);
      setPassword("");

      fetchTechnicians();
    } catch (err) {
      console.error("Add technician error:", err);
      alert("Failed to add technician");
    }
  };

  const toggleTechnicianStatus = async (technician) => {
  try {
    await api.put(`/api/technicians/${technician.id}`, {
      name: technician.name,
      phoneno: technician.phone,
      email: technician.email,
      category: technician.category,
      WST: technician.work_start_time,
      WET: technician.work_end_time,
      active: !technician.active,
      password: "unchanged" // backend expects password; see note below
    });

    // update UI optimistically
    setTechnicians((prev) =>
      prev.map((t) =>
        t.id === technician.id
          ? { ...t, active: !t.active }
          : t
        )
      );
    } catch (err) {
      console.error("Toggle technician status error:", err);
      alert("Failed to update technician status");
    }
  };


  if (loading) {
    return (
      <p className="py-20 text-center text-slate-500">
        Loading technicians…
      </p>
    );
  }

  if (error) {
    return (
      <p className="py-20 text-center text-red-600">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Technicians
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage technicians
        </p>
      </div>

      {/* Add Technician */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Add Technician
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input
            className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
            placeholder="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
            placeholder="Phone *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Temporary Password */}
          <input
            className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
            placeholder="Temporary Password *"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="text-sm text-gray-600 font-medium mx-1">
            Work start time
            <input
              type="time"
              className="rounded-md border border-gray-200 mx-2 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
              value={workStart}
              onChange={(e) => setWorkStart(e.target.value)}
            />
          </label>

          <label className="text-sm text-gray-600 font-medium mx-1">
            Work end time
            <input
              type="time"
              className="rounded-md border border-gray-200 mx-2 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
              value={workEnd}
              onChange={(e) => setWorkEnd(e.target.value)}
            />

          </label>
                    <input
            className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
            placeholder="Category (comma separated) *"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

        </div>

        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Active
          </label>

          <button
            onClick={handleAddTechnician}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Technician
          </button>
        </div>
      </div>

      {/* Technicians Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm text-slate-600">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Categories</th>
              <th className="px-4 py-3">Work Hours</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {technicians.map((t) => (
              <tr
                key={t.id}
                className={`border-t text-sm hover:bg-slate-50"
                  ${!t.active ? "opacity-60" : ""}`}
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {t.name}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {t.phone}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {t.email || "-"}
                </td>

                {/* Categories as chips */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {t.category
                      .split(",")
                      .map((c, i) => (
                        <span
                          key={i}
                          className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                        >
                          {c.trim()}
                        </span>
                      ))}
                  </div>
                </td>

                <td className="px-4 py-3 flex flex-col text-slate-700">
                  {to12Hour(t.work_start_time)} - {to12Hour(t.work_end_time)}
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleTechnicianStatus(t)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition
                      ${t.active ? "bg-green-500" : "bg-slate-300"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                        ${t.active ? "translate-x-4" : "translate-x-1"}`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
