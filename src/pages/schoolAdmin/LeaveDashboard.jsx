import React, { useEffect, useMemo, useState } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useSchoolAdmin } from "../../context/SchoolAdminProvider";
import { schoolAdminApi } from "../../services/schoolAdminApi";

/* ─────────────────────────────────────────────
   API layer
   All calls now go through services/schoolAdminApi.js (getLeaveRequests,
   approveLeaveRequest, rejectLeaveRequest), same as every other page.
───────────────────────────────────────────── */
const fetchLeaves = (filters) => schoolAdminApi.getLeaveRequests(filters);
const approveLeave = (id, remarks) => schoolAdminApi.approveLeaveRequest(id, remarks);
const rejectLeave = (id, remarks) => schoolAdminApi.rejectLeaveRequest(id, remarks);

/* ─────────────────────────────────────────────
   Skeleton (matches Teachers.jsx / Dashboard.jsx shimmer)
───────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("skeleton-style")) {
  const s = document.createElement("style");
  s.id = "skeleton-style";
  s.textContent = `@keyframes skeleton-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
  document.head.appendChild(s);
}

function Skeleton({ className = "", style = {} }) {
  return (
    <div
      className={`rounded-md ${className}`}
      style={{
        background:
          "linear-gradient(90deg, color-mix(in srgb, var(--color-outline-variant) 16%, var(--color-surface-container-lowest)) 25%, color-mix(in srgb, var(--color-outline-variant) 28%, var(--color-surface-container-lowest)) 50%, color-mix(in srgb, var(--color-outline-variant) 16%, var(--color-surface-container-lowest)) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.4s ease infinite",
        ...style,
      }}
    />
  );
}

function LeaveDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 md:px-8 pt-4 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Skeleton style={{ width: 180, height: 28 }} />
          <Skeleton style={{ width: 280, height: 16, marginTop: 6 }} />
        </div>
        <Skeleton style={{ width: 100, height: 36, borderRadius: 8 }} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 border border-outline-variant/10 bg-surface-container-lowest" style={{ minHeight: 84 }}>
            <Skeleton style={{ width: 28, height: 28, borderRadius: 6 }} />
            <Skeleton style={{ width: 70, height: 10, marginTop: 10 }} />
            <Skeleton style={{ width: 40, height: 20, marginTop: 6 }} />
          </div>
        ))}
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-outline-variant/10 last:border-0">
            <Skeleton style={{ width: 36, height: 36, borderRadius: 999 }} />
            <div className="flex-1">
              <Skeleton style={{ width: "40%", height: 12 }} />
              <Skeleton style={{ width: "25%", height: 10, marginTop: 6 }} />
            </div>
            <Skeleton style={{ width: 70, height: 20, borderRadius: 999 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Demo data — shown only if the API call fails, so the screen is never
   empty while you're wiring this up. Remove once the backend is live.
───────────────────────────────────────────── */
const DEMO_LEAVES = [
  { id: "d1", applicant_role: "Teacher", applicant_name: "Meera Joshi", leave_type: "Sick", start_date: "2026-07-02", end_date: "2026-07-03", total_days: 2, reason: "Viral fever, doctor advised rest.", status: "Pending", applied_at: "2026-06-28T09:12:00Z", attachment: null },
  { id: "d2", applicant_role: "Student", applicant_name: "Aarav Singh", leave_type: "Casual", start_date: "2026-07-01", end_date: "2026-07-01", total_days: 1, reason: "Family function.", status: "Pending", applied_at: "2026-06-27T14:02:00Z", attachment: null },
  { id: "d3", applicant_role: "Teacher", applicant_name: "Rohan Kapoor", leave_type: "Emergency", start_date: "2026-06-30", end_date: "2026-06-30", total_days: 1, reason: "Family emergency, need to travel out of city.", status: "Approved", applied_at: "2026-06-26T08:40:00Z", reviewed_by_name: "Admin Office", reviewed_at: "2026-06-26T11:00:00Z", review_remarks: "Approved, hope all is well." },
  { id: "d4", applicant_role: "Student", applicant_name: "Diya Patel", leave_type: "Sick", start_date: "2026-06-24", end_date: "2026-06-26", total_days: 3, reason: "Chickenpox, isolation advised.", status: "Approved", applied_at: "2026-06-23T10:00:00Z", reviewed_by_name: "Sana Reddy", reviewed_at: "2026-06-23T12:00:00Z" },
  { id: "d5", applicant_role: "Teacher", applicant_name: "Imran Sheikh", leave_type: "Casual", start_date: "2026-07-10", end_date: "2026-07-11", total_days: 2, reason: "Personal work.", status: "Rejected", applied_at: "2026-06-20T09:00:00Z", reviewed_by_name: "Admin Office", reviewed_at: "2026-06-21T09:00:00Z", review_remarks: "Clashes with mid-term exam duty, please reschedule." },
];

