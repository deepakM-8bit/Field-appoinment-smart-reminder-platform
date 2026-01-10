import { useEffect, useState } from "react";
import api from "../../services/api.js";

/* ---------- Helpers ---------- */
const to12Hour = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
};

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---- create form ---- */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [workStart, setWorkStart] = useState("");
  const [workEnd, setWorkEnd] = useState("");
  const [active, setActive] = useState(true);
  const [password, setPassword] = useState("");

  /* ---- edit modal ---- */
  const [editTech, setEditTech] = useState(null);
  const [editPassword, setEditPassword] = useState("");

  const fetchTechnicians = async () => {
    try {
      const res = await api.get("/api/technicians");
      setTechnicians(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load technicians");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  /* ---------- Add technician ---------- */
  const handleAddTechnician = async () => {
    if (!name || !phone || !category || !workStart || !workEnd || !password) {
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
        active,
        password,
      });

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
      console.error(err);
      alert("Failed to add technician");
    }
  };

  /* ---------- Toggle active ---------- */
  const toggleTechnicianStatus = async (t) => {
    try {
      await api.put(`/api/technicians/${t.id}`, {
        name: t.name,
        phoneno: t.phone,
        email: t.email,
        category: t.category,
        WST: t.work_start_time,
        WET: t.work_end_time,
        active: !t.active,
      });

      setTechnicians((prev) =>
        prev.map((x) =>
          x.id === t.id ? { ...x, active: !x.active } : x
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  /* ---------- Save edit ---------- */
  const saveEdit = async () => {
    try {
      await api.put(`/api/technicians/${editTech.id}`, {
        name: editTech.name,
        phoneno: editTech.phone,
        email: editTech.email,
        category: editTech.category,
        WST: editTech.work_start_time,
        WET: editTech.work_end_time,
        active: editTech.active,
        password: editPassword || undefined,
      });

      setEditTech(null);
      setEditPassword("");
      fetchTechnicians();
    } catch (err) {
      console.error(err);
      alert("Failed to update technician");
    }
  };

  if (loading) {
    return <p className="py-20 text-center text-slate-500">Loading technicians…</p>;
  }

  if (error) {
    return <p className="py-20 text-center text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Technicians</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage Technicians
        </p>
      </div>

      {/* Add Technician */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-md font-semibold text-slate-900">
          Add Technician
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <input 
            className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 input"
            placeholder="Name *" 
            value={name} 
            onChange={(e)=>setName(e.target.value)} 
          />

          <input 
            className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 input" 
            placeholder="Phone *" 
            value={phone} 
            onChange={(e)=>setPhone(e.target.value)} 
          />

          <input 
            className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 input" 
            placeholder="Email" 
            value={email} 
            onChange={(e)=>setEmail(e.target.value)} 
          />

          <input 
            className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 input" 
            placeholder="Temporary Password *" 
            value={password} 
            onChange={(e)=>setPassword(e.target.value)} 
          />

          <label className="text-sm font-semibold text-gray-600 mx-1">
            Work start time
            <input type="time" 
              className="rounded-md border border-gray-200 mx-2 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 input" 
              value={workStart} 
              onChange={(e)=>setWorkStart(e.target.value)} 
            />
          </label>

          <label className="text-sm font-semibold text-gray-600 mx-1">
            Work end time
            <input type="time" 
              className="rounded-md border border-gray-200 mx-2 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 input" 
              value={workEnd} 
              onChange={(e)=>setWorkEnd(e.target.value)} 
            />
          </label>

          <input 
            className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 input lg:col-span-2" 
            placeholder="Category (comma separated) *" 
            value={category} 
            onChange={(e)=>setCategory(e.target.value)} 
          />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e)=>setActive(e.target.checked)} />
            Active
          </label>

          <button onClick={handleAddTechnician} className="btn bg-green-300 text-green-800 rounded-md px-2 font-semibold">
            Add Technician
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Categories</th>
              <th className="px-4 py-3">Work Hours</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {technicians.map((t) => (
              <tr
                key={t.id}
                className={`border-t text-sm hover:bg-slate-50 ${!t.active ? "opacity-60" : ""}`}
              >
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3">{t.phone}</td>

                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {t.category.split(",").map((c, i) => (
                      <span 
                        key={i} 
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-700"
                      >
                        {c.trim()}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="px-4 py-3">
                  {to12Hour(t.work_start_time)} – {to12Hour(t.work_end_time)}
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleTechnicianStatus(t)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full ${t.active ? "bg-green-500" : "bg-slate-300"}`}
                  >
                    <span className={`h-4 w-4 rounded-full bg-white transition ${t.active ? "translate-x-4" : "translate-x-1"}`} />
                  </button>
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditTech(t)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold">Edit Technician</h2>

            <div className="grid grid-cols-2 gap-3">
              <input 
                placeholder="Name"
                className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 input" 
                value={editTech.name} 
                onChange={(e)=>setEditTech({...editTech,name:e.target.value})} 
              />
              <input
                placeholder="Phone no" 
                className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 input" 
                value={editTech.phone} 
                onChange={(e)=>setEditTech({...editTech,phone:e.target.value})} 
              />
              <input 
                placeholder="Email"
                className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 input" 
                value={editTech.email || ""} 
                onChange={(e)=>setEditTech({...editTech,email:e.target.value})} 
              />
              <input
                placeholder="Category" 
                className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 input" 
                value={editTech.category} 
                onChange={(e)=>setEditTech({...editTech,category:e.target.value})} 
              />
              <input type="time" 
                className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 input" 
                value={to12Hour(editTech.work_start_time)} 
                onChange={(e)=>setEditTech({...editTech,work_start_time:e.target.value})} 
              />
              <input type="time" 
                className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 input" 
                value={to12Hour(editTech.work_end_time)} 
                onChange={(e)=>setEditTech({...editTech,work_end_time:e.target.value})} 
              />
              <input 
                className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 input col-span-2" 
                placeholder="New password (optional)" 
                value={editPassword} onChange={(e)=>setEditPassword(e.target.value)} 
              />
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setEditTech(null)} className="btn bg-red-300 rounded-md px-2 text-red-800">
                Cancel
              </button>
              <button onClick={saveEdit} className="rounded-md px-2 first-line:btn-primary bg-sky-300 text-sky-900">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
