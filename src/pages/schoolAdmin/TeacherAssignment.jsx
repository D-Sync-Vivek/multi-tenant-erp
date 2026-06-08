import React, { useState, useEffect } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";

export default function TeacherAssignment() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${baseUrl}v1/academics/teacher-assignments/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch teacher assignments.");
      }

      const data = await response.json();
      
      if (data.results) {
        setAssignments(data.results);
        setTotalCount(data.count);
      } else {
        setAssignments(data);
        setTotalCount(data.length);
      }
    } catch (err) {
      console.error("Fetch Assignments Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "TR";
    const parts = name.split(" ");
    if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getColorClass = (index) => {
    const colors = ["bg-[#e9ddff] text-[#6b38d4]", "bg-[#d8e2ff] text-[#0058be]", "bg-[#ffdcc6] text-[#924700]", "bg-[#eff4ff] text-[#2170e4]"];
    return colors[index % colors.length];
  };

  return (
    <SchoolLayout title="Teacher Assignment">
      <div className="max-w-7xl mx-auto px-8 pt-6 pb-12">

        {/* heading */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Resource Allocation</h1>
            <p className="text-[#6b7280] mt-1 max-w-2xl">
              Manage teaching staff roles across departments, subjects, and specific class sections.
            </p>
          </div>

          <button
            onClick={() => navigate("/school-admin/teacher-assignment/create")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white font-semibold rounded-md shadow-lg hover:shadow-xl transition-all"
          >
            <span className="material-symbols-outlined">add</span>
            Assign Teacher
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {/* stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="md:col-span-2 bg-white p-6 rounded-xl border-l-4 border-[#0058be] shadow-sm">
            <p className="text-xs font-bold text-[#0058be] uppercase tracking-wider">
              Allocation Overview
            </p>
            <div className="flex items-end gap-4 mt-3">
              <h3 className="text-5xl font-bold text-slate-800">{totalCount}</h3>
              <p className="text-sm text-[#6b7280] pb-1">Total Active Assignments</p>
            </div>
            <div className="h-2 bg-[#eff4ff] rounded-full mt-4">
              <div className="bg-[#0058be] h-full w-[84%] rounded-full shadow-sm"></div>
            </div>
          </div>

          <div className="bg-[#eff4ff] p-6 rounded-xl shadow-sm border border-blue-50">
            <span className="material-symbols-outlined text-[#0058be] text-3xl mb-3">class</span>
            <h3 className="text-2xl font-bold text-slate-800">
              {new Set(assignments.map(a => a.class_level_name)).size}
            </h3>
            <p className="text-sm text-[#6b7280]">Classes Covered</p>
          </div>

          <div className="bg-[#fff4ed] p-6 rounded-xl shadow-sm border border-orange-50">
            <span className="material-symbols-outlined text-[#924700] text-3xl mb-3">menu_book</span>
            <h3 className="text-2xl font-bold text-[#924700]">
              {new Set(assignments.map(a => a.subject_name)).size}
            </h3>
            <p className="text-sm text-[#924700]/80">Subjects Taught</p>
          </div>
        </div>

        {/* filters & table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 flex gap-4 items-center border-b border-gray-100 bg-[#f8f9ff]">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-sm">search</span>
              <input
                placeholder="Search assignment records..."
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-md outline-none border border-gray-200 focus:border-[#0058be]/30 shadow-sm transition-all text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm font-medium text-slate-700 hover:bg-gray-50 shadow-sm transition-colors">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filters
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-xs uppercase text-[#6b7280] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Teacher Name</th>
                  <th className="px-6 py-4 font-semibold">Subject</th>
                  <th className="px-6 py-4 font-semibold">Class / Section</th>
                  <th className="px-6 py-4 font-semibold">Academic Year</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-[#0058be]">progress_activity</span>
                        Loading assignment matrix...
                      </div>
                    </td>
                  </tr>
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-500">
                      No teachers assigned to classes yet.
                    </td>
                  </tr>
                ) : (
                  assignments.map((a, i) => (
                    <tr key={a.id} className="hover:bg-[#fcfdff] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${getColorClass(i)}`}>
                            {getInitials(a.teacher_name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{a.teacher_name || "Unknown Teacher"}</p>
                            <p className="text-xs text-[#6b7280] font-mono">EMP: {a.teacher_employee_id || "N/A"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#e9ddff] text-[#6b38d4] border border-[#d6beff]">
                          {a.subject_name || "Unknown Subject"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-medium text-slate-800">{a.class_level_name || "Unknown Class"}</p>
                        <p className="text-xs text-[#6b7280] mt-0.5">Section: {a.section_name || "N/A"}</p>
                      </td>

                      <td className="px-6 py-5 text-sm text-[#475569] font-medium">
                        {a.academic_year_name || "Current Year"}
                      </td>

                      <td className="px-6 py-5">
                        {a.is_class_teacher ? (
                          <span className="text-xs font-bold flex items-center gap-1 text-[#0058be] bg-blue-50 px-2.5 py-1 rounded-full w-max border border-blue-100">
                            <span className="material-symbols-outlined text-[14px]">star</span>
                            Class Teacher
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            Subject Teacher
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 hover:bg-blue-50 text-[#0058be] rounded-md transition-colors">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button className="p-2 hover:bg-red-50 text-red-500 rounded-md transition-colors">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-[#6b7280] font-medium">
              Showing {assignments.length} of {totalCount} assignments
            </p>
            <div className="flex gap-2">
              <button className="w-10 h-10 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 rounded-md text-gray-500 transition-colors">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="w-10 h-10 flex items-center justify-center bg-[#0058be] text-white rounded-md font-bold shadow-sm">1</span>
              <button className="w-10 h-10 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 rounded-md text-gray-500 transition-colors">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* insight section */}
        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative overflow-hidden rounded-xl p-8 bg-gradient-to-br from-[#f8f9ff] to-[#e5eeff] border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 text-[#0058be] mb-4">
              <span className="material-symbols-outlined">api</span>
              <span className="text-xs font-bold tracking-widest uppercase">Relational Integrity</span>
            </div>
            <h3 className="text-2xl font-bold text-[#0b1c30] mb-3">
              Django ORM Foreign Keys
            </h3>
            <p className="text-[#475569] max-w-xl leading-relaxed">
              This ViewSet connects the `TeacherProfile`, `AcademicYear`, `ClassLevel`, `Section`, and `Subject` models together. These foreign keys ensure that grades and attendance are perfectly segmented by subject and section.
            </p>
            <div className="absolute right-4 bottom-4 opacity-10">
              <span className="material-symbols-outlined text-[120px] text-[#0058be]">database</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-[#0b1c30] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500">warning</span>
              Upcoming Gaps
            </h4>
            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                <div>
                  <p className="font-semibold text-[#0b1c30] text-sm">Biology - Grade 11</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">Vacancy starting next week</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0"></div>
                <div>
                  <p className="font-semibold text-[#0b1c30] text-sm">History - Grade 10</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">Teacher on medical leave</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </SchoolLayout>
  );
}