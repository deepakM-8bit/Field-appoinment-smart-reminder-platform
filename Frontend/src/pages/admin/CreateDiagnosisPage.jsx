import { useState } from "react";
import api from "../../services/api.js";

export default function CreateDiagnosisPage() {
  const [searchPhone, setSearchPhone] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [customerFound, setCustomerFound] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  /* ---------- Autocomplete search ---------- */
  const handlePhoneChange = async (value) => {
    setSearchPhone(value);
    setCustomerFound(false);

    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    try {
      const res = await api.get(
        `/api/appointments/customers/search?query=${value}`
      );

      setSuggestions(res.data);
      setShowDropdown(true);
    } catch (err) {
      console.error("Autocomplete failed", err);
    }
  };

  /* ---------- Select existing customer ---------- */
  const selectCustomer = (customer) => {
    setName(customer.name || "");
    setPhone(customer.phone || "");
    setEmail(customer.email || "");
    setAddress(customer.address || "");

    setCustomerFound(true);
    setSearchPhone(customer.phone);
    setSuggestions([]);
    setShowDropdown(false);
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

      {/* Phone Search */}
      <div className="relative mb-6">
        <input
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Search by phone number"
          value={searchPhone}
          onChange={(e) => handlePhoneChange(e.target.value)}
        />

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-sm">
            {suggestions.length > 0 ? (
              suggestions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectCustomer(c)}
                  className="flex w-full justify-between px-3 py-2 text-sm hover:bg-slate-100"
                >
                  <span>{c.phone}</span>
                  <span className="text-slate-500">{c.name}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">
                No existing customer — continue to create new
              </div>
            )}
          </div>
        )}
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
            className="rounded-md border border-gray-200 px-3 py-2 text-sm"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="rounded-md border border-gray-200 px-3 py-2 text-sm bg-slate-50"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="rounded-md border border-gray-200 px-3 py-2 text-sm"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="rounded-md border border-gray-200 px-3 py-2 text-sm"
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
            className="rounded-md border border-gray-200 px-3 py-2 text-sm"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            type="date"
            className="rounded-md border border-gray-200 px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            type="time"
            className="rounded-md border border-gray-200 px-3 py-2 text-sm"
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
