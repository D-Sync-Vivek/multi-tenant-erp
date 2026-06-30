import { Link } from "react-router-dom";
import { useParent } from "../../../context/ParentProvider";

const AUDIENCE_DOT = {
  Student: "bg-blue-400",
  Parent: "bg-purple-400",
  Teacher: "bg-green-400",
  All: "bg-orange-400",
};

function daysAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff} days ago`;
}

const CircularsPreview = () => {
  const { circulars = [], loading, childDataLoading } = useParent();
  const items = circulars.slice(0, 3);

  const isLoading = loading || childDataLoading;

  return (
    <div className="h-full min-h-[280px] sm:min-h-[320px] bg-surface-container-lowest dark:bg-slate-800/60 rounded-xl border border-outline-variant/5 dark:border-slate-700/40 flex flex-col p-4 sm:p-5">
      {/* Header - Consistent with PerformanceChart */}
      <div className="flex justify-between items-start mb-3 flex-shrink-0 gap-2">
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-bold font-headline text-on-surface dark:text-white mb-0.5 truncate">
            Circulars
          </h3>
          <p className="text-xs sm:text-sm text-on-surface-variant dark:text-slate-400 truncate">
            Official announcements and updates
          </p>
        </div>
        {!isLoading && items.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-on-surface-variant dark:text-slate-400 whitespace-nowrap">
              {items.length} new
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-3/4 bg-surface-container-low dark:bg-slate-700 rounded" />
                <div className="h-2.5 w-1/2 bg-surface-container-low dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-1.5 text-center">
            <span className="material-symbols-outlined text-3xl sm:text-4xl text-on-surface-variant/30 dark:text-slate-600">
              campaign
            </span>
            <p className="text-sm font-medium text-on-surface-variant dark:text-slate-400">
              No circulars yet
            </p>
            <p className="text-xs text-on-surface-variant/60 dark:text-slate-500">
              Check back later for updates
            </p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto flex-1">
            {items.map((c) => (
              <div 
                key={c.id} 
                className="flex items-start gap-2.5 group hover:bg-surface-container-low dark:hover:bg-slate-700/30 -mx-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <span
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    AUDIENCE_DOT[c.target_audience_display] || "bg-slate-400"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-on-surface dark:text-slate-200 leading-snug line-clamp-2 group-hover:text-primary dark:group-hover:text-primary-400 transition-colors">
                    {c.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-2xs sm:text-xs text-on-surface-variant/60 dark:text-slate-500">
                      {daysAgo(c.created_at)}
                    </p>
                    {c.target_audience_display && (
                      <span className="text-2xs px-1.5 py-0.5 rounded-full bg-surface-container-low dark:bg-slate-700 text-on-surface-variant/70 dark:text-slate-400">
                        {c.target_audience_display}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Button - Consistent with PerformanceChart's year label area */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-outline-variant/10 dark:border-slate-700/40 flex-shrink-0">
        <Link
          to="/parent/circulars"
          className="text-xs sm:text-sm font-semibold text-primary dark:text-primary-400 hover:text-primary/80 dark:hover:text-primary-300 hover:underline transition-colors"
        >
          View All Circulars →
        </Link>
        {!isLoading && items.length > 0 && (
          <span className="text-2xs sm:text-xs text-on-surface-variant/50 dark:text-slate-500">
            {items.length} of {circulars.length}
          </span>
        )}
      </div>
    </div>
  );
};

export default CircularsPreview;