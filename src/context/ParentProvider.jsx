import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  getParentFullDashboard,
  switchActiveChild,
  getChildGrades,
  getChildAttendance,
  getParentCirculars,
} from "../services/parentAPIs";

const ParentContext = createContext();
const ACTIVE_CHILD_STORAGE_KEY = "parent_active_child_id";

export const ParentProvider = ({ children: appChildren }) => {
  const [parent, setParent]           = useState(null);
  const [students, setStudents]       = useState([]);
  const [activeChildId, setActiveChildId] = useState(null); // this is child.id (student UUID)
  const [lastUpdated, setLastUpdated] = useState(null);

  // Per-active-child data fetched separately
  const [attendanceData, setAttendanceData] = useState(null); // { summary, records[] }
  const [gradesData, setGradesData]         = useState(null); // { child, summary, exams[] }

  // School-wide data (not child-specific)
  const [circulars, setCirculars]           = useState([]);

  const [loading, setLoading]               = useState(true);
  const [childDataLoading, setChildDataLoading] = useState(false);
  const [error, setError]                   = useState(null);

  // ── Initial load: parent + all children + each child's dashboard + circulars ──
  useEffect(() => {
    const init = async () => {
      try {
        const [dashboardData, circularsList] = await Promise.allSettled([
          getParentFullDashboard(),
          getParentCirculars(),
        ]);

        if (dashboardData.status !== "fulfilled") {
          throw dashboardData.reason || new Error("Failed to load dashboard.");
        }

        const data = dashboardData.value;
        // data.children[] each has: id (student UUID), name, email, enrollment_number,
        // relationship, is_primary_contact, can_view_academics, can_pay_fees, dashboard{}
        const list = data.children || [];
        if (!list.length) throw new Error("No children mapped to this parent account.");

        setParent(data.parent || null);
        setStudents(list);
        setLastUpdated(data.last_updated || null);
        setCirculars(circularsList.status === "fulfilled" ? circularsList.value : []);

        const saved = localStorage.getItem(ACTIVE_CHILD_STORAGE_KEY);
        const savedStillValid = saved && list.some((c) => c.id === saved);
        const primary = list.find((c) => c.is_primary_contact);
        const initialId = savedStillValid ? saved : (primary?.id || list[0].id);
        setActiveChildId(initialId);
      } catch (err) {
        console.error("Failed to load parent dashboard", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Whenever active child changes, fetch their attendance + grades ──
  useEffect(() => {
    if (!activeChildId) return;
    let cancelled = false;

    const fetchChildData = async () => {
      setChildDataLoading(true);
      try {
        // Both calls in parallel
        const [attRes, gradesRes] = await Promise.allSettled([
          getChildAttendance(activeChildId),
          getChildGrades(activeChildId),
        ]);

        if (!cancelled) {
          // getChildAttendance returns: { child, summary, records[] }
          setAttendanceData(attRes.status === "fulfilled" ? attRes.value : null);
          // getChildGrades returns:    { child, summary, exams[] }
          setGradesData(gradesRes.status === "fulfilled" ? gradesRes.value : null);
        }
      } catch (err) {
        console.error("Failed to load child data", err);
      } finally {
        if (!cancelled) setChildDataLoading(false);
      }
    };

    fetchChildData();
    return () => { cancelled = true; };
  }, [activeChildId]);

  // ── Active child full object (from dashboard list) ──
  const activeChild = useMemo(
    () => students.find((c) => c.id === activeChildId) || null,
    [students, activeChildId]
  );

  // ── Switch child — instant UI flip, background sync ──
  const switchChild = useCallback(
    (childId) => {
      if (childId === activeChildId) return;
      setActiveChildId(childId);
      localStorage.setItem(ACTIVE_CHILD_STORAGE_KEY, childId);
      switchActiveChild(childId).catch((err) =>
        console.error("Failed to sync active child with server", err)
      );
    },
    [activeChildId]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getParentFullDashboard();
      setParent(data.parent || null);
      setStudents(data.children || []);
      setLastUpdated(data.last_updated || null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCirculars = useCallback(async () => {
    try {
      const list = await getParentCirculars();
      setCirculars(list);
    } catch (err) {
      console.error("Failed to refresh circulars", err);
    }
  }, []);

  // ── Derived convenience values ──
  // activeChild.dashboard shape:
  //   { class_info{ class, section, academic_year, roll_number },
  //     attendance{ total_days, present_days, attendance_percentage, status },
  //     recent_grades[{ subject, exam, marks, max_marks, percentage }],
  //     upcoming_assignments[], upcoming_exams[],
  //     overall_percentage, stats{ total_assignments, total_exams, total_grades } }

  const dashboard        = activeChild?.dashboard || null;

  // Attendance from the detailed /attendance/ endpoint (full records list)
  // attendanceData: { child, summary{ total_days, present, absent, late, ... }, records[] }
  const attendanceSummary = attendanceData?.summary  || null;
  const attendanceRecords = attendanceData?.records  || [];

  // Grades from the detailed /grades/ endpoint (exam-wise breakdown)
  // gradesData: { child, summary{ total_subjects, overall_percentage, total_exams }, exams[] }
  const gradesSummary    = gradesData?.summary || null;
  const gradesExams      = gradesData?.exams   || [];

  // Flatten exams → subject rows (same shape the old "grades" array used)
  const gradesFlat = useMemo(() => {
    return gradesExams.flatMap((exam) =>
      (exam.subjects || []).map((s) => ({
        subject:        s.subject_id,
        subject_name:   s.subject_name,
        exam_name:      exam.exam_name,
        exam_date:      exam.exam_date,
        marks_obtained: s.marks_obtained,
        max_marks:      s.max_marks,
        percentage:     s.percentage,
        remarks:        s.remarks,
      }))
    );
  }, [gradesExams]);

  // Enrollment info lives inside dashboard.class_info
  const enrollment = useMemo(() => {
    if (!dashboard?.class_info) return null;
    const ci = dashboard.class_info;
    return {
      class_level_name:   ci.class       || "",
      section_name:       ci.section     || "",
      academic_year_name: ci.academic_year || "",
      roll_number:        ci.roll_number || "",
    };
  }, [dashboard]);

  return (
    <ParentContext.Provider
      value={{
        // ── Parent ──
        parent,
        students,           // all children array
        activeChildId,
        activeChild,        // full child object incl. .dashboard
        lastUpdated,

        // ── Active child convenience ──
        dashboard,          // activeChild.dashboard bundle
        enrollment,         // derived from dashboard.class_info

        // ── Attendance (from /attendance/ endpoint) ──
        attendanceSummary,
        attendanceRecords,  // array of { date, status, remarks }

        // ── Grades (from /grades/ endpoint) ──
        gradesSummary,
        gradesExams,        // array of exam objects with .subjects[]
        gradesFlat,         // flat array of subject grade rows

        // ── Circulars (school-wide, not child-specific) ──
        circulars,
        refreshCirculars,

        // ── Loading / error ──
        loading,
        childDataLoading,
        error,

        // ── Actions ──
        switchChild,
        refresh,
      }}
    >
      {appChildren}
    </ParentContext.Provider>
  );
};

export const useParent = () => useContext(ParentContext);