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
  getCirculars,
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
  "circulars",
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
    circulars: [],
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const refreshSubmissions = useCallback(async () => {
    const subs = await getSubmissions();
    setContextData((prev) => ({ ...prev, submissions: subs }));
  }, []);

  const refreshCirculars = useCallback(async () => {
    const circulars = await getCirculars();
    setContextData((prev) => ({ ...prev, circulars }));
  }, []);

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
        getCirculars(),
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
        circularsResult,
      ] = results;

      const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
      const dashboard = dashboardResult.status === "fulfilled" ? dashboardResult.value : null;
      const enrollment = enrollmentResult.status === "fulfilled" ? enrollmentResult.value : null;
      const parents = parentsResult.status === "fulfilled" ? parentsResult.value : [];
      const academic = academicResult.status === "fulfilled" ? academicResult.value : { years: [], subs: [] };
      const assignments = assignmentsResult.status === "fulfilled" ? assignmentsResult.value : [];
      const submissions = submissionsResult.status === "fulfilled" ? submissionsResult.value : [];
      const attendanceRecords =
        attendanceRecordsResult.status === "fulfilled" ? attendanceRecordsResult.value : [];
      const circulars = circularsResult.status === "fulfilled" ? circularsResult.value : [];

      setContextData({
        profile,
        dashboard,
        enrollment,
        parents,
        academic,
        assignments,
        submissions,
        attendanceRecords,
        circulars,
      });

      if (!profile) {
        setLoadError(
          "We couldn't load your profile right now. Please try again, or contact support if this keeps happening.",
        );
      }
    } catch (err) {
      console.error("Failed to load global student data", err);
      setLoadError(err.message || "Something went wrong loading your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const contextValue = useMemo(() => ({
    ...contextData,
    loading,
    error: loadError,
    reload: loadAllData,
    refreshSubmissions,
    refreshCirculars,
  }), [contextData, loading, loadError, loadAllData, refreshSubmissions, refreshCirculars]);

  return (
    <StudentContext.Provider value={contextValue}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => useContext(StudentContext);