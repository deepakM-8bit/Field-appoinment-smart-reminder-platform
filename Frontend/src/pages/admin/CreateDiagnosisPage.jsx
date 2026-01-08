import { useState } from "react";
import api from "../../services/api.js";

export default function CreateDiagnosisPage() {
  const [searchPhone, setSearchPhone] = useState("");
  const [customerFound, setCustomerFound] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);

  /* ---------- Customer search ---------- */
  const searchCustomer = async () => {
    if (!searchPhone) return;

    setSearching(true);
    setCustomerFound(false);
    setResult(null);

    try {
      const res = await api.get(
        `/api/customers/by-phone?phone=${searchPhone}`
      );

      if (res.data) {
        const c = res.data;
        setCustomerFound(true);
        setName(c.name || "");
        setPhone(c.phoneno || searchPhone);
        setEmail(c.email || "");
        setAddress(c.address || "");
      } else {
        resetCustomerFields(searchPhone);
      }
    } catch (err) {
      console.error("Customer search failed", err);
      resetCustomerFields(searchPhone);
    } finally {
      setSearching(false);
    }
  };

  const resetCustomerFields = (phoneValue = "") => {
    setName("");
    setPhone(phoneValue);
    setEmail("");
    setAddress("");
  };

  /* ---------- Create diagnosis ---------- */
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
          Search customer by phone or create a new one
        </p>
      </div>

      {/* Customer Lookup */}
      <div className="mb-6 flex gap-3">
        <input
          className="w-xl rounded-md border border-gray-200 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Search by phone number"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
        />
        <button
          onClick={searchCustomer}
          disabled={searching}
          className="rounded-md bg-slate-200 px-4 py-2 text-sm font-medium
                     hover:bg-slate-300 disabled:opacity-60"
        >
          {searching ? "Searching…" : "Search"}
        </button>
      </div>

      {/* Customer Details */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-medium text-slate-800">
          Customer Details{" "}
          {customerFound && (
            <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
              Existing customer
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="rounded-md border border-gray-200 px-3 py-2 text-sm
                       focus:ring-2 focus:ring-blue-600"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="rounded-md border border-gray-200 px-3 py-2 text-sm bg-slate-50"
            placeholder="Phone"
            value={phone}
            disabled
          />

          <input
            className="rounded-md border border-gray-200 px-3 py-2 text-sm
                       focus:ring-2 focus:ring-blue-600"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="rounded-md border border-gray-200 px-3 py-2 text-sm
                       focus:ring-2 focus:ring-blue-600"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      {/* Appointment Details */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-medium text-slate-800">
          Appointment Details
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            className="rounded-md border border-gray-200 px-3 py-2 text-sm
                       focus:ring-2 focus:ring-blue-600"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            type="date"
            className="rounded-md border border-gray-200 px-3 py-2 text-sm
                       focus:ring-2 focus:ring-blue-600"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            type="time"
            className="rounded-md border border-gray-200 px-3 py-2 text-sm
                       focus:ring-2 focus:ring-blue-600"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      {/* Action */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white
                   hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Creating…" : "Create Diagnosis"}
      </button>

      {/* Result */}
      {result && (
        <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800">
            Diagnosis appointment created
          </p>
          <p className="text-sm text-green-700">
            Appointment ID: {result.appointment.id}
          </p>
        </div>
      )}
    </div>
  );
}
