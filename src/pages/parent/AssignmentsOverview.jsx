import React, { useState, useMemo } from "react";
import DashboardLayout from "../../components/erp/parent/DashboardLayout";
import { useParent } from "../../context/ParentProvider";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function AssignmentsSkeleton() {
  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-80 h-4" />
        </div>
        <Skeleton className="w-full h-20 rounded-xl" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 border space-y-2">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-16 h-8" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="w-full h-20 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </DashboardLayout>
  );
}

const SUBJECT_ICONS = {
  physics:     { icon: "science",      bg: "bg-blue-50",   color: "text-blue-600" },
  mathematics: { icon: "calculate",    bg: "bg-purple-50", color: "text-purple-600" },
  math:        { icon: "calculate",    bg: "bg-purple-50", color: "text-purple-600" },
  literature:  { icon: "menu_book",    bg: "bg-orange-50", color: "text-orange-600" },
  english:     { icon: "menu_book",    bg: "bg-orange-50", color: "text-orange-600" },
  chemistry:   { icon: "experiment",   bg: "bg-green-50",  color: "text-green-600" },
  biology:     { icon: "biotech",      bg: "bg-emerald-50",color: "text-emerald-600" },
  "computer science": { icon: "code",  bg: "bg-indigo-50", color: "text-indigo-600" },
  history:     { icon: "history_edu",  bg: "bg-amber-50",  color: "text-amber-600" },
};

function getSubjectMeta(subjectName) {
  const key = (subjectName || "").toLowerCase();
  return SUBJECT_ICONS[key] || { icon: "assignment", bg: "bg-slate-50", color: "text-slate-600" };
}

const STATUS_BADGE = {
  Pending:   "bg-amber-100 text-amber-700",
  Submitted: "bg-purple-100 text-purple-700",
  Graded:    "bg-blue-100 text-blue-700",
};

