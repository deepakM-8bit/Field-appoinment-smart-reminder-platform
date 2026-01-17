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

  /* ---- delete modal ---- */
  const [deleteTech, setDeleteTech] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
        prev.map((x) => (x.id === t.id ? { ...x, active: !x.active } : x))
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

  /* ---------- Delete technician ---------- */
  const confirmDelete = async () => {
    if (!deleteTech) return;

    setDeleting(true);
    try {
      await api.delete(`/api/technicians/${deleteTech.id}`);

      setTechnicians((prev) => prev.filter((t) => t.id !== deleteTech.id));
      setDeleteTech(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete technician");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <p className="py-20 text-center text-slate-500 dark:text-slate-400">
        Loading technicians…
      </p>
    );
  }

  if (error) {
    return <p className="py-20 text-center text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Technicians
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage technicians
        </p>
      </div>

      {/* Add Technician */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-md font-semibold text-slate-900 dark:text-slate-100">
          Add Technician
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600
                       dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
            placeholder="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600
                       dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
            placeholder="Phone *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600
                       dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600
                       dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
            placeholder="Temporary Password *"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Work start */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Work start time *
            </label>
            <input
              type="time"
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600
                         dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-500"
              value={workStart}
              onChange={(e) => setWorkStart(e.target.value)}
            />
          </div>

          {/* Work end */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Work end time *
            </label>
            <input
              type="time"
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600
                         dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-500"
              value={workEnd}
              onChange={(e) => setWorkEnd(e.target.value)}
            />
          </div>

          <input
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:col-span-2 lg:col-span-3
                       dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
            placeholder="Category (comma separated) *"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="accent-blue-600"
            />
            Active
          </label>

          <button
            onClick={handleAddTechnician}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Add Technician
          </button>
        </div>
      </div>

      {/* -------------------- LIST VIEW (Mobile) -------------------- */}
      <div className="space-y-3 md:hidden">
        {technicians.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${
              !t.active ? "opacity-70" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.phone}</p>
                {t.email && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.email}</p>
                )}
              </div>

              <button
                onClick={() => toggleTechnicianStatus(t)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full ${
                  t.active ? "bg-green-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`h-4 w-4 rounded-full bg-white transition ${
                    t.active ? "translate-x-4" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {t.category.split(",").map((c, i) => (
                <span
                  key={i}
                  className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                >
                  {c.trim()}
                </span>
              ))}
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
              Work Hours:{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {to12Hour(t.work_start_time)} – {to12Hour(t.work_end_time)}
              </span>
            </p>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setEditTech(t)}
                className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteTech(t)}
                className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* -------------------- TABLE VIEW (Desktop) -------------------- */}
      <div className="hidden md:block rounded-lg border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-slate-50 text-sm text-slate-600 dark:bg-slate-950/40 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Categories</th>
                <th className="px-4 py-3 text-left">Work Hours</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {technicians.map((t) => (
                <tr
                  key={t.id}
                  className={`text-sm hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                    !t.active ? "opacity-70" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {t.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    {t.phone}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {t.category.split(",").map((c, i) => (
                        <span
                          key={i}
                          className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                        >
                          {c.trim()}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    {to12Hour(t.work_start_time)} – {to12Hour(t.work_end_time)}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleTechnicianStatus(t)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full ${
                        t.active ? "bg-green-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`h-4 w-4 rounded-full bg-white transition ${
                          t.active ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>

                  <td className="px-4 py-3 text-right space-x-4">
                    <button
                      onClick={() => setEditTech(t)}
                      className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => setDeleteTech(t)}
                      className="text-sm font-medium text-red-600 hover:underline dark:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-lg dark:bg-slate-900 dark:border dark:border-slate-800">
            <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Edit Technician
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                placeholder="Name"
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600
                           dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-500"
                value={editTech.name}
                onChange={(e) =>
                  setEditTech({ ...editTech, name: e.target.value })
                }
              />

              <input
                placeholder="Phone no"
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600
                           dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-500"
                value={editTech.phone}
                onChange={(e) =>
                  setEditTech({ ...editTech, phone: e.target.value })
                }
              />

              <input
                placeholder="Email"
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600
                           dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-500"
                value={editTech.email || ""}
                onChange={(e) =>
                  setEditTech({ ...editTech, email: e.target.value })
                }
              />

              <input
                placeholder="Category"
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600
                           dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-500"
                value={editTech.category}
                onChange={(e) =>
                  setEditTech({ ...editTech, category: e.target.value })
                }
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Work start
                </label>
                <input
                  type="time"
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600
                             dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-500"
                  value={editTech.work_start_time || ""}
                  onChange={(e) =>
                    setEditTech({
                      ...editTech,
                      work_start_time: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Work end
                </label>
                <input
                  type="time"
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600
                             dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-500"
                  value={editTech.work_end_time || ""}
                  onChange={(e) =>
                    setEditTech({
                      ...editTech,
                      work_end_time: e.target.value,
                    })
                  }
                />
              </div>

              <input
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:col-span-2
                           dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-500"
                placeholder="New password (optional)"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setEditTech(null)}
                className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg dark:bg-slate-900 dark:border dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Delete Technician
            </h2>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete{" "}
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {deleteTech.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTech(null)}
                disabled={deleting}
                className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-60
                           dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
