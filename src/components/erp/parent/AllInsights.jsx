// src/components/erp/parent/AIInsights.jsx

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useParent } from "../../../context/ParentProvider";

const AIInsights = () => {
  // FIX: was reading `dashboard?.recent_grades` / `dashboard?.stats?.total_grades`
  // — unconfirmed field names from the same family of bug as `gradesReport`
  // in StudentHeader.jsx / PerformanceChart.jsx. Switched the grade source
  // to `gradesFlat`, the one field we've actually confirmed ParentProvider
  // populates (GradesAssessmentHub.jsx already relies on it). Left
  // `dashboard?.attendance?.status` as-is since nothing here contradicts
  // it — flag it for a quick check if attendance status still looks wrong
  // after this fix.
  const { activeChild, dashboard, gradesFlat } = useParent();
  const navigate = useNavigate();

  const { topSubject, topPct, weakestSubject, checklist } = useMemo(() => {
    const grades = Array.isArray(gradesFlat) ? gradesFlat : [];
    const withScores = grades.filter((g) => g.marks_obtained != null && g.max_marks != null);
    if (!withScores.length) {
      return { topSubject: null, topPct: null, weakestSubject: null, checklist: [] };
    }

    const sorted = [...withScores].sort(
      (a, b) =>
        parseFloat(b.marks_obtained) / parseFloat(b.max_marks) -
        parseFloat(a.marks_obtained) / parseFloat(a.max_marks),
    );
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    const topPctValue = Math.round((parseFloat(top.marks_obtained) / parseFloat(top.max_marks)) * 100);

    const items = [];
    if (dashboard?.attendance?.status) {
      items.push(`Attendance status: ${dashboard.attendance.status}`);
    }
    // Tied to the same grades list driving the insight above, instead of a
    // separate dashboard.stats.total_grades counter that could drift out of
    // sync with it.
    items.push(`${withScores.length} grade${withScores.length > 1 ? "s" : ""} recorded so far`);

    return {
      topSubject: top.subject_name,
      topPct: topPctValue,
      weakestSubject: bottom.subject_name !== top.subject_name ? bottom.subject_name : null,
      checklist: items,
    };
  }, [gradesFlat, dashboard]);

  const name = activeChild?.name?.split(" ")[0] || "Your child";

  return (
    <div className="ai-insight-card h-full min-h-[280px] sm:min-h-[320px] bg-surface-container-lowest dark:bg-slate-800/60 rounded-xl border-2 border-primary/5 dark:border-slate-700/40 relative flex flex-col overflow-hidden">
      <style>{`
        .ai-insight-card {
          container-type: inline-size;
          container-name: aicard;
          padding: 0.75rem;
          gap: 0.5rem;
        }
        .ai-insight-card .ai-bg-icon { padding: 0.5rem; }
        .ai-insight-card .ai-bg-icon .material-symbols-outlined { font-size: 2rem; }
        .ai-insight-card .ai-header { gap: 0.5rem; }
        .ai-insight-card .ai-header-icon-wrap { padding: 0.375rem; }
        .ai-insight-card .ai-header-icon-wrap .material-symbols-outlined { font-size: 1rem; }
        .ai-insight-card .ai-title { font-size: 0.875rem; }
        .ai-insight-card .ai-quote { padding: 0.5rem; }
        .ai-insight-card .ai-quote p { font-size: 0.75rem; }
        .ai-insight-card .ai-checklist { font-size: 0.75rem; }
        .ai-insight-card .ai-checklist li { gap: 0.375rem; }
        .ai-insight-card .ai-checklist li + li { margin-top: 0.375rem; }
        .ai-insight-card .ai-checklist .material-symbols-outlined { font-size: 0.875rem; }
        .ai-insight-card .ai-button { font-size: 0.6875rem; padding: 0.5rem 0.5rem; }

        @container aicard (min-width: 250px) {
          .ai-insight-card { padding: 1rem; gap: 0.75rem; }
          .ai-insight-card .ai-bg-icon { padding: 0.75rem; }
          .ai-insight-card .ai-bg-icon .material-symbols-outlined { font-size: 3rem; }
          .ai-insight-card .ai-header { gap: 0.75rem; }
          .ai-insight-card .ai-header-icon-wrap { padding: 0.5rem; }
          .ai-insight-card .ai-header-icon-wrap .material-symbols-outlined { font-size: 1.25rem; }
          .ai-insight-card .ai-title { font-size: 1rem; }
          .ai-insight-card .ai-quote { padding: 0.75rem; }
          .ai-insight-card .ai-quote p { font-size: 0.875rem; }
          .ai-insight-card .ai-checklist { font-size: 0.875rem; }
          .ai-insight-card .ai-checklist li { gap: 0.5rem; }
          .ai-insight-card .ai-checklist li + li { margin-top: 0.5rem; }
          .ai-insight-card .ai-checklist .material-symbols-outlined { font-size: 1rem; }
          .ai-insight-card .ai-button { font-size: 0.75rem; padding: 0.625rem 0.5rem; }
        }

        @container aicard (min-width: 320px) {
          .ai-insight-card { padding: 1.25rem; gap: 1rem; }
          .ai-insight-card .ai-bg-icon .material-symbols-outlined { font-size: 3.75rem; }
          .ai-insight-card .ai-title { font-size: 1.125rem; }
          .ai-insight-card .ai-button { font-size: 0.875rem; }
        }
      `}</style>

      <div className="ai-bg-icon absolute top-0 right-0 opacity-10 pointer-events-none">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          psychology
        </span>
      </div>

      <div className="ai-header flex items-center flex-shrink-0 min-w-0">
        <div className="ai-header-icon-wrap bg-tertiary-fixed dark:bg-purple-900/30 rounded-lg flex-shrink-0">
          <span className="material-symbols-outlined text-tertiary dark:text-purple-400" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
        </div>
        <h3 className="ai-title font-bold font-headline text-on-surface dark:text-white leading-tight min-w-0">
          AI Insight Alert
        </h3>
      </div>

      <div className="ai-quote bg-tertiary/5 dark:bg-purple-900/20 rounded-xl border-l-4 border-tertiary dark:border-purple-500 flex-shrink-0">
        <p className="text-on-surface dark:text-slate-200 font-medium leading-relaxed">
          {topSubject ? (
            <>
              "{name} is performing strongly in{" "}
              <span className="text-tertiary dark:text-purple-300 font-bold">{topSubject}</span>
              , currently at {topPct}%.
              {weakestSubject ? ` Extra focus on ${weakestSubject} could help bring up the overall average.` : ""}"
            </>
          ) : (
            `"Not enough grade data yet for ${name} to generate an insight."`
          )}
        </p>
      </div>

      <ul className="ai-checklist flex-1 flex flex-col text-on-surface-variant dark:text-slate-400 min-h-0">
        {checklist.length ? (
          checklist.map((item, i) => (
            <li key={i} className="flex items-start">
              <span className="material-symbols-outlined text-tertiary dark:text-purple-400 mt-0.5 flex-shrink-0">
                check_circle
              </span>
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="flex items-start">
            <span className="material-symbols-outlined text-tertiary dark:text-purple-400 mt-0.5 flex-shrink-0">info</span>
            <span>Check back after more data is recorded.</span>
          </li>
        )}
      </ul>

      {/* FIX: had no onClick at all — just hover styles. Confirm this path
          matches your actual router config for the AI Insights page
          (it's named "AI Insights" in the parent sidebar). */}
      <button
        onClick={() => navigate("/parent/ai-insights")}
        className="ai-button w-full rounded-xl font-bold flex-shrink-0 leading-snug
                   bg-surface-container-high dark:bg-slate-700
                   text-primary dark:text-blue-300
                   hover:bg-primary hover:text-white
                   dark:hover:bg-blue-600 dark:hover:text-white
                   transition-all"
      >
        View Detailed Insights
      </button>
    </div>
  );
};

export default AIInsights;