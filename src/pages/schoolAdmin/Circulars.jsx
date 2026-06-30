import React, { useState, useEffect, useCallback } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";

/* ─────────────────────────────────────────────
   Skeleton Shimmer Styles (shared pattern)
───────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("skeleton-style")) {
  const s = document.createElement("style");
  s.id = "skeleton-style";
  s.textContent = `@keyframes skeleton-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
  document.head.appendChild(s);
}

const SHIMMER = {
  background:
    "linear-gradient(90deg,color-mix(in srgb,var(--color-outline-variant) 16%,var(--color-surface-container-lowest)) 25%,color-mix(in srgb,var(--color-outline-variant) 28%,var(--color-surface-container-lowest)) 50%,color-mix(in srgb,var(--color-outline-variant) 16%,var(--color-surface-container-lowest)) 75%)",
  backgroundSize: "200% 100%",
  animation: "skeleton-shimmer 1.4s ease infinite",
};

function Sk({ w, h, r = 6, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...SHIMMER, ...style }} />;
}

function CircularsSkeleton() {
  return (
    <SchoolLayout title="Circulars">
      <div className="px-4 md:px-8 pt-4 pb-12 space-y-6 animate-pulse">
        <div className="flex justify-between items-center gap-3">
          <Sk w={140} h={20} />
          <Sk w={140} h={36} />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-4 md:p-6 space-y-3">
            <Sk w={220} h={16} />
            <Sk w="100%" h={12} />
            <Sk w="60%" h={12} />
          </div>
        ))}
      </div>
    </SchoolLayout>
  );
}

/* ─────────────────────────────────────────────
   Design System Tokens (matches AddTeacher.jsx)
───────────────────────────────────────────── */
const labelClass = "text-[10px] md:text-xs font-bold uppercase tracking-wider text-on-surface-variant/80 mb-1.5 block";
const editFieldClass = "w-full text-xs md:text-sm font-semibold text-on-surface bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none px-3 py-2 rounded-lg transition";

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
      <div className="px-4 md:px-6 py-4 border-b border-outline-variant/10 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-primary shrink-0" />
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant/60">{icon}</span>
        <h3 className="text-sm font-headline font-bold text-on-surface">{title}</h3>
      </div>
      <div className="p-4 md:p-6 space-y-4">{children}</div>
    </div>
  );
}

