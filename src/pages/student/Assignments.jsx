import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";
import { submitAssignment } from "../../services/studentAPIs";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function AssignmentsSkeleton() {
  return (
    <MainLayout title="Assignments">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl mx-auto">
        <div className="space-y-2 mb-8">
          <Skeleton className="w-56 h-8" />
          <Skeleton className="w-72 h-4" />
        </div>
        <div className="flex gap-6 mb-6 border-b border-gray-100 pb-3">
          <Skeleton className="w-28 h-5" />
          <Skeleton className="w-32 h-5" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-5 space-y-3">
              <Skeleton className="w-48 h-4" />
              <Skeleton className="w-32 h-3" />
              <Skeleton className="w-full h-10 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Status field names aren't 100% confirmed from the routes doc — these
// cover the values mentioned ("submission_status", "status") plus the
// common variants. Adjust the case labels below if your backend uses
// different strings once you see a real response.
function getStatusMeta(status) {
  switch ((status || "").toLowerCase()) {
    case "graded":
      return { label: "Graded", className: "bg-green-100 text-green-700" };
    case "submitted":
      return { label: "Submitted", className: "bg-blue-100 text-blue-700" };
    case "late":
      return { label: "Late", className: "bg-orange-100 text-orange-700" };
    case "pending":
    default:
      return { label: "Pending", className: "bg-gray-100 text-gray-600" };
  }
}

export default function Assignments() {
  const { assignments, submissions, loading, reload, refreshSubmissions } = useStudent();
  const [activeTab, setActiveTab] = useState("assignments"); // "assignments" | "submissions"

  // Per-assignment upload state, keyed by assignment id:
  // { [id]: { file, uploading, error, success } }
  const [uploadState, setUploadState] = useState({});

  if (loading) return <AssignmentsSkeleton />;

  const list = assignments || [];
  const subs = submissions || [];

  // Used to hide the upload control for assignments that already have a
  // submission, in case the assignment object's own status field is stale.
  const submittedAssignmentIds = new Set(
    subs.map((s) => s.assignment_id || s.assignment?.id || s.assignment).filter(Boolean),
  );

  const setRowState = (id, patch) =>
    setUploadState((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const handleFileSelect = (assignmentId, file) => {
    setRowState(assignmentId, { file, error: null, success: false });
  };

  const handleUpload = async (assignmentId) => {
    const row = uploadState[assignmentId];
    if (!row?.file) return;

    setRowState(assignmentId, { uploading: true, error: null });
    try {
      await submitAssignment(assignmentId, row.file);
      setRowState(assignmentId, { uploading: false, success: true, file: null });
      // Refresh submissions list + assignment statuses so both tabs reflect
      // the new submission without a manual page reload.
      await Promise.all([refreshSubmissions(), reload()]);
    } catch (err) {
      console.error("Failed to submit assignment:", err);
      setRowState(assignmentId, {
        uploading: false,
        error:
          err?.response?.data?.detail ||
          err?.message ||
          "Upload failed. Please try again.",
      });
    }
  };

  return (
    <MainLayout title="Assignments">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-headline font-extrabold text-on-surface tracking-tight">
            Assignments &amp; Submissions
          </h2>
          <p className="text-on-surface-variant mt-1 font-medium">
            Upload your work and keep track of what you've submitted
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-surface-container-low">
          <button
            type="button"
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "assignments"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Assignments ({list.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "submissions"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            My Submissions ({subs.length})
          </button>
        </div>

        {activeTab === "assignments" ? (
          <div className="space-y-4">
            {list.length === 0 && (
              <div className="bg-surface-container-lowest rounded-lg p-10 text-center text-sm text-on-surface-variant shadow-sm">
                No assignments yet.
              </div>
            )}
            {list.map((a) => {
              const alreadySubmitted =
                submittedAssignmentIds.has(a.id) ||
                ["submitted", "graded"].includes((a.submission_status || "").toLowerCase());
              const row = uploadState[a.id] || {};
              const { label, className } = getStatusMeta(a.submission_status);

              return (
                <div key={a.id} className="bg-surface-container-lowest rounded-lg shadow-sm p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <p className="font-bold text-on-surface">{a.title}</p>
                      <p className="text-xs text-outline mt-0.5">
                        {a.subject_name || a.subject?.name || ""}
                        {a.due_date && <> · Due {formatDate(a.due_date)}</>}
                      </p>
                      {a.description && (
                        <p className="text-sm text-on-surface-variant mt-2">{a.description}</p>
                      )}
                    </div>
                    <span
                      className={`inline-flex h-fit items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${className}`}
                    >
                      {label}
                    </span>
                  </div>

                  {!alreadySubmitted && (
                    <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <label className="flex-1 cursor-pointer border-2 border-dashed border-surface-container-high rounded-md px-4 py-2.5 text-sm text-on-surface-variant hover:border-primary hover:bg-primary-container/10 transition-colors text-center sm:text-left truncate">
                        {row.file ? `📎 ${row.file.name}` : "Choose a file to submit"}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileSelect(a.id, e.target.files?.[0] || null)}
                        />
                      </label>
                      <button
                        type="button"
                        disabled={!row.file || row.uploading}
                        onClick={() => handleUpload(a.id)}
                        className="px-5 py-2.5 rounded-md text-sm font-bold bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors whitespace-nowrap"
                      >
                        {row.uploading ? "Uploading..." : "Submit"}
                      </button>
                    </div>
                  )}
                  {row.error && <p className="text-xs text-red-600 mt-2">{row.error}</p>}
                  {row.success && (
                    <p className="text-xs text-green-600 mt-2">Submitted successfully!</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[600px] w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">
                      File
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {subs.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-sm text-on-surface-variant">
                        No submissions yet.
                      </td>
                    </tr>
                  )}
                  {subs.map((s) => {
                    const { label, className } = getStatusMeta(s.status);
                    return (
                      <tr key={s.id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-on-surface">
                            {s.assignment_title || s.assignment_name || "Assignment"}
                          </p>
                          {s.marks_obtained != null && s.max_marks != null && (
                            <p className="text-xs text-outline mt-0.5">
                              {s.marks_obtained} / {s.max_marks}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">
                          {formatDate(s.submitted_at)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${className}`}
                          >
                            {label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {s.view_url ? (
                            <a
                              href={s.view_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary text-sm font-semibold hover:underline"
                            >
                              View File →
                            </a>
                          ) : (
                            <span className="text-xs text-outline">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}