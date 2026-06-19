// src/components/erp/parent/AIInsights.jsx  (also used as AllInsights)

import React from "react";

/*
  ── Why plain CSS container queries instead of Tailwind's @container ──────
  Tailwind's @container utility variants need the official container-queries
  plugin registered in tailwind.config.js. Since this project's Tailwind
  config isn't something we're touching, we use *native* CSS container
  queries directly via a <style> tag scoped to this component's class names.
  Native container queries are supported in all current browsers (Chrome,
  Edge, Safari, Firefox) and need zero build config — they just work.

  This card now measures its OWN rendered width (not the viewport) and
  shrinks text/spacing in three tiers:
    < 250px   → ultra-narrow (worst-case squeeze, e.g. a bad grid split)
    250–320px → narrow (typical when this card shares a row, e.g. Nest Hub)
    320px+    → normal (full desktop sizing, current default look)

  Because it reacts to its own box size, it self-corrects no matter what
  grid/column width the parent page gives it — Nest Hub, Nest Hub Max,
  iPad Mini/Air/Pro, or full desktop — without ParentDashboard.jsx needing
  any breakpoint logic at all.
*/

const AIInsights = () => {
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

      {/* Background icon */}
      <div className="ai-bg-icon absolute top-0 right-0 opacity-10 pointer-events-none">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          psychology
        </span>
      </div>

      {/* Header */}
      <div className="ai-header flex items-center flex-shrink-0 min-w-0">
        <div className="ai-header-icon-wrap bg-tertiary-fixed dark:bg-purple-900/30 rounded-lg flex-shrink-0">
          <span
            className="material-symbols-outlined text-tertiary dark:text-purple-400"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
        </div>
        <h3 className="ai-title font-bold font-headline text-on-surface dark:text-white leading-tight min-w-0">
          AI Insight Alert
        </h3>
      </div>

      {/* Quote */}
      <div className="ai-quote bg-tertiary/5 dark:bg-purple-900/20 rounded-xl border-l-4 border-tertiary dark:border-purple-500 flex-shrink-0">
        <p className="text-on-surface dark:text-slate-200 font-medium leading-relaxed">
          "Your child shows significant improvement in{" "}
          <span className="text-tertiary dark:text-purple-300 font-bold">Mathematics</span>.
          Alex has improved their average from B to A- over the last month."
        </p>
      </div>

      {/* Checklist — flex-1 fills space between quote and button */}
      <ul className="ai-checklist flex-1 flex flex-col text-on-surface-variant dark:text-slate-400 min-h-0">
        <li className="flex items-start">
          <span className="material-symbols-outlined text-tertiary dark:text-purple-400 mt-0.5 flex-shrink-0">
            check_circle
          </span>
          <span>Completed 100% of Algebra modules</span>
        </li>
        <li className="flex items-start">
          <span className="material-symbols-outlined text-tertiary dark:text-purple-400 mt-0.5 flex-shrink-0">
            check_circle
          </span>
          <span>High engagement during Calculus labs</span>
        </li>
      </ul>

      {/* Button — always pinned to bottom, scales with container width instead of clipping */}
      <button
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