function StatCard({ label, value, icon, accent = "primary" }) {
  return (
    <div
      className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm p-2.5 sm:p-4 flex flex-col justify-between relative overflow-hidden"
      style={{ borderLeft: `3px solid var(--color-${accent})`, minHeight: "72px" }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center"
          style={{ background: `color-mix(in srgb, var(--color-${accent}) 12%, transparent)` }}
        >
          <span className="material-symbols-outlined" style={{ color: `var(--color-${accent})`, fontSize: "14px" }}>{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5 text-on-surface-variant leading-tight">{label}</p>
        <p className="text-lg sm:text-xl font-headline font-black leading-none text-on-surface">{value}</p>
      </div>
    </div>
  );
}

const AUDIENCE_OPTIONS = [
  { value: "all", label: "Everyone", icon: "groups", desc: "Students, teachers & parents" },
  { value: "students", label: "Students", icon: "school", desc: "Visible to students only" },
  { value: "teachers", label: "Teachers", icon: "person", desc: "Visible to faculty only" },
  { value: "parents", label: "Parents", icon: "family_restroom", desc: "Visible to parents only" },
];

const AUDIENCE_BADGE_STYLE = {
  all: "bg-primary/10 text-primary",
  students: "bg-success/10 text-success",
  teachers: "bg-secondary/10 text-secondary",
  parents: "bg-tertiary/10 text-tertiary",
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const emptyForm = {
  id: null,
  title: "",
  content: "",
  target_audience: "all",
  target_class_levels: [],
};

export default function CircularsPage() {
  const [circulars, setCirculars] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [busyId, setBusyId] = useState(null); // for publish-toggle / delete spinners

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async (searchTerm = "") => {
    try {
      const [circularRes, classRes] = await Promise.all([
        schoolAdminApi.getCirculars(1, searchTerm),
        classLevels.length ? Promise.resolve({ results: classLevels }) : schoolAdminApi.getClassLevels(),
      ]);
      setCirculars(circularRes.results || circularRes || []);
      if (!classLevels.length) {
        setClassLevels(classRes.results || classRes || []);
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || "Failed to load circulars", "error");
    } finally {
      setPageLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPageLoading(true);
    loadData(search);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (circular) => {
    setForm({
      id: circular.id,
      title: circular.title,
      content: circular.content || "",
      target_audience: circular.target_audience,
      target_class_levels: (circular.target_class_levels || []).map((c) =>
        typeof c === "object" ? c.id : c
      ),
    });
    setError(null);
    setShowModal(true);
  };

  const toggleClassLevel = (id) => {
    setForm((f) => {
      const exists = f.target_class_levels.includes(id);
      return {
        ...f,
        target_class_levels: exists
          ? f.target_class_levels.filter((c) => c !== id)
          : [...f.target_class_levels, id],
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        content: form.content,
        target_audience: form.target_audience,
        target_class_levels: form.target_class_levels,
      };
      if (form.id) {
        await schoolAdminApi.updateCircular(form.id, payload);
        showToast("Circular updated successfully!");
      } else {
        await schoolAdminApi.createCircular(payload);
        showToast("Circular posted successfully!");
      }
      setShowModal(false);
      loadData(search);
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setError(
          Object.entries(data)
            .map(([f, v]) => `${f}: ${Array.isArray(v) ? v.join(" ") : v}`)
            .join(" | ")
        );
      } else {
        setError(err.message || "Failed to save circular");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (circular) => {
    setBusyId(circular.id);
    try {
      await schoolAdminApi.toggleCircularPublish(circular.id);
      setCirculars((prev) =>
        prev.map((c) => (c.id === circular.id ? { ...c, is_published: !c.is_published } : c))
      );
      showToast(circular.is_published ? "Circular unpublished" : "Circular published");
    } catch (err) {
      console.error(err);
      showToast("Failed to update publish status", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (circular) => {
    if (!window.confirm(`Delete "${circular.title}"? This cannot be undone.`)) return;
    setBusyId(circular.id);
    try {
      await schoolAdminApi.deleteCircular(circular.id);
      setCirculars((prev) => prev.filter((c) => c.id !== circular.id));
      showToast("Circular deleted");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete circular", "error");
    } finally {
      setBusyId(null);
    }
  };

  if (pageLoading) return <CircularsSkeleton />;

  return (
    <SchoolLayout title="Circulars">
      <div className="px-4 md:px-8 pt-4 pb-12 space-y-6 mx-auto w-full max-w-full overflow-x-hidden">

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-6 right-4 md:right-6 z-50 px-5 py-3.5 rounded-xl shadow-xl font-bold text-xs md:text-sm flex items-center gap-3 border border-outline-variant/10 transition-all ${
              toast.type === "success" ? "bg-success text-white" : "bg-error text-white"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {toast.type === "success" ? "check_circle" : "error"}
            </span>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface">Circulars</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body">
              Post announcements to students, teachers, or parents.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="w-full sm:w-auto whitespace-nowrap bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Post Circular
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <StatCard label="Total Circulars" value={circulars.length} icon="campaign" accent="primary" />
          <StatCard
            label="Published"
            value={circulars.filter((c) => c.is_published).length}
            icon="visibility"
            accent="success"
          />
          <StatCard
            label="Unpublished"
            value={circulars.filter((c) => !c.is_published).length}
            icon="visibility_off"
            accent="error"
          />
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search circulars by title or content..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-surface-container-high/50 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary transition outline-none text-on-surface"
            />
          </div>
          <div className="flex items-center flex-wrap gap-3">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg border border-outline-variant/10 transition"
            >
              Search
            </button>
            <span className="text-xs font-semibold text-on-surface-variant whitespace-nowrap sm:ml-auto">
              {circulars.length} {circulars.length === 1 ? "circular" : "circulars"} found
            </span>
          </div>
        </form>

        {/* ── Mobile: card list (replaces table below `sm`) ── */}
        <div className="sm:hidden space-y-3">
          {circulars.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 px-4 py-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">campaign</span>
              <p className="text-sm font-medium">No circulars found</p>
              <p className="text-xs">Tap "Post Circular" to create one.</p>
            </div>
          ) : (
            circulars.map((c, index) => (
              <div
                key={c.id}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm p-4 space-y-3"
                style={{ animation: `fadeInUp 0.3s ease ${index * 0.05}s both` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-on-surface truncate">{c.title}</p>
                    {c.content && (
                      <p className="text-[10px] text-outline mt-0.5 line-clamp-2">{c.content}</p>
                    )}
                  </div>
                  {c.is_published ? (
                    <span className="shrink-0 inline-flex items-center gap-1.5 text-[9px] uppercase font-extrabold bg-success/20 text-success px-2 py-1 rounded-full whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      Published
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1.5 text-[9px] uppercase font-extrabold bg-outline-variant/20 text-outline px-2 py-1 rounded-full whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                      Hidden
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center text-[9px] uppercase font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap ${AUDIENCE_BADGE_STYLE[c.target_audience] || "bg-outline-variant/20 text-on-surface-variant"}`}
                  >
                    {c.target_audience_display || c.target_audience}
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    {c.target_class_level_names?.length > 0
                      ? c.target_class_level_names.join(", ")
                      : "All classes"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
                  <div className="text-[10px] text-on-surface-variant">
                    <div className="font-semibold">{c.created_by_name || "Admin"}</div>
                    <div className="text-outline">{timeAgo(c.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePublish(c)}
                      disabled={busyId === c.id}
                      title={c.is_published ? "Unpublish" : "Publish"}
                      className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">
                        {c.is_published ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                    <button
                      onClick={() => openEdit(c)}
                      title="Edit"
                      className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      disabled={busyId === c.id}
                      title="Delete"
                      className="p-1.5 rounded-lg hover:bg-error/10 text-error transition disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Tablet & up: table ── */}
        <div className="hidden sm:block bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-surface-container-high/30 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/10">
                <tr>
                  <th className="px-4 md:px-6 py-4">Circular</th>
                  <th className="px-4 md:px-6 py-4">Audience</th>
                  <th className="px-4 md:px-6 py-4 hidden md:table-cell">Posted By</th>
                  <th className="px-4 md:px-6 py-4 hidden lg:table-cell">Classes</th>
                  <th className="px-4 md:px-6 py-4 text-center">Status</th>
                  <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {circulars.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 md:px-6 py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">campaign</span>
                      <p className="text-sm font-medium">No circulars found</p>
                      <p className="text-xs">Click "Post Circular" to create one.</p>
                    </td>
                  </tr>
                ) : (
                  circulars.map((c, index) => (
                    <tr
                      key={c.id}
                      className="group transition-all duration-150 hover:bg-surface-container-high/30"
                      style={{ animation: `fadeInUp 0.3s ease ${index * 0.05}s both` }}
                    >
                      <td className="px-4 md:px-6 py-3 md:py-4 max-w-[220px]">
                        <p className="font-semibold text-on-surface truncate">{c.title}</p>
                        {c.content && (
                          <p className="text-[10px] md:text-2xs text-outline mt-0.5 truncate">{c.content}</p>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center text-[9px] md:text-[10px] uppercase font-extrabold px-2 md:px-2.5 py-1 rounded-full whitespace-nowrap ${AUDIENCE_BADGE_STYLE[c.target_audience] || "bg-outline-variant/20 text-on-surface-variant"}`}
                        >
                          {c.target_audience_display || c.target_audience}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-on-surface-variant hidden md:table-cell whitespace-nowrap">
                        <div>{c.created_by_name || "Admin"}</div>
                        <div className="text-[10px] text-outline">{timeAgo(c.created_at)}</div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 hidden lg:table-cell">
                        {c.target_class_level_names?.length > 0 ? (
                          <span className="text-xs text-on-surface-variant truncate max-w-[150px] block">
                            {c.target_class_level_names.join(", ")}
                          </span>
                        ) : (
                          <span className="text-xs text-outline italic">All classes</span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                        {c.is_published ? (
                          <span className="inline-flex items-center gap-1.5 text-[9px] md:text-[10px] uppercase font-extrabold bg-success/20 text-success px-2 md:px-2.5 py-1 rounded-full whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[9px] md:text-[10px] uppercase font-extrabold bg-outline-variant/20 text-outline px-2 md:px-2.5 py-1 rounded-full whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                            Hidden
                          </span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleTogglePublish(c)}
                            disabled={busyId === c.id}
                            title={c.is_published ? "Unpublish" : "Publish"}
                            className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-base">
                              {c.is_published ? "visibility_off" : "visibility"}
                            </span>
                          </button>
                          <button
                            onClick={() => openEdit(c)}
                            title="Edit"
                            className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            disabled={busyId === c.id}
                            title="Delete"
                            className="p-1.5 rounded-lg hover:bg-error/10 text-error transition disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-surface-container-lowest w-full max-w-xl rounded-xl shadow-xl border border-outline-variant/10 max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSave}>
              <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                <h3 className="text-sm md:text-base font-headline font-bold text-on-surface">
                  {form.id ? "Edit Circular" : "Post New Circular"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <div className="p-5 space-y-5">
                {error && (
                  <div className="p-3 bg-error/10 text-error rounded-xl border border-error/20 text-xs font-medium flex gap-2 items-start">
                    <span className="material-symbols-outlined text-base shrink-0">error</span>
                    <div className="break-all">{error}</div>
                  </div>
                )}

                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Annual Sports Day — Registration Open"
                    className={editFieldClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Content</label>
                  <textarea
                    required
                    rows={4}
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder="Write the circular details here..."
                    className={`${editFieldClass} resize-none`}
                  />
                </div>

                <SectionCard title="Audience" icon="groups">
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:col-span-2">
                    {AUDIENCE_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setForm((f) => ({ ...f, target_audience: opt.value }))}
                        className={`flex items-start gap-2 p-3 rounded-lg border text-left transition ${
                          form.target_audience === opt.value
                            ? "border-primary bg-primary/5"
                            : "border-outline-variant/20 hover:bg-surface-container-high"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-lg ${
                            form.target_audience === opt.value ? "text-primary" : "text-on-surface-variant/50"
                          }`}
                        >
                          {opt.icon}
                        </span>
                        <span>
                          <span className="block text-xs font-bold text-on-surface">{opt.label}</span>
                          <span className="block text-[10px] text-on-surface-variant/60">{opt.desc}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Target Classes (optional)" icon="filter_alt">
                    <div className="sm:col-span-2">
                      <p className="text-[11px] text-on-surface-variant/60 mb-3">
                        Leave empty to send to every class. Select specific classes to narrow the audience —
                        this also restricts teachers to ones assigned to the selected classes.
                      </p>
                      {classLevels.length === 0 ? (
                        <p className="text-xs text-on-surface-variant/50">No class levels found.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {classLevels.map((cl) => {
                            const selected = form.target_class_levels.includes(cl.id);
                            return (
                              <button
                                type="button"
                                key={cl.id}
                                onClick={() => toggleClassLevel(cl.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                                  selected
                                    ? "bg-primary text-white border-primary"
                                    : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                                }`}
                              >
                                {cl.name || cl.display_name || `Class ${cl.id}`}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </SectionCard>
              </div>

              <div className="px-5 py-4 border-t border-outline-variant/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs md:text-sm text-on-surface-variant font-bold hover:bg-surface-container-high rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-5 py-2 bg-primary text-white text-xs md:text-sm font-bold rounded-lg shadow-sm disabled:opacity-60 transition"
                >
                  {saving && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
                  {saving ? "Saving..." : form.id ? "Save Changes" : "Post Circular"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SchoolLayout>
  );
}
