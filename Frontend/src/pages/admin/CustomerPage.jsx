import { useEffect, useMemo, useState } from "react";
import api from "../../services/api.js";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // add customer form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // UX
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/customers");
      setCustomers(res.data);
      setError("");
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
    if (!phone.trim()) {
      alert("Phone number is required");
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/customers", {
        name,
        phoneno: phone,
        email,
        address,
      });

      // reset form
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");

      await fetchCustomers();
    } catch (err) {
      console.error("Add customer error:", err);
      alert("Failed to add customer");
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;

    return customers.filter((c) => {
      const nameMatch = String(c.name || "").toLowerCase().includes(q);
      const phoneMatch = String(c.phone || "").toLowerCase().includes(q);
      const emailMatch = String(c.email || "").toLowerCase().includes(q);
      const addressMatch = String(c.address || "").toLowerCase().includes(q);
      return nameMatch || phoneMatch || emailMatch || addressMatch;
    });
  }, [customers, query]);

  if (loading) {
    return (
      <p className="py-20 text-center text-slate-500 dark:text-slate-400">
        Loading customers…
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
          Customers
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage customer records and contact info
        </p>
      </div>

      {/* Add Customer */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-md font-semibold text-slate-900 dark:text-slate-100">
              Add Customer
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Phone number is required. Others are optional.
            </p>
          </div>

          <button
            onClick={handleAddCustomer}
            disabled={saving}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 dark:bg-green-500 dark:hover:bg-green-600"
          >
            {saving ? "Saving…" : "Add Customer"}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600
                       dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
            placeholder="Name"
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
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 lg:col-span-4
                       dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      {/* Search + Stats */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Customer List
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {filteredCustomers.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {customers.length}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              placeholder="Search name / phone / email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:w-72 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600
                         dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500"
            />
            <button
              onClick={() => setQuery("")}
              className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200
                         dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {filteredCustomers.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            No customers found.
          </div>
        ) : (
          filteredCustomers.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {c.name || "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    #{c.id}
                  </p>
                </div>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                  {c.phone}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Email:
                  </span>{" "}
                  {c.email || "-"}
                </p>
                <p>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Address:
                  </span>{" "}
                  {c.address || "-"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600 border-b dark:bg-slate-950/40 dark:text-slate-300 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="py-3">Name</th>
                <th className="py-3">Phone</th>
                <th className="py-3">Email</th>
                <th className="py-3">Address</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                      #{c.id}
                    </td>
                    <td className="py-4 text-slate-700 dark:text-slate-200">
                      {c.name || "—"}
                    </td>
                    <td className="py-4 font-medium text-slate-900 dark:text-slate-100">
                      {c.phone}
                    </td>
                    <td className="py-4 text-slate-700 dark:text-slate-200">
                      {c.email || "-"}
                    </td>
                    <td className="py-4 text-slate-700 dark:text-slate-200">
                      {c.address || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
