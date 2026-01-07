import { useEffect, useState } from "react";
import api from "../services/api.js";

export default function AssignTechnicianModal({
  appointment,
  onClose,
  onAssigned,
}) {
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await api.get("/api/technicians");
        setTechnicians(res.data);
      } catch (err) {
        setError("Failed to load technicians");
        console.log("failed to load technicians error:",err.message);
      }
    };

    fetchTechnicians();
  }, []);

  const handleAssign = async () => {
    if (!selectedTech) return;

    try {
      setLoading(true);
      await api.post(
        `/api/appointments/${appointment.id}/assign-technician`,
        { technicianId: selectedTech }
      );

      onAssigned(appointment.id);
      onClose();
    } catch (err) {
      setError("Assignment failed");
      console.log("assignment failed error:",err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-900">
          Assign Technician
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Appointment #{appointment.id}
        </p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700">
            Select Technician
          </label>
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">-- Select --</option>
            {technicians.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-slate-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleAssign}
            disabled={!selectedTech || loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}
