import React, { useState, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";
import {
  calculateAttendance,
  getMonthName,
} from "../../utils/calculations";

export default function Attendance() {
  const { attendanceRecords: records, academic, loading } = useStudent();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // --- FILTERING LOGIC ---
  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return records.filter((record) => {
      const matchYear =
        selectedYear === "" || record.academic_year === selectedYear;
      return matchYear;
    });
  }, [records, selectedYear]);

  console.log("RECORDS", records);
  console.log("FILTERED", filteredRecords);

  // --- CALENDAR DATA MAPPING ---
  const attendanceMap = useMemo(() => {
    if (!filteredRecords || !Array.isArray(filteredRecords)) return {};
    return filteredRecords.reduce((acc, record) => {
      const dateKey = record.date;
      acc[dateKey] = record;
      return acc;
    }, {});
  }, [filteredRecords]);

  // --- CALENDAR NAVIGATION ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const daysCount = getDaysInMonth(year, month);
  const days = Array.from({ length: daysCount }, (_, i) => i + 1);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthWord = getMonthName(month);
  const academicYears = academic?.years || [];
  const subjects = academic?.subs || [];

  // --- DYNAMIC STATS ---
  const attendance = calculateAttendance(filteredRecords);
  const minRequirement = 75;
  const attendanceDifference = attendance - minRequirement;
  const requirementMet = attendance >= minRequirement;

  // ✅ useMemo for monthly distribution
  const monthlyDistribution = useMemo(() => {
    const summary = { Present: 0, Absent: 0, Late: 0 };
    filteredRecords.forEach((record) => {
      const recordDate = new Date(record.date);
      if (
        recordDate.getFullYear() === year &&
        recordDate.getMonth() === month
      ) {
        if (summary[record.status] !== undefined) {
          summary[record.status]++;
        }
      }
    });
    return summary;
  }, [filteredRecords, year, month]);

  // ✅ Early return after all hooks
  if (loading) return <MainLayout title="Attendance">Loading...</MainLayout>;

  return (
    <MainLayout title="Attendance">
      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* FILTERS */}
        <section className="flex flex-wrap items-center gap-4">
          <div className="flex-1 flex gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-surface-container-low border-none rounded-md px-4 py-2.5 text-sm font-['Inter'] focus:ring-2 focus:ring-surface-tint outline-none"
            >
              <option value="">All Academic Years</option>
              {academicYears.map((yr) => (
                <option key={yr.id} value={yr.id}>
                  {yr.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-surface-container-low border-none rounded-md px-4 py-2.5 text-sm font-['Inter'] focus:ring-2 focus:ring-surface-tint outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          <button className="bg-surface-container-high text-primary px-6 py-2.5 rounded-md font-['Inter'] font-semibold text-sm hover:bg-blue-200 transition-colors">
            Apply Filters
          </button>
        </section>

        {/* STATS CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {/* Card 1: Overall Attendance */}
          <div className="bg-surface-container-lowest p-6 rounded-xl space-y-4 shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-start">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <span className="material-symbols-outlined">analytics</span>
              </span>
            </div>
            <div>
              <p className="text-on-surface-variant text-sm font-['Inter']">
                Overall Attendance
              </p>
              <h2 className="text-4xl font-extrabold font-headline text-on-surface">
                {attendance}%
              </h2>
            </div>
            <div className="w-full bg-surface-container rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full"
                style={{ width: `${attendance}%` }}
              />
            </div>
          </div>

          {/* Card 2: Min Requirement */}
          <div className="bg-surface-container-lowest p-6 rounded-xl space-y-4 shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-start">
              <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <span className="material-symbols-outlined">gavel</span>
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                requirementMet
                  ? "text-green-600 bg-green-50"
                  : "text-red-600 bg-red-50"
              }`}>
                {requirementMet
                  ? "Requirement Met"
                  : "Requirement Not Met"}
              </span>
            </div>
            <div>
              <p className="text-on-surface-variant text-sm font-['Inter']">
                Min. Requirement
              </p>
              <h2 className="text-4xl font-extrabold font-headline text-on-surface">
                {minRequirement}%
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant italic">
              {requirementMet
                ? `You are ${attendanceDifference}% above the limit.`
                : `You are ${Math.abs(attendanceDifference)}% below the limit.`}
            </p>
          </div>

          {/* Card 3: Monthly Distribution Bar Chart */}
          <div className="flex flex-col h-64 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
            <p className="text-on-surface-variant text-sm font-['Inter'] mb-1">
              Monthly Breakdown
            </p>
            <p className="text-xs text-on-surface-variant/60 font-['Inter'] mb-4">
              {monthWord} {year}
            </p>

            {monthlyDistribution.Present === 0 &&
            monthlyDistribution.Absent === 0 &&
            monthlyDistribution.Late === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-['Inter']">
                No data for this month
              </div>
            ) : (
              <div className="flex-1 flex items-end gap-4">
                {[
                  {
                    label: "Present",
                    count: monthlyDistribution.Present,
                    barColor: "bg-green-400",
                    textColor: "text-green-600",
                  },
                  {
                    label: "Absent",
                    count: monthlyDistribution.Absent,
                    barColor: "bg-red-400",
                    textColor: "text-red-600",
                  },
                  {
                    label: "Late",
                    count: monthlyDistribution.Late,
                    barColor: "bg-yellow-400",
                    textColor: "text-yellow-600",
                  },
                ].map(({ label, count, barColor, textColor }) => {
                  const total =
                    monthlyDistribution.Present +
                    monthlyDistribution.Absent +
                    monthlyDistribution.Late;
                  const heightPercent =
                    total > 0 ? Math.round((count / total) * 100) : 0;

                  return (
                    <div
                      key={label}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <span className={`text-[11px] font-bold ${textColor}`}>
                        {count}
                      </span>
                      <div
                        className="w-full flex items-end"
                        style={{ height: "80px" }}
                      >
                        <div
                          className={`w-full ${barColor} rounded-t-md transition-all duration-500`}
                          style={{
                            height: `${heightPercent}%`,
                            minHeight: count > 0 ? "4px" : "0px",
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-['Inter']">
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </section>

        {/* CALENDAR */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold font-headline text-on-surface">
                  {monthWord} {year}
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Visual Presence Log
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-surface-container rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-surface-container rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-bold text-slate-400 pb-2 w-12"
                >
                  {day}
                </div>
              ))}

              {emptyDays.map((blank) => (
                <div key={`blank-${blank}`} className="w-12 h-12" />
              ))}

              {days.map((day) => {
                const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const record = attendanceMap?.[dateKey];
                const baseClass =
                  "h-12 w-12 rounded-lg flex items-center justify-center text-sm font-semibold border transition-all";
                const statusClasses = {
                  Present: "bg-green-100 text-green-700 border-green-200",
                  Absent: "bg-red-100 text-red-700 border-red-200",
                  Late: "bg-yellow-100 text-yellow-700 border-yellow-200",
                };
                return (
                  <div
                    key={day}
                    className={`${baseClass} ${
                      record
                        ? statusClasses[record.status]
                        : "bg-surface-container-lowest border-surface-container"
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-surface-container-low">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs font-semibold text-on-surface-variant">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-xs font-semibold text-on-surface-variant">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-xs font-semibold text-on-surface-variant">Late</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="text-xs font-semibold text-on-surface-variant">Holiday/Weekend</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </MainLayout>
  );
}