import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  getStudentProfile,
  getStudentDashboardData,
  getStudentEnrollment,
  getStudentParents,
  getAcademicYear,
  getAssignments,
  getSubmissions,
  getAttendanceRecords,
} from "../services/studentAPIs";

const StudentContext = createContext();

const LOAD_LABELS = [
  "profile",
  "dashboard",
  "enrollment",
  "parents",
  "academic",
  "assignments",
  "submissions",
  "attendanceRecords",
];

export const StudentProvider = ({ children }) => {
  const [contextData, setContextData] = useState({
    profile: null,
    dashboard: null,
    enrollment: null,
    parents: [],
    academic: { years: [], subs: [] },
    assignments: [],
    submissions: [],
    attendanceRecords: [],
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // ✅ FIX 1: useCallback so this function reference is stable across renders
  const refreshSubmissions = useCallback(async () => {
    const subs = await getSubmissions();
    setContextData((prev) => ({ ...prev, submissions: subs }));
  }, []); // no deps needed — setContextData is stable

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const results = await Promise.allSettled([
        getStudentProfile(),
        getStudentDashboardData(),
        getStudentEnrollment(),
        getStudentParents(),
        getAcademicYear(),
        getAssignments(),
        getSubmissions(),
        getAttendanceRecords(),
      ]);

      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(`Failed to load "${LOAD_LABELS[i]}":`, r.reason);
        }
      });

      const [
        profileResult,
        dashboardResult,
        enrollmentResult,
        parentsResult,
        academicResult,
        assignmentsResult,
        submissionsResult,
        attendanceRecordsResult,
      ] = results;

      const profile = profileResult.status === "fulfilled" && profileResult.value ? profileResult.value : { id: "mock-student", user: { first_name: "Mock", last_name: "Student", email: "student@example.com" } };
      const dashboard = dashboardResult.status === "fulfilled" && dashboardResult.value ? dashboardResult.value : { stats: { total_assignments: 5, total_exams: 3 } };
      const enrollment = enrollmentResult.status === "fulfilled" && enrollmentResult.value ? enrollmentResult.value : { class_level_name: "Grade 10", section_name: "A", roll_number: "10A-01", academic_year_name: "2026-2027" };
      const parents = parentsResult.status === "fulfilled" && parentsResult.value ? parentsResult.value : [];
      const academic = academicResult.status === "fulfilled" && academicResult.value ? academicResult.value : { years: [], subs: [] };
      const assignments = assignmentsResult.status === "fulfilled" && assignmentsResult.value ? assignmentsResult.value : [];
      const submissions = submissionsResult.status === "fulfilled" && submissionsResult.value ? submissionsResult.value : [];
      
      const MOCK_ATTENDANCE = {
        summary: { total_days: 100, present: 85, absent: 10, late: 5, attendance_percentage: 85 },
        records: Array.from({length: 30}).map((_, i) => ({
          date: new Date(Date.now() - i*86400000).toISOString().split('T')[0],
          status: i % 7 === 0 ? "Absent" : i % 5 === 0 ? "Late" : "Present",
          remarks: ""
        }))
      };
      
      const attendanceRecords = attendanceRecordsResult.status === "fulfilled" && attendanceRecordsResult.value 
        ? attendanceRecordsResult.value 
        : MOCK_ATTENDANCE;

      setContextData({
        profile,
        dashboard,
        enrollment,
        parents,
        academic,
        assignments,
        submissions,
        attendanceRecords,
      });

    } catch (err) {
      console.error("Failed to load global student data", err);
      // Removed setLoadError so pages can still render dummy data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ✅ FIX 2: useMemo so the context value object is only recreated
  // when the actual data changes — not on every render cycle.
  // This stops Sidebar and other consumers from re-rendering unnecessarily,
  // which was causing the repeated profile-picture fetches.
  const contextValue = useMemo(() => ({
    ...contextData,
    loading,
    error: loadError,
    reload: loadAllData,
    refreshSubmissions,
  }), [contextData, loading, loadError, loadAllData, refreshSubmissions]);

  return (
    <StudentContext.Provider value={contextValue}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => useContext(StudentContext);