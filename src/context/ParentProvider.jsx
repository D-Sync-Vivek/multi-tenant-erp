import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getParentStudentMappings,
  getStudentProfile,
  getParentDashboardData,
  getStudentEnrollment,
  getAcademicYear,
  getStudentAttendanceRecords,
} from "../services/parentAPIs";

const ParentContext = createContext();

export const ParentProvider = ({ children }) => {
  const [contextData, setContextData] = useState({
    mapping: null,           // the raw parent-student-mapping record (relationship, permissions, etc.)
    student: null,           // student_id (uuid)
    profile: null,           // student profile
    dashboard: null,         // { attendance, grades, exams }
    enrollment: null,        // current class/section
    academic: { years: [], subs: [] },
    attendanceRecords: [],
    children: [],            // full list of mapped children (in case parent has >1 kid)
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadForStudent = useCallback(async (studentId, mappingRecord) => {
    try {
      const [profile, dashboard, enrollment, academic, attendanceRecords] = await Promise.all([
        getStudentProfile(studentId),
        getParentDashboardData(studentId),
        getStudentEnrollment(studentId),
        getAcademicYear(),
        getStudentAttendanceRecords(studentId),
      ]);

      setContextData((prev) => ({
        ...prev,
        mapping: mappingRecord,
        student: studentId,
        profile,
        dashboard,
        enrollment,
        academic,
        attendanceRecords,
      }));
    } catch (err) {
      console.error("Failed to load student data for parent", err);
      setError(err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const mappings = await getParentStudentMappings();

        if (!mappings || mappings.length === 0) {
          throw new Error("No children mapped to this parent account.");
        }

        // Support multiple children: store full list, default to the first one.
        setContextData((prev) => ({ ...prev, children: mappings }));

        const primary = mappings.find((m) => m.is_primary_contact) || mappings[0];
        await loadForStudent(primary.student, primary);
      } catch (err) {
        console.error("Failed to load parent-student mapping", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadForStudent]);

  // Allows a "child switcher" UI to call this when parent has multiple kids
  const switchChild = useCallback(async (studentId) => {
    setLoading(true);
    const mappingRecord = contextData.children.find((m) => m.student === studentId) || null;
    await loadForStudent(studentId, mappingRecord);
    setLoading(false);
  }, [contextData.children, loadForStudent]);

  return (
    <ParentContext.Provider value={{ ...contextData, loading, error, switchChild }}>
      {children}
    </ParentContext.Provider>
  );
};

export const useParent = () => useContext(ParentContext);