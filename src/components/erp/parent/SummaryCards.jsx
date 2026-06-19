// src/components/erp/parent/SummaryCards.jsx

import React, { useMemo } from "react";
import { useParent } from "../../../context/ParentProvider";

const getGradeLetter = (pct) => {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  return "C";
};

const SummaryCards = () => {
  const { dashboard, attendanceRecords, assignments, loading } = useParent();

  const { overallAttendance, attendanceMoM } = useMemo(() => {
    if (!Array.isArray(attendanceRecords) || !attendanceRecords.length)
      return { overallAttendance: 0, attendanceMoM: null };

    const present = attendanceRecords.filter((r) => r.status === "Present").length;
    const overall = Math.round((present / attendanceRecords.length) * 100);

    const now = new Date();
    const curM = now.getMonth(), curY = now.getFullYear();
    const prevM = curM === 0 ? 11 : curM - 1;
    const prevY = curM === 0 ? curY - 1 : curY;

    const pctOf = (recs) => {
      if (!recs.length) return null;
      return Math.round((recs.filter((r) => r.status === "Present").length / recs.length) * 100);
    };
    const thisPct = pctOf(attendanceRecords.filter((r) => { const d = new Date(r.date); return d.getFullYear() === curY && d.getMonth() === curM; }));
    const lastPct = pctOf(attendanceRecords.filter((r) => { const d = new Date(r.date); return d.getFullYear() === prevY && d.getMonth() === prevM; }));
    const mom = thisPct !== null && lastPct !== null ? thisPct - lastPct : null;
    return { overallAttendance: overall, attendanceMoM: mom };
  }, [attendanceRecords]);

  const { avgPercentage, avgGradeLetter } = useMemo(() => {
    const grades = dashboard?.grades?.results || [];
    if (!grades.length) return { avgPercentage: 0, avgGradeLetter: "—" };
    const totalObt = grades.reduce((s, g) => s + parseFloat(g.marks_obtained || 0), 0);
    const totalMax = grades.reduce((s, g) => s + parseFloat(g.max_marks || 0), 0);
    const pct = totalMax > 0 ? parseFloat(((totalObt / totalMax) * 100).toFixed(1)) : 0;
    return { avgPercentage: pct, avgGradeLetter: getGradeLetter(pct) };
  }, [dashboard]);

  const { pendingCount, hasDueSoon } = useMemo(() => {
    const list = assignments || [];
    const now = new Date();
    const pending = list.filter((a) => a.submission_status === "Pending");
    const dueSoon = pending.some((a) => {
      if (!a.due_date) return false;
      const diff = (new Date(a.due_date) - now) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 3;
    });
    return { pendingCount: pending.length, hasDueSoon: dueSoon };
  }, [assignments]);

  const { upcomingExamCount, nextExamLabel } = useMemo(() => {
    const exams = dashboard?.exams?.results || [];
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const upcoming = exams
      .filter((e) => new Date(e.start_date ?? e.date ?? e.end_date) >= now)
      .sort((a, b) => new Date(a.start_date ?? a.date ?? a.end_date) - new Date(b.start_date ?? b.date ?? b.end_date));
    let nextLabel = "None";
    if (upcoming.length > 0) {
      const nextDate = new Date(upcoming[0].start_date ?? upcoming[0].date ?? upcoming[0].end_date);
      const diff = Math.round((nextDate - now) / (1000 * 60 * 60 * 24));
      if (diff === 0) nextLabel = "Today";
      else if (diff === 1) nextLabel = "Tomorrow";
      else nextLabel = nextDate.toLocaleDateString("en-US", { weekday: "short" });
    }
    return { upcomingExamCount: upcoming.length, nextExamLabel: nextLabel };
  }, [dashboard]);

  if (loading) {
    return (
      <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface-container-lowest p-3 sm:p-4 lg:p-6 rounded-xl border border-outline-variant/10 animate-pulse">
            <div className="flex justify-between items-start mb-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-surface-container-low rounded-lg" />
              <div className="w-10 sm:w-12 h-3 bg-surface-container-low rounded" />
            </div>
            <div className="w-16 sm:w-20 h-3 bg-surface-container-low rounded mb-2" />
            <div className="w-12 sm:w-14 h-6 sm:h-7 bg-surface-container-low rounded" />
          </div>
        ))}
      </section>
    );
  }

  const cards = [
    {
      icon: "calendar_check", iconColor: "text-primary", bgHover: "hover:bg-primary/5",
      badge: attendanceMoM !== null
        ? <span className={`font-bold text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-wider whitespace-nowrap ${attendanceMoM >= 0 ? "text-tertiary" : "text-error"}`}>{attendanceMoM >= 0 ? "+" : ""}{attendanceMoM}% MoM</span>
        : <span className="text-on-surface-variant font-bold text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-wider whitespace-nowrap">Overall</span>,
      label: "Attendance", value: `${overallAttendance}%`,
    },
    {
      icon: "star_rate", iconColor: "text-secondary", bgHover: "hover:bg-secondary/5",
      badge: <span className="text-primary font-bold text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-wider whitespace-nowrap">{avgPercentage}%</span>,
      label: "Avg Grade", value: avgGradeLetter,
    },
    {
      icon: "pending_actions", iconColor: "text-tertiary", bgHover: "hover:bg-tertiary/5",
      badge: <span className={`font-bold text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-wider whitespace-nowrap ${hasDueSoon ? "text-error" : pendingCount === 0 ? "text-tertiary" : "text-on-surface-variant"}`}>{hasDueSoon ? "Due Soon" : pendingCount === 0 ? "All Done" : "Pending"}</span>,
      label: "Assignments", value: pendingCount,
    },
    {
      icon: "event_note", iconColor: "text-primary", bgHover: "hover:bg-primary/5",
      badge: <span className="text-on-surface-variant font-bold text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-wider leading-tight block">{upcomingExamCount > 0 ? `Next: ${nextExamLabel}` : "None"}</span>,
      label: "Upcoming Exams", value: upcomingExamCount,
    },
  ];

  return (
    /*
      Key fix: 2 columns until md (768px), 4 columns ONLY from md (768px) up.
      This matches the available content width at each breakpoint —
      Nest Hub at 1024px now has plenty of room since the sidebar layout
      shifts content right; cards no longer crush their text.
      gap also scales up gradually instead of jumping straight to 6.
    */
    <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {cards.map(({ icon, iconColor, bgHover, badge, label, value }) => (
        <div
          key={label}
          className={`bg-surface-container-lowest dark:bg-slate-800/60
                      p-3 sm:p-4 lg:p-6 rounded-xl group ${bgHover}
                      transition-colors border border-outline-variant/10 dark:border-slate-700/40
                      min-w-0 overflow-hidden`}
        >
          <div className="flex justify-between items-start mb-2.5 sm:mb-3 lg:mb-4 gap-1">
            <div className="p-1.5 sm:p-2 bg-surface-container-low dark:bg-slate-700 rounded-lg group-hover:bg-primary-fixed-dim transition-colors flex-shrink-0">
              <span className={`material-symbols-outlined ${iconColor} text-base sm:text-lg lg:text-xl`}>{icon}</span>
            </div>
            <div className="min-w-0 text-right">{badge}</div>
          </div>
          <p className="text-on-surface-variant dark:text-slate-400 text-[11px] sm:text-xs lg:text-sm font-medium leading-tight truncate">{label}</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-on-surface dark:text-white mt-1 leading-none truncate">{value}</h3>
        </div>
      ))}
    </section>
  );
};

export default SummaryCards;