import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const LEAVE_API = `${API_BASE_URL}/api/v1/leave-management/leave-requests`;

const LEAVE_TYPES = ["Sick", "Casual", "Emergency", "Other"];

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function LeaveSkeleton() {
  return (
    <MainLayout title="Leave Portal">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm space-y-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-12 h-6" />
            </div>
          ))}
        </section>
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <Skeleton className="w-40 h-6" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-full h-12 rounded-lg" />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

function daysBetween(from, to) {
  if (!from || !to) return 0;
  const f = new Date(from);
  const t = new Date(to);
  const diff = Math.round((t - f) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 0;
}

const statusClasses = {
  Approved: "bg-green-100 text-green-700 border-green-200",
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
  Cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function LeavePortal() {
  const { profile: student } = useStudent();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [filterStatus, setFilterStatus] = useState("");

  const [form, setForm] = useState({
    leave_type: "Sick",
    start_date: "",
    end_date: "",
    reason: "",
  });

  // ── Fetch leave history (current user's requests) ──────────────────────
  const fetchLeaves = () => {
    setLoading(true);
    setError(null);
    fetch(`${LEAVE_API}/me/`, { headers: authHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load leave records");
        return r.json();
      })
      .then((data) => setLeaves(Array.isArray(data) ? data : data?.results || []))
      .catch((err) => setError(err.message || "Something went wrong"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // ── Stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const summary = { total: leaves.length, Approved: 0, Pending: 0, Rejected: 0 };
    leaves.forEach((l) => {
      if (summary[l.status] !== undefined) summary[l.status]++;
    });
    return summary;
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    if (!filterStatus) return leaves;
    return leaves.filter((l) => l.status === filterStatus);
  }, [leaves, filterStatus]);

  // ── Apply leave ──────────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm({ leave_type: "Sick", start_date: "", end_date: "", reason: "" });
    setFormError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!form.start_date || !form.end_date) {
      setFormError("Please select both Start and End dates.");
      return;
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      setFormError("End date cannot be before Start date.");
      return;
    }
    if (!form.reason.trim()) {
      setFormError("Please provide a reason for leave.");
      return;
    }

    setSubmitting(true);
    fetch(`${LEAVE_API}/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(form),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Could not submit leave request");
        return r.json();
      })
      .then(() => {
        resetForm();
        setShowForm(false);
        fetchLeaves();
      })
      .catch((err) => setFormError(err.message || "Something went wrong"))
      .finally(() => setSubmitting(false));
  };

  // ── Cancel leave ─────────────────────────────────────────────────────
  const handleCancel = (id) => {
    if (!window.confirm("Cancel this leave request?")) return;
    fetch(`${LEAVE_API}/${id}/cancel/`, {
      method: "POST",
      headers: authHeaders(),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Could not cancel leave request");
        return r.json();
      })
      .then(() => fetchLeaves())
      .catch((err) => alert(err.message || "Something went wrong"));
  };

  if (loading) return <LeaveSkeleton />;

  const statCards = [
    { label: "Total Applied", value: stats.total, icon: "event_note", color: "blue" },
    { label: "Approved", value: stats.Approved, icon: "check_circle", color: "green" },
    { label: "Pending", value: stats.Pending, icon: "hourglass_empty", color: "yellow" },
    { label: "Rejected", value: stats.Rejected, icon: "cancel", color: "red" },
  ];

  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <MainLayout title="Leave Portal">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">

        {/* HEADER ACTION */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold font-headline text-on-surface">My Leave Requests</h2>
            <p className="text-xs text-on-surface-variant">Apply for leave and track approval status</p>
          </div>
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">
              {showForm ? "close" : "add"}
            </span>
            {showForm ? "Close Form" : "Apply Leave"}
          </button>
        </section>

        {/* STAT CARDS */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="bg-surface-container-lowest px-4 py-3 rounded-xl shadow-sm border border-outline-variant/10 flex items-center gap-3"
            >
              <span className={`p-2 rounded-lg flex-shrink-0 ${colorMap[color]}`}>
                <span className="material-symbols-outlined text-xl">{icon}</span>
              </span>
              <div>
                <p className="text-xs font-medium text-on-surface-variant">{label}</p>
                <p className="text-xl font-bold font-headline text-on-surface leading-tight">{value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* APPLY LEAVE FORM */}
        {showForm && (
          <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-6 shadow-sm border border-outline-variant/10">
            <h3 className="text-base font-bold font-headline text-on-surface mb-4">Apply for Leave</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                    Leave Type
                  </label>
                  <select
                    name="leave_type"
                    value={form.leave_type}
                    onChange={handleChange}
                    className="w-full bg-surface-container border-none rounded-md px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-surface-tint outline-none"
                  >
                    {LEAVE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    className="w-full bg-surface-container border-none rounded-md px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-surface-tint outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    min={form.start_date || undefined}
                    className="w-full bg-surface-container border-none rounded-md px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-surface-tint outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Reason
                </label>
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Briefly describe the reason for leave..."
                  className="w-full bg-surface-container border-none rounded-md px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-surface-tint outline-none resize-none"
                />
              </div>

              {form.start_date && form.end_date && (
                <p className="text-xs text-on-surface-variant">
                  Duration: <span className="font-semibold text-primary">{daysBetween(form.start_date, form.end_date)} day(s)</span>
                </p>
              )}

              {formError && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {formError}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
                <button
                  type="button"
                  onClick={() => { resetForm(); setShowForm(false); }}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* HISTORY */}
        <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-6 shadow-sm border border-outline-variant/10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-bold font-headline text-on-surface">Leave History</h3>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-surface-container border-none rounded-md px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-surface-tint outline-none"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
              {error}
            </p>
          )}

          {filteredLeaves.length === 0 ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-4xl text-slate-300">event_busy</span>
              <p className="text-sm text-on-surface-variant mt-2">No leave requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-on-surface-variant border-b border-outline-variant/20">
                    <th className="py-2.5 pr-4 font-semibold">Type</th>
                    <th className="py-2.5 pr-4 font-semibold">From</th>
                    <th className="py-2.5 pr-4 font-semibold">To</th>
                    <th className="py-2.5 pr-4 font-semibold">Days</th>
                    <th className="py-2.5 pr-4 font-semibold">Reason</th>
                    <th className="py-2.5 pr-4 font-semibold">Status</th>
                    <th className="py-2.5 pr-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="border-b border-outline-variant/10 last:border-0">
                      <td className="py-3 pr-4 font-medium text-on-surface">{leave.leave_type}</td>
                      <td className="py-3 pr-4 text-on-surface-variant"> {new Date(leave.start_date).toLocaleDateString("en-GB").replace(/\//g, "-")} </td>
                      <td className="py-3 pr-4 text-on-surface-variant"> {new Date(leave.end_date).toLocaleDateString("en-GB").replace(/\//g, "-")} </td>
                      <td className="py-3 pr-4 text-on-surface-variant">
                        {leave.total_days ?? daysBetween(leave.start_date, leave.end_date)}
                      </td>
                      <td className="py-3 pr-4 text-on-surface-variant max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusClasses[leave.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {leave.status === "Pending" && (
                          <button
                            onClick={() => handleCancel(leave.id)}
                            className="text-xs font-semibold text-error hover:underline"
                          >
                            Withdraw
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}