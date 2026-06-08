import React, { useState, useEffect } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";

export default function AssignTeacher() {
  const navigate = useNavigate();

  // API Data for Dropdowns
  const [teachers, setTeachers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Form State
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isClassTeacher, setIsClassTeacher] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
        const token = localStorage.getItem("accessToken");
        const headers = { "Authorization": `Bearer ${token}`, "Accept": "application/json" };

        // Assuming standard naming conventions for your Django academics app
        const [teacherRes, yearRes, classRes, sectionRes, subjectRes] = await Promise.all([
          fetch(`${baseUrl}v1/profiles/teachers/`, { headers }),
          fetch(`${baseUrl}v1/academics/academic-years/`, { headers }),
          fetch(`${baseUrl}v1/academics/class-levels/`, { headers }),
          fetch(`${baseUrl}v1/academics/sections/`, { headers }),
          fetch(`${baseUrl}v1/academics/subjects/`, { headers }),
        ]);

        if (teacherRes.ok) {
          const tData = await teacherRes.json();
          setTeachers(tData.results || tData);
        }
        if (yearRes.ok) {
          const yData = await yearRes.json();
          setAcademicYears(yData.results || yData);
        }
        if (classRes.ok) {
          const cData = await classRes.json();
          setClassLevels(cData.results || cData);
        }
        if (sectionRes.ok) {
          const secData = await sectionRes.json();
          setSections(secData.results || secData);
        }
        if (subjectRes.ok) {
          const subData = await subjectRes.json();
          setSubjects(subData.results || subData);
        }
      } catch (err) {
        console.error("Error fetching FK dropdowns:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      const payload = {
        is_class_teacher: isClassTeacher,
        teacher: selectedTeacher,
        academic_year: selectedYear,
        class_level: selectedClass,
        section: selectedSection,
        subject: selectedSubject
      };

      const response = await fetch(`${baseUrl}v1/academics/teacher-assignments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = "Failed to assign teacher.";
        if (typeof data === "object") {
          errorMsg = Object.entries(data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
            .join(" | ");
        }
        throw new Error(errorMsg);
      }

      alert("Teacher assigned successfully!");
      navigate("/school-admin/teacher-assignment");

    } catch (err) {
      console.error(err);
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTeacher("");
    setSelectedYear("");
    setSelectedClass("");
    setSelectedSection("");
    setSelectedSubject("");
    setIsClassTeacher(false);
    setError(null);
  };

  return (
    <SchoolLayout title="Teacher Assignment">
      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* heading */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#8b93a7] mb-3">
              <span className="cursor-pointer hover:text-[#0058be] transition-colors" onClick={() => navigate("/school-admin")}>Dashboard</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="cursor-pointer hover:text-[#0058be] transition-colors" onClick={() => navigate("/school-admin/teacher-assignment")}>Teacher Assignments</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-[#0b1c30]">Assign Faculty</span>
            </div>

            <h1 className="text-3xl font-extrabold mb-2 text-slate-800 tracking-tight">Assign Teacher to Class</h1>
            <p className="text-[#6b7280] text-sm max-w-2xl">
              Allocate faculty members to specific subjects, grade levels, and sections for the academic year. This securely links their profile to academic records.
            </p>
          </div>

          <button
            onClick={() => navigate("/school-admin/teacher-assignment")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[#0058be] rounded-md font-semibold hover:bg-gray-50 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Directory
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex gap-3 shadow-sm">
             <span className="material-symbols-outlined">error</span>
             <div>
               <p className="font-bold text-sm">Assignment Failed</p>
               <p className="text-sm mt-1">{error}</p>
             </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-10">

          {/* left form */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2 border-b border-gray-100 pb-4">
                <span className="material-symbols-outlined text-[#0058be]">engineering</span>
                Configuration Matrix
              </h2>

              <form onSubmit={submit} className="space-y-8">

                {/* teacher selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7280] mb-2">Select Educator</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">person_search</span>
                    <select
                      required
                      value={selectedTeacher}
                      onChange={e => setSelectedTeacher(e.target.value)}
                      className="w-full pl-10 pr-10 py-3.5 bg-[#f8f9ff] rounded-md outline-none focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all font-medium text-slate-700 appearance-none"
                    >
                      <option value="">Select Teacher Profile...</option>
                      {initialLoading ? (
                        <option disabled>Loading data...</option>
                      ) : (
                        teachers.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.first_name || t.last_name ? `${t.first_name} ${t.last_name}` : t.email} {t.employee_id ? `(EMP: ${t.employee_id})` : ''}
                          </option>
                        ))
                      )}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>

                {/* academic year & subject */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7280] mb-2">Academic Year</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">calendar_month</span>
                      <select
                        required
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        className="w-full pl-10 pr-10 py-3.5 bg-[#f8f9ff] rounded-md outline-none focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all font-medium text-slate-700 appearance-none"
                      >
                        <option value="">Select Academic Cycle...</option>
                        {initialLoading ? <option disabled>Loading...</option> : academicYears.map(y => (
                          <option key={y.id} value={y.id}>{y.name}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7280] mb-2">Subject Selection</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">menu_book</span>
                      <select
                        required
                        value={selectedSubject}
                        onChange={e => setSelectedSubject(e.target.value)}
                        className="w-full pl-10 pr-10 py-3.5 bg-[#f8f9ff] rounded-md outline-none focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all font-medium text-slate-700 appearance-none"
                      >
                        <option value="">Choose Subject/Course...</option>
                        {initialLoading ? <option disabled>Loading...</option> : subjects.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* class & section */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7280] mb-2">Class Level</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">school</span>
                      <select
                        required
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                        className="w-full pl-10 pr-10 py-3.5 bg-[#f8f9ff] rounded-md outline-none focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all font-medium text-slate-700 appearance-none"
                      >
                        <option value="">Select Grade/Class...</option>
                        {initialLoading ? <option disabled>Loading...</option> : classLevels.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7280] mb-2">Section / Batch</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">groups</span>
                      <select
                        required
                        value={selectedSection}
                        onChange={e => setSelectedSection(e.target.value)}
                        className="w-full pl-10 pr-10 py-3.5 bg-[#f8f9ff] rounded-md outline-none focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all font-medium text-slate-700 appearance-none"
                      >
                        <option value="">Select Section...</option>
                        {initialLoading ? <option disabled>Loading...</option> : sections.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Class teacher toggle */}
                <div className="pt-4 border-t border-gray-100">
                  <label className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-md cursor-pointer hover:bg-orange-100/50 transition-colors">
                    <div>
                      <span className="font-bold text-[#924700]">Assign as Class Teacher</span>
                      <p className="text-xs text-orange-800/80 mt-0.5">Designate this teacher as the primary academic advisor for this specific section.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={isClassTeacher} 
                      onChange={() => setIsClassTeacher(!isClassTeacher)}
                      className="w-5 h-5 rounded text-[#924700] focus:ring-[#924700]" 
                    />
                  </label>
                </div>

                {/* buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="px-6 py-3.5 text-[#6b7280] font-semibold hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Clear Form
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-3.5 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white font-bold rounded-md shadow-lg shadow-[#0058be]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:scale-100"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">done_all</span>
                        Confirm Assignment
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

            {/* Teaching Capacity Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0058be]">trending_up</span>
                  Teaching Capacity
                </h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                      Science Department
                      <span className="text-[#0058be] font-bold">85%</span>
                    </div>
                    <div className="h-2 bg-[#eff4ff] rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-[#0058be] rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                      Math Department
                      <span className="text-[#6b38d4] font-bold">62%</span>
                    </div>
                    <div className="h-2 bg-[#f2edff] rounded-full overflow-hidden">
                      <div className="h-full w-[62%] bg-[#6b38d4] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500">event_upcoming</span>
                  Upcoming Deadlines
                </h3>
                <div className="space-y-4 text-sm font-medium text-slate-700">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-md border border-red-100">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      Finalize Q1 electives
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-white px-2 py-0.5 rounded shadow-sm">2d left</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#eff4ff] rounded-md border border-blue-50">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#0058be] rounded-full"></div>
                      Faculty orientation
                    </div>
                    <span className="text-xs font-bold text-[#0058be] bg-white px-2 py-0.5 rounded shadow-sm">Sep 12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* right panel */}
          <div className="col-span-12 lg:col-span-4 space-y-6">

            {/* Database Intelligence */}
            <div className="bg-gradient-to-br from-[#0b1c30] to-[#1e3450] p-8 rounded-xl text-white shadow-lg relative overflow-hidden">
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/5">share</span>
              <h4 className="text-xl font-bold mb-4 relative z-10 flex items-center gap-2 text-blue-200">
                <span className="material-symbols-outlined">hub</span>
                Relational Logic
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed relative z-10 mb-6">
                By requiring 5 explicit UUIDs to make this connection, your backend completely prevents orphaned academic records. When a teacher marks attendance, Django instantly maps it directly to the exact Class Level and Section.
              </p>
              <div className="bg-black/20 p-4 rounded-md relative z-10 border border-white/10">
                <p className="text-xs font-mono text-green-300 font-bold mb-1">POST Endpoint:</p>
                <p className="text-xs font-mono text-slate-300">/api/v1/academics/teacher-assignments/</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">tips_and_updates</span>
                Assignment Protocol
              </h4>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <span className="pt-0.5">Ensure the selected teacher has an Active profile status.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <span className="pt-0.5">Verify that the Section capacity hasn't been exceeded.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-xs shrink-0">3</span>
                  <span className="pt-0.5">Changes automatically reflect in the Teacher Portal viewset.</span>
                </li>
              </ul>
            </div>
            
          </div>

        </div>
      </div>
    </SchoolLayout>
  );
}