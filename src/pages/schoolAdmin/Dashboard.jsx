import React, { useState, useEffect } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";
import { getDashboardStats, getEnrollmentTrends } from "../../services/schoolAdminApi";

export default function Dashboard() {
  const navigate = useNavigate();

  // State for Live Data strictly tracking database rows
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_classes: 0,
    attendance_rate: 0,
    academic_year: "..."
  });
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemError, setSystemError] = useState(null);

  // Premium Interactions State
  const [activeCardPanel, setActiveCardPanel] = useState(null); 
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false); 

  // Time-range filter selection: "1M" | "3M" | "6M" | "12M"
  const [timeRange, setTimeRange] = useState("6M");

  // Fetch Data on Component Mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setSystemError(null);
      try {
        const [statsData, trendsData] = await Promise.all([
          getDashboardStats(),
          getEnrollmentTrends()
        ]);
        
        if (statsData) {
          setStats(statsData);
        }
        
        const liveTrends = trendsData?.trends || trendsData || [];
        setTrends(Array.isArray(liveTrends) ? liveTrends : []);
        
      } catch (error) {
        console.error("Critical database connection link trace:", error);
        setSystemError("Database connection warning: Dashboard is unable to pull operational telemetry due to a backend exception.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute chart elements based on the active timeframe selector filter
  const getVisibleTrends = () => {
    const requiredLength = timeRange === "1M" ? 1 : timeRange === "3M" ? 3 : timeRange === "6M" ? 6 : 12;
    let actualData = Array.isArray(trends) ? trends : [];
    
    if (actualData.length >= requiredLength) {
      return actualData.slice(-requiredLength);
    }
    
    const paddingNeeded = requiredLength - actualData.length;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    let lastMonthIndex = new Date().getMonth(); 
    if (actualData.length > 0) {
      const lastMonthString = actualData[actualData.length - 1].month;
      if (lastMonthString) {
        const foundIndex = monthNames.findIndex(m => m.toLowerCase() === lastMonthString.substring(0, 3).toLowerCase());
        if (foundIndex !== -1) {
          lastMonthIndex = foundIndex;
        }
      }
    }
    
    const paddedArray = Array.from({ length: paddingNeeded }, (_, i) => {
      const upcomingMonthIndex = (lastMonthIndex + 1 + i) % 12; 
      return {
        enrollments: 0,
        month: monthNames[upcomingMonthIndex],
        isPlaceholder: true 
      };
    });

    return [...actualData, ...paddedArray];
  };

  const visibleTrends = getVisibleTrends();
  const maxEnrollment = Math.max(1, ...visibleTrends.filter(t => !t.isPlaceholder).map(t => t.enrollments || 0));
  const attendancePercentage = stats.attendance_rate || 0;
  const strokeDashoffset = 440 - (440 * (attendancePercentage / 100));

  return (
    <SchoolLayout title="Academic Architecture Workspace">
      
      <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        
        {/* System Server Error Banner */}
        {systemError && (
          <div className="mb-8 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl text-sm font-medium flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-red-600 text-lg">dns</span>
            </div>
            <span>{systemError}</span>
          </div>
        )}

        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Academic Overview</h2>
            <p className="text-slate-500 text-sm font-medium">
              Real-time multi-tenant telemetry and operational maps.
            </p>
          </div>

          <button
            onClick={() => navigate("/school-admin/manage-classes")}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 outline-none border border-slate-700"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Manage Classes
          </button>
        </div>

        {/* STAGE 1: DYNAMIC STAT CARDS (Bento Box Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
          
          {/* Card 1: Students */}
          <div 
            onClick={() => navigate("/school-admin/students")}
            className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,88,190,0.08)] hover:border-blue-200 transition-all duration-300 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-0"></div>
            <div className="flex justify-between items-start mb-6 relative">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined">school</span>
              </div>
              <span className="text-[11px] font-black tracking-tight bg-emerald-50 text-emerald-600 border border-emerald-100/50 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[12px] font-bold">trending_up</span>+4%
              </span>
            </div>
            <div className="space-y-1 relative">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                {loading ? "..." : stats.total_students}
              </h3>
            </div>
          </div>

          {/* Card 2: Teachers */}
          <div 
            onClick={() => navigate("/school-admin/teachers")}
            className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(107,56,212,0.08)] hover:border-purple-200 transition-all duration-300 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-0"></div>
            <div className="flex justify-between items-start mb-6 relative">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined">supervisor_account</span>
              </div>
              <span className="text-[11px] font-black tracking-tight bg-slate-50 text-slate-500 border border-slate-200/60 px-2.5 py-1 rounded-full uppercase shadow-sm">Stable</span>
            </div>
            <div className="space-y-1 relative">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Teachers</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-purple-600 transition-colors">
                {loading ? "..." : stats.total_teachers}
              </h3>
            </div>
          </div>

          {/* Card 3: Classes */}
          <div 
            onClick={() => navigate("/school-admin/class-levels")}
            className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.08)] hover:border-amber-200 transition-all duration-300 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-0"></div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-6 relative">
              <span className="material-symbols-outlined">meeting_room</span>
            </div>
            <div className="space-y-1 relative">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Classes</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors">
                {loading ? "..." : stats.total_classes}
              </h3>
            </div>
          </div>

          {/* Card 4: Academic Year */}
          <div 
            onClick={() => navigate("/school-admin/academic-years")}
            className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:border-slate-300 transition-all duration-300 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-0"></div>
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-6 relative">
              <span className="material-symbols-outlined text-base">calendar_today</span>
            </div>
            <div className="space-y-1 relative">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Cycle</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-slate-600 transition-colors pt-1">
                {loading ? "..." : stats.academic_year}
              </h3>
            </div>
          </div>

          {/* Card 5: Attendance (Interactive) */}
          <div 
            onClick={() => setActiveCardPanel(activeCardPanel === "attendance" ? null : "attendance")}
            className={`p-6 rounded-3xl border transition-all duration-500 cursor-pointer group relative overflow-hidden ${
              activeCardPanel === "attendance" 
                ? "bg-rose-50/50 border-rose-200 shadow-inner" 
                : "bg-white border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(225,29,72,0.08)] hover:border-rose-200"
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-0"></div>
            <div className="flex justify-between items-start mb-6 relative">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeCardPanel === "attendance" ? "bg-rose-200 text-rose-700 scale-110" : "bg-rose-50 text-rose-600 group-hover:scale-110"}`}>
                <span className="material-symbols-outlined">how_to_reg</span>
              </div>
              <span className="text-[11px] font-black tracking-tight bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[12px] font-bold">trending_down</span>-0.2%
              </span>
            </div>
            <div className="space-y-1 relative">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Engagement Rate</p>
              <h3 className={`text-3xl font-black tracking-tight transition-colors ${activeCardPanel === "attendance" ? "text-rose-600" : "text-slate-900 group-hover:text-rose-600"}`}>
                {loading ? "..." : `${stats.attendance_rate}%`}
              </h3>
            </div>
          </div>

        </div>

        {/* INLINE EXTENSION DRAWER (AI Insight Style) */}
        <div className={`grid transition-all duration-500 ease-in-out ${activeCardPanel === "attendance" ? "grid-rows-[1fr] opacity-100 mb-8" : "grid-rows-[0fr] opacity-0 mb-0"}`}>
          <div className="overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-rose-50/80 via-white to-white rounded-3xl border border-rose-100/80 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-rose-100 flex items-center justify-center shrink-0 mt-1">
                <span className="material-symbols-outlined text-rose-500 animate-pulse">auto_awesome</span>
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-900 mb-1">Engagement Analytics Trace</h5>
                <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-3xl">
                  Macro dashboard monitoring indicates morning register logs compiled a slight dip within Grade 9 cohorts. Classroom availability tracking is functional across all active floor maps.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STAGE 2: HIGH-FIDELITY CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* ENROLLMENT GROWTH MATRIX CARD */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <div className="space-y-1">
                <h3 className="text-lg font-black tracking-tight text-slate-900">Enrollment Growth Matrix</h3>
                <p className="text-sm font-medium text-slate-500">Annual student registration trends</p>
              </div>
              
              {/* iOS Segmented Control Style Filters */}
              <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/50 shadow-inner">
                {["1M", "3M", "6M", "12M"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 outline-none ${
                      timeRange === range 
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent"
                    }`}
                  >
                    {range === "1M" ? "1 Month" : range === "3M" ? "3 Months" : range === "6M" ? "6 Months" : "1 Year"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-3 h-[260px] relative justify-center">
              {visibleTrends.length === 0 ? (
                <div className="w-full text-center text-sm font-medium text-slate-400 pb-12 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-2xl text-slate-300">bar_chart</span>
                  </div>
                  <span>Awaiting historical telemetry data to map matrices.</span>
                </div>
              ) : (
                visibleTrends.map((b, i) => {
                  const isActive = !b.isPlaceholder && i === visibleTrends.findIndex(t => !t.isPlaceholder) + (visibleTrends.filter(t => !t.isPlaceholder).length - 1);
                  const dynamicHeight = b.isPlaceholder ? 0 : Math.max((b.enrollments / maxEnrollment) * 100, 12);
                  
                  return (
                    <div key={i} className="flex flex-col items-center gap-3 w-full h-full justify-end group/bar relative">
                      
                      {!b.isPlaceholder && (
                        <div className="absolute -top-10 opacity-0 group-hover/bar:opacity-100 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl transition-all duration-200 pointer-events-none z-10 translate-y-2 group-hover/bar:translate-y-0">
                          {b.enrollments} Enrolled
                        </div>
                      )}

                      <div className="w-full h-full flex items-end">
                        <div
                          style={{ height: `${dynamicHeight}%` }}
                          className={`w-full rounded-t-xl transition-all duration-700 ease-out relative overflow-hidden ${
                            b.isPlaceholder 
                              ? "bg-transparent border-t-2 border-dashed border-slate-200" 
                              : isActive 
                                ? "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
                                : "bg-blue-100 group-hover/bar:bg-blue-500"
                          }`}
                        >
                          {isActive && <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>}
                        </div>
                      </div>
                      
                      <span className={`text-[11px] font-bold tracking-wider ${
                        b.isPlaceholder ? "text-slate-300" : isActive ? "text-slate-900" : "text-slate-500"
                      }`}>
                        {b.month?.substring(0, 3) || b.month || "N/A"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Attendance Donut Chart */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-black tracking-tight text-slate-900">Engagement Tracker</h3>
              <p className="text-sm font-medium text-slate-500">Weekly average attendance</p>
            </div>

            <div className="relative flex items-center justify-center my-6">
              <svg className="w-48 h-48 -rotate-90 filter drop-shadow-sm">
                <circle cx="96" cy="96" r="76" stroke="#f1f5f9" strokeWidth="16" fill="none" />
                <circle
                  cx="96"
                  cy="96"
                  r="76"
                  stroke="#6b38d4"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray="477.5"
                  strokeDashoffset={477.5 - (477.5 * (attendancePercentage / 100))}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(107,56,212,0.4)]"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">{loading ? "..." : `${stats.attendance_rate}%`}</h3>
                <span className={`text-[10px] tracking-widest font-bold uppercase mt-1 px-2 py-0.5 rounded-full ${
                  attendancePercentage >= 90 ? "bg-emerald-50 text-emerald-600" : attendancePercentage >= 75 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                }`}>
                  {attendancePercentage >= 90 ? "Optimal" : attendancePercentage >= 75 ? "Stable" : "Warning"}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-[0_0_8px_rgba(107,56,212,0.6)]"></div>
                <p className="text-xs font-bold text-slate-500">Active Students</p>
              </div>
              <p className="font-black text-slate-900 text-sm">{stats.total_students}</p>
            </div>
          </div>
        </div>

      </div>

      {/* STAGE 4: FLOATING ACTION HUB */}
      <div className="fixed bottom-8 right-8 z-40">
        
        {isFloatingMenuOpen && (
          <>
            <div className="fixed inset-0 z-10 bg-slate-900/5 backdrop-blur-[1px] transition-all" onClick={() => setIsFloatingMenuOpen(false)} />
            <div className="absolute bottom-16 right-0 flex flex-col gap-3 items-end z-20 animate-in slide-in-from-bottom-2 fade-in duration-200">
              
              <button 
                onClick={() => { setIsFloatingMenuOpen(false); navigate("/school-admin/students"); }}
                className="bg-white px-5 py-3 text-xs font-bold tracking-tight text-slate-700 border border-slate-200/80 shadow-xl rounded-2xl hover:bg-slate-50 hover:text-blue-600 hover:-translate-y-1 flex items-center gap-3 whitespace-nowrap outline-none transition-all group"
              >
                <span>Add Student Record</span>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </div>
              </button>

            </div>
          </>
        )}

        <button 
          onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
          className={`w-14 h-14 rounded-2xl text-white text-2xl flex items-center justify-center transition-all duration-300 transform outline-none shadow-xl ${
            isFloatingMenuOpen 
              ? "rotate-45 bg-slate-800 hover:bg-slate-900 shadow-slate-900/20" 
              : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 hover:-translate-y-1 active:translate-y-0 active:scale-95"
          }`}
        >
          <span className="material-symbols-outlined font-black text-2xl">add</span>
        </button>

      </div>

    </SchoolLayout>
  );
}