function formatDueDate(dueDateStr) {
  const due = new Date(dueDateStr);
  const now = new Date();
  const diffMs = due - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const timeStr = due.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  if (diffDays < 0) return { text: `Overdue \u2014 ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, urgent: true };
  if (diffDays === 0) return { text: `Today, ${timeStr}`, urgent: true };
  if (diffDays === 1) return { text: `Tomorrow, ${timeStr}`, urgent: true };
  return { text: due.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), urgent: false };
}

export default function AssignmentsOverview() {
  const { profile, assignments, loading, error } = useParent();
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [statusFilter, setStatusFilter] = useState("All Status");

  if (loading) return <AssignmentsSkeleton />;

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="bg-red-50 text-red-700 rounded-lg p-6 text-sm">
            Could not load assignments. {error?.message || "Please try again later."}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const studentFirstName = profile?.first_name || "your child";
  const list = assignments || [];

  const subjectOptions = useMemo(
    () => ["All Subjects", ...Array.from(new Set(list.map(a => a.subject_name).filter(Boolean)))],
    [list]
  );

  const total = list.length;
  const submittedCount = list.filter(a => a.submission_status === "Submitted" || a.submission_status === "Graded").length;
  const pendingCount = list.filter(a => a.submission_status === "Pending").length;
  const submissionRate = total > 0 ? Math.round((submittedCount / total) * 100) : 0;

  const gradedAssignments = list.filter(a => a.submission_status === "Graded" && a.grade != null);
  const avgGradePct = gradedAssignments.length > 0
    ? Math.round(gradedAssignments.reduce((sum, a) => sum + parseFloat(a.grade), 0) / gradedAssignments.length)
    : null;

  // Nearest upcoming pending assignment for the AI insight banner
  const upcomingPending = [...list]
    .filter(a => a.submission_status === "Pending")
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

  const filteredList = list.filter(a => {
    const matchSubject = subjectFilter === "All Subjects" || a.subject_name === subjectFilter;
    const matchStatus = statusFilter === "All Status" || a.submission_status === statusFilter;
    return matchSubject && matchStatus;
  });

  const sortedList = [...filteredList].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-500 mt-1">
            Track, review, and manage {studentFirstName}&apos;s upcoming and completed coursework.
          </p>
        </div>

        {/* AI INSIGHT */}
        {upcomingPending ? (
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl p-6 flex items-center justify-between shadow-md flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <span className="material-symbols-outlined text-white">psychology</span>
              </div>
              <div>
                <p className="text-xs text-blue-100 uppercase tracking-wider">AI Intelligence Insight</p>
                <p className="text-white font-semibold text-lg">
                  {upcomingPending.title} ({upcomingPending.subject_name}) is due {formatDueDate(upcomingPending.due_date).text.toLowerCase()}.
                </p>
              </div>
            </div>
            <button className="bg-white text-blue-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-50 transition">
              Review Now
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-xl p-6 flex items-center gap-4 shadow-md">
            <div className="bg-white/20 p-3 rounded-lg">
              <span className="material-symbols-outlined text-white">check_circle</span>
            </div>
            <p className="text-white font-semibold text-lg">All caught up \u2014 no pending assignments right now.</p>
          </div>
        )}

        {/* METRICS */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Assignments</p>
              <p className="text-3xl font-bold">{total}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg h-fit">
              <span className="material-symbols-outlined text-blue-600">analytics</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Submitted</p>
              <p className="text-3xl font-bold text-purple-600">{submittedCount}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg h-fit">
              <span className="material-symbols-outlined text-purple-600">check_circle</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-3xl font-bold text-amber-700">{pendingCount}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg h-fit">
              <span className="material-symbols-outlined text-amber-700">pending_actions</span>
            </div>
          </div>
        </div>

        {/* ROADMAP + SIDEBAR */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ROADMAP */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <h3 className="text-lg font-semibold">Assignment Roadmap</h3>
              <div className="flex gap-2">
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="border rounded-md px-3 py-1 text-sm bg-white"
                >
                  {subjectOptions.map(s => <option key={s}>{s}</option>)}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-md px-3 py-1 text-sm bg-white"
                >
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Submitted</option>
                  <option>Graded</option>
                </select>
              </div>
            </div>

            {sortedList.length === 0 && (
              <div className="bg-white rounded-xl p-8 shadow-sm border text-center text-sm text-gray-500">
                No assignments match the selected filters.
              </div>
            )}

            {sortedList.map((a) => {
              const meta = getSubjectMeta(a.subject_name);
              const due = formatDueDate(a.due_date);
              const isGraded = a.submission_status === "Graded";
              const isSubmitted = a.submission_status === "Submitted";

              return (
                <div key={a.id} className="bg-white rounded-xl p-5 shadow-sm border flex items-center gap-5 hover:shadow-md transition flex-wrap">
                  <div className={`${meta.bg} p-3 rounded-lg shrink-0`}>
                    <span className={`material-symbols-outlined ${meta.color}`}>{meta.icon}</span>
                  </div>

                  <div className="flex-1 min-w-[180px]">
                    <p className="text-xs text-gray-400 uppercase">
                      {a.subject_name}{a.section_name ? ` \u2022 ${a.section_name}` : ""}
                    </p>
                    <p className="font-semibold">{a.title}</p>
                    {a.teacher_name && (
                      <p className="text-xs text-gray-400 mt-0.5">Assigned by {a.teacher_name}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    {isGraded ? (
                      <>
                        <p className="text-xs text-gray-400">Grade</p>
                        <p className="text-blue-600 font-semibold">{a.grade}</p>
                      </>
                    ) : isSubmitted ? (
                      <>
                        <p className="text-xs text-gray-400">Submitted</p>
                        <p className="text-gray-700 text-sm font-semibold">
                          {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "\u2014"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-gray-400">Deadline</p>
                        <p className={`text-sm font-semibold ${due.urgent ? "text-red-500" : "text-gray-700"}`}>{due.text}</p>
                      </>
                    )}
                  </div>

                  <span className={`text-xs px-3 py-1 rounded-full font-semibold shrink-0 ${STATUS_BADGE[a.submission_status] || "bg-slate-100 text-slate-700"}`}>
                    {a.submission_status}
                  </span>

                  <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                </div>
              );
            })}
          </div>

          {/* SIDEBAR */}
          <div className="bg-white rounded-xl p-6 shadow-sm border h-fit">
            <h4 className="font-semibold mb-4">Quick Statistics</h4>

            <div className="mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Submission Rate</span>
                <span className="font-semibold text-blue-600">{submissionRate}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full mt-2">
                <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${submissionRate}%` }} />
              </div>
            </div>

            <div className="flex justify-between text-sm mb-4">
              <span className="text-gray-500">Avg. Grade (Graded)</span>
              <span className="text-purple-600 font-semibold">
                {avgGradePct != null ? `${avgGradePct}%` : "No grades yet"}
              </span>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-400 uppercase mb-2">Pending Assignments</p>
              {pendingCount === 0 ? (
                <p className="text-sm text-gray-400">Nothing pending right now.</p>
              ) : (
                list
                  .filter(a => a.submission_status === "Pending")
                  .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                  .slice(0, 3)
                  .map(a => (
                    <div key={a.id} className="mb-2">
                      <div className="flex gap-2 items-center text-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                        <span className="truncate">{a.title}</span>
                      </div>
                      <p className="text-xs text-gray-400 ml-4">{formatDueDate(a.due_date).text}</p>
                    </div>
                  ))
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}