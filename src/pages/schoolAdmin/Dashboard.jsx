import React, { useState, useEffect } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";
import { getDashboardStats, getEnrollmentTrends, getRecentActivity } from "../../services/schoolAdminApi";

export default function Dashboard() {
  const navigate = useNavigate();

  // State for Live Data
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_classes: 0,
    attendance_rate: 0,
    academic_year: "..."
  });
  const [trends, setTrends] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data on Component Mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, trendsData, activityData] = await Promise.all([
          getDashboardStats(),
          getEnrollmentTrends(),
          getRecentActivity()
        ]);
        setStats(statsData);
        setTrends(trendsData.trends || []);
        setActivities(activityData.results || activityData || []);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Dynamic Calculation Helpers
  const maxEnrollment = trends.length > 0 ? Math.max(...trends.map(t => t.enrollments)) : 1;
  
  // For the SVG Ring: Total circumference is 440
  const attendancePercentage = stats.attendance_rate || 0;
  const strokeDashoffset = 440 - (440 * (attendancePercentage / 100));

  // Helper to style dynamic activity logs based on keyword
  const getActivityStyle = (actionType = "") => {
    const type = actionType.toLowerCase();
    if (type.includes("student")) return { icon: "person_add", color: "text-[#0058be]", bg: "bg-[#d8e2ff]" };
    if (type.includes("teacher") || type.includes("assign")) return { icon: "assignment_ind", color: "text-[#6b38d4]", bg: "bg-[#e9ddff]" };
    if (type.includes("enroll") || type.includes("curriculum")) return { icon: "description", color: "text-[#924700]", bg: "bg-[#ffdcc6]" };
    if (type.includes("alert") || type.includes("warning")) return { icon: "warning", color: "text-[#ba1a1a]", bg: "bg-[#ffdad6]" };
    return { icon: "info", color: "text-[#0058be]", bg: "bg-[#d8e2ff]" };
  };

  return (
    <SchoolLayout>
      {/* title */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Academic Overview</h2>
          <p className="text-[#6b7280] mt-1">
            Welcome back, Administrator. Here's what's happening today.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/school-admin/create-section")}
            className="px-5 py-2.5 bg-white border border-[#0058be]/20 text-[#0058be] font-semibold rounded-md shadow-sm hover:bg-[#eff4ff] transition"
          >
            Create Section
          </button>
          <button
            onClick={() => navigate("/school-admin/create-class")}
            className="px-5 py-2.5 bg-[#dce9ff] text-[#0058be] font-semibold rounded-md shadow-sm hover:bg-[#cfe0ff] transition"
          >
            Create Class Level
          </button>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-5 gap-6 mb-10">
        {/* students */}
        <div className="bg-white p-6 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.04)] border-l-4 border-[#0058be]">
          <div className="flex justify-between mb-4">
            <div className="p-2 bg-[#d8e2ff] rounded-md">
              <span className="material-symbols-outlined text-[#0058be]">school</span>
            </div>
            <span className="text-xs font-semibold bg-[#d8e2ff] px-1 py-1 rounded-semi">+4%</span>
          </div>
          <p className="text-sm text-[#6b7280]">Total Students</p>
          <h3 className="text-3xl font-bold">{loading ? "..." : stats.total_students}</h3>
        </div>

        {/* teachers */}
        <div className="bg-white p-6 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.04)] border-l-4 border-[#6b38d4]">
          <div className="flex justify-between mb-4">
            <div className="p-2 bg-[#e9ddff] rounded-md">
              <span className="material-symbols-outlined text-[#6b38d4]">supervisor_account</span>
            </div>
            <span className="text-xs font-semibold bg-[#e9ddff] px-1 py-1 rounded-semi">Stable</span>
          </div>
          <p className="text-sm text-[#6b7280]">Total Teachers</p>
          <h3 className="text-3xl font-bold">{loading ? "..." : stats.total_teachers}</h3>
        </div>

        {/* classes */}
        <div className="bg-white p-6 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.04)] border-l-4 border-[#924700]">
          <div className="p-2 bg-[#ffdcc6] rounded-md mb-4 w-fit">
            <span className="material-symbols-outlined text-[#924700]">meeting_room</span>
          </div>
          <p className="text-sm text-[#6b7280]">Total Classes</p>
          <h3 className="text-3xl font-bold">{loading ? "..." : stats.total_classes}</h3>
        </div>

        {/* academic year */}
        <div className="bg-white p-6 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.04)] border-l-4 border-[#c2c6d6]">
          <div className="p-2 bg-[#e5eeff] rounded-md mb-4 w-fit">
            <span className="material-symbols-outlined text-[#727785]">calendar_today</span>
          </div>
          <p className="text-sm text-[#6b7280]">Active Year</p>
          <h3 className="text-3xl font-bold">{loading ? "..." : stats.academic_year}</h3>
        </div>

        {/* attendance */}
        <div className="bg-white p-6 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.04)] border-l-4 border-[#ba1a1a]">
          <div className="flex justify-between mb-4">
            <div className="p-2 bg-[#ffdad6] rounded-md">
              <span className="material-symbols-outlined text-[#ba1a1a]">how_to_reg</span>
            </div>
            <span className="text-xs font-semibold bg-[#ffdad6] px-1 py-1 rounded-semi">-0.2%</span>
          </div>
          <p className="text-sm text-[#6b7280]">Attendance</p>
          <h3 className="text-3xl font-bold">{loading ? "..." : `${stats.attendance_rate}%`}</h3>
        </div>
      </div>

      {/* charts */}
      <div className="grid grid-cols-3 gap-8 mb-10">
        {/* enrollment chart */}
        <div className="col-span-2 bg-white p-8 rounded-lg shadow-[0_12px_32px_rgba(11,28,48,0.06)]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-semibold">Enrollment Growth</h3>
              <p className="text-sm text-[#6b7280]">Annual student registration trends</p>
            </div>
            <span className="text-xs font-semibold bg-[#eff4ff] px-3 py-1 rounded-md">Last 6 Months</span>
          </div>

          <div className="flex items-end gap-6 h-64 px-2">
            {trends.length === 0 && !loading && (
              <p className="w-full text-center text-gray-400 pb-10">No enrollment data available yet.</p>
            )}
            {trends.map((b, i) => {
              const isActive = i === trends.length - 1;
              const dynamicHeight = Math.max((b.enrollments / maxEnrollment) * 100, 10);
              
              return (
                <div key={i} className="flex flex-col items-center gap-2 w-full h-full justify-end">
                  <div
                    style={{ height: `${dynamicHeight}%` }}
                    className={`${isActive ? "bg-[#0058be] shadow-lg shadow-[#0058be]/20" : "bg-[#d3e4fe] hover:bg-[#0058be]"} w-full rounded-t-sm transition-all duration-500`}
                  ></div>
                  <span className={`text-[11px] font-semibold uppercase ${isActive ? "text-[#0058be]" : "text-[#727785]"}`}>
                    {b.month?.substring(0, 3) || b.month || "N/A"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* attendance chart */}
        <div className="bg-white p-8 rounded-lg shadow-[0_12px_32px_rgba(11,28,48,0.06)]">
          <h3 className="text-xl font-semibold mb-1">Attendance Trend</h3>
          <p className="text-sm text-[#6b7280] mb-8">Weekly average engagement</p>

          <div className="relative flex items-center justify-center">
            <svg className="w-44 h-44 -rotate-90">
              <circle cx="88" cy="88" r="70" stroke="#e5eeff" strokeWidth="12" fill="none" />
              <circle
                cx="88"
                cy="88"
                r="70"
                stroke="#6b38d4"
                strokeWidth="12"
                fill="none"
                strokeDasharray="440"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
              />
            </svg>

            <div className="absolute text-center">
              <h3 className="text-3xl font-bold">{loading ? "..." : `${stats.attendance_rate}%`}</h3>
              <p className="text-[11px] tracking-widest text-[#6b38d4] font-semibold">
                {attendancePercentage >= 90 ? "EXCELLENT" : attendancePercentage >= 75 ? "GOOD" : "NEEDS WORK"}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3 text-sm">
            <div className="flex justify-between">
              <p className="flex items-center gap-2 text-[#6b7280]">
                <span className="w-2 h-2 rounded-full bg-[#6b38d4]"></span>
                Present / Total Target
              </p>
              <p className="font-semibold">{stats.total_students}</p>
            </div>
          </div>
        </div>
      </div>

      {/* activity */}
      <div className="bg-white rounded-lg shadow-[0_12px_32px_rgba(11,28,48,0.06)] overflow-hidden">
        <div className="px-8 py-6 flex justify-between items-center bg-[#f1f5ff]">
          <h3 className="text-xl font-semibold">Recent Activity</h3>
          <button className="text-[#0058be] font-semibold">View All Logs</button>
        </div>

        <div className="divide-y">
          {loading ? (
            <div className="px-8 py-10 text-center text-gray-500">Loading activities...</div>
          ) : activities.length === 0 ? (
            <div className="px-8 py-10 text-center text-gray-500">No recent activity logged.</div>
          ) : (
            activities.map((item, index) => {
              const style = getActivityStyle(item.action_type);
              
              return (
                <div key={item.id || index} className="px-8 py-5 flex justify-between items-center hover:bg-[#f8f9ff]">
                  <div className="flex gap-4 items-center">
                    <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined ${style.color}`}>
                        {style.icon}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {item.description}
                      </p>
                      <p className="text-xs text-[#6b7280] capitalize">
                        {item.action_type} • {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-[#727785]">
                    By: {item.user_name || "System"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* floating button */}
      <div className="fixed bottom-8 right-8">
        <button className="w-14 h-14 rounded-full bg-[#0058be] text-white text-2xl shadow-[0_12px_30px_rgba(0,88,190,0.35)]">
          +
        </button>
      </div>
    </SchoolLayout>
  );
}