const STATUS_BADGE = {
  Pending: "bg-[color-mix(in_srgb,var(--color-secondary)_14%,transparent)] text-secondary",
  Approved: "bg-success/15 text-success",
  Rejected: "bg-error/15 text-error",
  Cancelled: "bg-outline-variant/20 text-outline",
};

const STATUS_ICON = { Pending: "hourglass_empty", Approved: "check_circle", Rejected: "cancel", Cancelled: "block" };

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function formatDateRange(start, end) {
  if (start === end) return formatDate(start);
  return `${formatDate(start)} – ${formatDate(end)}`;
}
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
}

/* ─────────────────────────────────────────────
   Stat card (same shape as Teachers.jsx StatCard)
───────────────────────────────────────────── */
function StatCard({ icon, label, value, accentColor, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative overflow-hidden rounded-xl p-4 flex flex-col justify-between text-left transition-all duration-200"
      style={{
        background: "var(--color-surface-container-lowest)",
        border: active
          ? `1px solid ${accentColor}`
          : "1px solid color-mix(in srgb, var(--color-outline-variant) 12%, transparent)",
        borderLeft: `3px solid ${accentColor}`,
        minHeight: "84px",
        boxShadow: active ? `0 4px 16px color-mix(in srgb, ${accentColor} 16%, transparent)` : "none",
      }}
    >
      <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full opacity-[0.04] pointer-events-none" style={{ background: accentColor }} />
      <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `color-mix(in srgb, ${accentColor} 12%, transparent)` }}>
        <span className="material-symbols-outlined" style={{ color: accentColor, fontSize: "16px" }}>{icon}</span>
      </div>
      <div className="mt-2">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-on-surface-variant)" }}>{label}</p>
        <p className="text-xl font-headline font-black leading-none" style={{ color: "var(--color-on-surface)" }}>{value}</p>
      </div>
    </button>
  );
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full leading-none ${STATUS_BADGE[status] || ""}`}>
      <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>{STATUS_ICON[status]}</span>
      {status}
    </span>
  );
}

function RoleTag({ role }) {
  const isTeacher = role === "Teacher";
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
      style={{
        background: isTeacher ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "color-mix(in srgb, var(--color-tertiary) 14%, transparent)",
        color: isTeacher ? "var(--color-primary)" : "var(--color-tertiary)",
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "11px" }}>{isTeacher ? "person" : "school"}</span>
      {role}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Mobile-friendly bottom-sheet / centered modal shell
───────────────────────────────────────────── */
function Sheet({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-surface-container-lowest w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[88vh] overflow-y-auto p-5 sm:p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────── */

export default function LeaveDashboard() {
  // `refreshLeaveStats` is optional — only present once you've added the
  // leave-stats slice to SchoolAdminProvider (see the integration note in
  // the PR/README). Falls back to a no-op so this page still works without it.
  const { refreshLeaveStats } = useSchoolAdmin() || {};

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [selected, setSelected] = useState(null);
  const [reviewing, setReviewing] = useState(null); // { leave, action }
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaves({});
      setLeaves(Array.isArray(data) ? data : data.results || []);
      setUsingDemoData(false);
    } catch (err) {
      console.error("Fetch leave requests error:", err);
      setLeaves(DEMO_LEAVES);
      setUsingDemoData(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    return leaves.filter((l) => {
      if (statusFilter !== "ALL" && l.status !== statusFilter) return false;
      if (roleFilter !== "ALL" && l.applicant_role !== roleFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const name = (l.applicant_name || "").toLowerCase();
        const reason = (l.reason || "").toLowerCase();
        if (!name.includes(q) && !reason.includes(q)) return false;
      }
      return true;
    });
  }, [leaves, statusFilter, roleFilter, debouncedSearch]);

  const stats = useMemo(() => {
    const pendingTeacher = leaves.filter((l) => l.status === "Pending" && l.applicant_role === "Teacher").length;
    const pendingStudent = leaves.filter((l) => l.status === "Pending" && l.applicant_role === "Student").length;
    const approved = leaves.filter((l) => l.status === "Approved").length;
    const rejected = leaves.filter((l) => l.status === "Rejected").length;
    return { pendingTeacher, pendingStudent, approved, rejected };
  }, [leaves]);

  function openReview(leave, action) {
    setRemarks("");
    setReviewing({ leave, action });
  }

  async function submitReview() {
    if (!reviewing) return;
    const { leave, action } = reviewing;
    setSubmitting(true);
    try {
      const fn = action === "approve" ? approveLeave : rejectLeave;
      const updated = usingDemoData
        ? {
            ...leave,
            status: action === "approve" ? "Approved" : "Rejected",
            review_remarks: remarks,
            reviewed_by_name: "Admin Office",
            reviewed_at: new Date().toISOString(),
          }
        : await fn(leave.id, remarks);
      setLeaves((prev) => prev.map((l) => (l.id === leave.id ? updated : l)));
      setToast({ type: "success", message: `Leave request ${action === "approve" ? "approved" : "rejected"}.` });
      setReviewing(null);
      setSelected(null);
      if (typeof refreshLeaveStats === "function") refreshLeaveStats();
    } catch (err) {
      setToast({ type: "error", message: err.message || "Could not submit review." });
    } finally {
      setSubmitting(false);
    }
  }

  // Only teacher-applied leave requests are actionable here — student
  // leave is approved by the student's section/class teacher, not the
  // school admin (see leave_management backend README).
  const canReview = (l) => l.status === "Pending" && l.applicant_role === "Teacher";

  if (loading) {
    return (
      <SchoolLayout title="Leave Requests">
        <LeaveDashboardSkeleton />
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Leave Requests">
      <div className="flex flex-col gap-4 px-4 md:px-8 pt-4 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface">Leave Requests</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body">
              Review teacher leave applications. Student leave is handled by section teachers.
            </p>
          </div>
          <button
            onClick={load}
            className="self-start sm:self-auto whitespace-nowrap border border-outline-variant/20 text-on-surface px-4 py-2 rounded-lg text-sm font-bold hover:bg-surface-container-high/50 transition-all active:scale-95 flex items-center gap-2"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`}>refresh</span>
            Refresh
          </button>
        </div>

        {usingDemoData && (
          <div className="p-3 bg-secondary/10 text-on-surface rounded-xl border border-secondary/20 text-xs font-body flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
            Showing sample data — couldn't reach the leave management API. Connect this screen to your live backend to see real records.
          </div>
        )}

        {error && (
          <div className="p-3 bg-error/10 text-error rounded-xl border border-error/20 text-sm font-body">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon="person_alert"
            label="Teacher leaves pending"
            value={stats.pendingTeacher}
            accentColor="var(--color-error)"
            active={statusFilter === "Pending" && roleFilter === "Teacher"}
            onClick={() => { setStatusFilter("Pending"); setRoleFilter("Teacher"); }}
          />
          <StatCard
            icon="school"
            label="Student leaves pending"
            value={stats.pendingStudent}
            accentColor="var(--color-tertiary)"
            active={statusFilter === "Pending" && roleFilter === "Student"}
            onClick={() => { setStatusFilter("Pending"); setRoleFilter("Student"); }}
          />
          <StatCard
            icon="check_circle"
            label="Approved"
            value={stats.approved}
            accentColor="var(--color-secondary)"
            active={statusFilter === "Approved"}
            onClick={() => { setStatusFilter("Approved"); setRoleFilter("ALL"); }}
          />
          <StatCard
            icon="cancel"
            label="Rejected"
            value={stats.rejected}
            accentColor="var(--color-outline)"
            active={statusFilter === "Rejected"}
            onClick={() => { setStatusFilter("Rejected"); setRoleFilter("ALL"); }}
          />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or reason..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-surface-container-high/50 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary transition outline-none"
              style={{ color: "var(--color-on-surface)" }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm bg-surface-container-high/50 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            style={{ color: "var(--color-on-surface)" }}
          >
            <option value="ALL">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm bg-surface-container-high/50 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            style={{ color: "var(--color-on-surface)" }}
          >
            <option value="ALL">All applicants</option>
            <option value="Teacher">Teachers</option>
            <option value="Student">Students</option>
          </select>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-semibold text-on-surface-variant">
              {filtered.length} {filtered.length === 1 ? "request" : "requests"}
            </span>
          </div>
        </div>

        {/* ── Desktop / tablet: table (md and up) ── */}
        <div className="hidden md:block bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface-container-high/30 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Applied</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">event_busy</span>
                      <p className="text-sm font-medium">No leave requests found</p>
                      <p className="text-xs">Try adjusting your filters.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((l, index) => (
                    <tr
                      key={l.id}
                      onClick={() => setSelected(l)}
                      className="group cursor-pointer transition-all duration-150 hover:bg-surface-container-high/30"
                      style={{ animation: `fadeInUp 0.25s ease ${index * 0.03}s both` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs border border-outline-variant/20 shrink-0">
                            {getInitials(l.applicant_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-on-surface group-hover:text-primary transition-colors truncate">{l.applicant_name}</p>
                            <RoleTag role={l.applicant_role} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">{l.leave_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant">
                        {formatDateRange(l.start_date, l.end_date)}
                        <span className="text-outline"> · {l.total_days}d</span>
                      </td>
                      <td className="px-6 py-4 text-center"><StatusPill status={l.status} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant text-xs">{formatDate(l.applied_at)}</td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {canReview(l) ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openReview(l, "approve")}
                              className="p-1.5 rounded-md text-success hover:bg-success/10 transition"
                              title="Approve"
                            >
                              <span className="material-symbols-outlined text-[18px]">check</span>
                            </button>
                            <button
                              onClick={() => openReview(l, "reject")}
                              className="p-1.5 rounded-md text-error hover:bg-error/10 transition"
                              title="Reject"
                            >
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                          </div>
                        ) : l.status === "Pending" && l.applicant_role === "Student" ? (
                          <span className="text-xs text-on-surface-variant italic">Section teacher's call</span>
                        ) : (
                          <span className="text-xs text-on-surface-variant">{l.reviewed_by_name ? `by ${l.reviewed_by_name}` : "—"}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Mobile: stacked cards (below md) ── */}
        <div className="md:hidden flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 px-6 py-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">event_busy</span>
              <p className="text-sm font-medium">No leave requests found</p>
              <p className="text-xs">Try adjusting your filters.</p>
            </div>
          ) : (
            filtered.map((l) => (
              <div
                key={l.id}
                onClick={() => setSelected(l)}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm p-4 active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs border border-outline-variant/20 shrink-0">
                      {getInitials(l.applicant_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-on-surface truncate">{l.applicant_name}</p>
                      <div className="mt-1"><RoleTag role={l.applicant_role} /></div>
                    </div>
                  </div>
                  <StatusPill status={l.status} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs text-on-surface-variant">
                  <span className="font-semibold text-on-surface">{l.leave_type} leave</span>
                  <span className="text-right">{l.total_days} day{l.total_days > 1 ? "s" : ""}</span>
                  <span className="col-span-2">{formatDateRange(l.start_date, l.end_date)}</span>
                </div>

                <p className="mt-2 text-xs text-on-surface-variant line-clamp-2">{l.reason}</p>

                {canReview(l) ? (
                  <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openReview(l, "approve")}
                      className="flex-1 bg-success/10 text-success rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">check</span> Approve
                    </button>
                    <button
                      onClick={() => openReview(l, "reject")}
                      className="flex-1 bg-error/10 text-error rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">close</span> Reject
                    </button>
                  </div>
                ) : l.status === "Pending" && l.applicant_role === "Student" ? (
                  <p className="mt-3 text-[11px] text-on-surface-variant italic">Awaiting section teacher's review</p>
                ) : (
                  <p className="mt-3 text-[11px] text-on-surface-variant">
                    {l.reviewed_by_name ? `Reviewed by ${l.reviewed_by_name}` : ""}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <style>{`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
          .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        `}</style>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] px-4">
          <div
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold shadow-lg ${
              toast.type === "success" ? "bg-success text-white" : "bg-error text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* Detail sheet */}
      {selected && !reviewing && (
        <Sheet onClose={() => setSelected(null)}>
          <div className="flex items-start justify-between mb-4 gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs border border-outline-variant/20 shrink-0">
                  {getInitials(selected.applicant_name)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-headline font-bold text-on-surface truncate">{selected.applicant_name}</h2>
                  <RoleTag role={selected.applicant_role} />
                </div>
              </div>
            </div>
            <StatusPill status={selected.status} />
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">event</span>
              <span>{formatDateRange(selected.start_date, selected.end_date)} ({selected.total_days} day{selected.total_days > 1 ? "s" : ""})</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">category</span>
              <span>{selected.leave_type} leave</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide font-bold text-on-surface-variant mb-1">Reason</p>
              <p className="text-on-surface">{selected.reason}</p>
            </div>
            {selected.attachment && (
              <a href={selected.attachment} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm">
                <span className="material-symbols-outlined text-[16px]">attach_file</span> View attachment
              </a>
            )}
            {selected.review_remarks && (
              <div className="bg-surface-container-high/40 border border-outline-variant/10 rounded-lg px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wide font-bold text-on-surface-variant mb-1">Reviewer remarks</p>
                <p className="text-on-surface">{selected.review_remarks}</p>
                <p className="text-xs text-on-surface-variant mt-1.5">
                  {selected.reviewed_by_name} · {formatDate(selected.reviewed_at)}
                </p>
              </div>
            )}
          </dl>

          {canReview(selected) && (
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => openReview(selected, "approve")}
                className="flex-1 bg-success text-white rounded-lg py-2.5 text-sm font-bold flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check</span> Approve
              </button>
              <button
                onClick={() => openReview(selected, "reject")}
                className="flex-1 border border-error/40 text-error rounded-lg py-2.5 text-sm font-bold flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">close</span> Reject
              </button>
            </div>
          )}
          {selected.status === "Pending" && selected.applicant_role === "Student" && (
            <p className="mt-6 text-xs text-on-surface-variant italic flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">info</span>
              Only this student's section/class teacher can approve or reject this request.
            </p>
          )}
        </Sheet>
      )}

      {/* Review confirmation sheet */}
      {reviewing && (
        <Sheet onClose={() => setReviewing(null)}>
          <h2 className="text-base font-headline font-bold text-on-surface mb-1">
            {reviewing.action === "approve" ? "Approve" : "Reject"} leave request
          </h2>
          <p className="text-sm text-on-surface-variant mb-4">
            {reviewing.leave.applicant_name} · {formatDateRange(reviewing.leave.start_date, reviewing.leave.end_date)}
          </p>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={reviewing.action === "approve" ? "Remarks (optional)" : "Remarks (recommended)"}
            rows={3}
            className="w-full border border-outline-variant/20 rounded-lg px-3 py-2 text-sm bg-surface-container-high/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary mb-4 resize-none"
            style={{ color: "var(--color-on-surface)" }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setReviewing(null)}
              className="flex-1 border border-outline-variant/20 rounded-lg py-2.5 text-sm font-semibold text-on-surface"
            >
              Cancel
            </button>
            <button
              disabled={submitting}
              onClick={submitReview}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold text-white disabled:opacity-60 ${
                reviewing.action === "approve" ? "bg-success" : "bg-error"
              }`}
            >
              {submitting ? "Submitting…" : `Confirm ${reviewing.action}`}
            </button>
          </div>
        </Sheet>
      )}
    </SchoolLayout>
  );
}