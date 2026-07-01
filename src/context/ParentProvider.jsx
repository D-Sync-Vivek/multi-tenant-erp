// src/context/ParentProvider.jsx
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

// ─── MOCK DATA (static, outside component) ────────────────────────────────
const MOCK_CHILDREN = [
  {
    id: "mock-child-1",
    name: "Alex Johnson",
    email: "alex@example.com",
    enrollment_number: "ENR-2026-001",
    relationship: "Father",
    is_primary_contact: true,
    can_view_academics: true,
    can_pay_fees: true,
    // ✅ NEW: current_class with IDs for timetable
    current_class: {
      section_id: "mock-section-uuid-1",
      academic_year_id: "mock-academic-year-uuid-1",
      class: "Grade 10",
      section: "A",
      academic_year: "2026-2027",
      roll_number: "10A-01",
    },
    dashboard: {
      class_info: { class: "Grade 10", section: "A", academic_year: "2026-2027", roll_number: "10A-01" },
      attendance: { total_days: 100, present_days: 85, attendance_percentage: 85, status: "Good" },
      recent_grades: [
        { subject: "Mathematics", exam: "Mid Term", marks: 85, max_marks: 100, percentage: 85 },
      ],
      upcoming_assignments: [],
      upcoming_exams: [],
      overall_percentage: 85,
      stats: { total_assignments: 5, total_exams: 3, total_grades: 5 },
    }
  }
];

const MOCK_PARENT = {
  user: { first_name: "John", last_name: "Johnson", email: "parent@example.com" },
  phone_number: "1234567890"
};

const MOCK_ATTENDANCE_DATA = {
  summary: { total_days: 100, present: 85, absent: 10, late: 5, attendance_percentage: 85 },
  records: Array.from({ length: 30 }).map((_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    status: i % 7 === 0 ? "Absent" : i % 5 === 0 ? "Late" : "Present",
    remarks: ""
  }))
};

const MOCK_GRADES_DATA = {
  summary: { total_subjects: 5, overall_percentage: 85, total_exams: 3 },
  exams: [
    {
      exam_name: "Mid Term",
      exam_date: "2026-05-15",
      subjects: [
        { subject_name: "Mathematics", marks_obtained: 85, max_marks: 100, percentage: 85, remarks: "Good" },
        { subject_name: "Science", marks_obtained: 90, max_marks: 100, percentage: 90, remarks: "Excellent" },
      ]
    }
  ]
};
// ────────────────────────────────────────────────────────────────────────────

export const ParentProvider = ({ children: appChildren }) => {
  const [parent, setParent] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [gradesData, setGradesData] = useState(null);
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [childDataLoading, setChildDataLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Initial load: parent + children + circulars ──
  useEffect(() => {
    const init = async () => {
      try {
        const [dashboardRes, circularsRes] = await Promise.allSettled([
          getParentFullDashboard(),
          getParentCirculars(),
        ]);

        if (dashboardRes.status !== "fulfilled") throw dashboardRes.reason;
        const data = dashboardRes.value;
        const list = data.children || [];
        if (!list.length) throw new Error("No children mapped to this parent account.");

        setParent(data.parent || null);
        setStudents(list);
        setLastUpdated(data.last_updated || null);
        setCirculars(
          circularsRes.status === "fulfilled" ? (circularsRes.value || []) : []
        );

        const saved = localStorage.getItem(ACTIVE_CHILD_STORAGE_KEY);
        const savedStillValid = saved && list.some((c) => c.id === saved);
        const primary = list.find((c) => c.is_primary_contact);
        const initialId = savedStillValid ? saved : (primary?.id || list[0].id);
        setActiveChildId(initialId);
      } catch (err) {
        console.error("Failed to load parent dashboard, falling back to mock data", err);
        setParent(MOCK_PARENT);
        setStudents(MOCK_CHILDREN);
        setActiveChildId(MOCK_CHILDREN[0].id);
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Fetch attendance & grades for active child ──
  useEffect(() => {
    if (!activeChildId) return;
    let cancelled = false;

    const fetchChildData = async () => {
      setChildDataLoading(true);
      try {
        const [attRes, gradesRes] = await Promise.allSettled([
          getChildAttendance(activeChildId),
          getChildGrades(activeChildId),
        ]);

        if (!cancelled) {
          if (attRes.status === "fulfilled" && attRes.value) {
            setAttendanceData(attRes.value);
          } else {
            throw new Error("Failed to fetch attendance");
          }
          if (gradesRes.status === "fulfilled" && gradesRes.value) {
            setGradesData(gradesRes.value);
          } else {
            throw new Error("Failed to fetch grades");
          }
        }
      } catch (err) {
        console.error("Failed to load child data, falling back to mock data", err);
        if (!cancelled) {
          setAttendanceData(MOCK_ATTENDANCE_DATA);
          setGradesData(MOCK_GRADES_DATA);
        }
      } finally {
        if (!cancelled) setChildDataLoading(false);
      }
    };

    fetchChildData();
    return () => { cancelled = true; };
  }, [activeChildId]);

  // ── Active child ──
  const activeChild = useMemo(
    () => students.find((c) => c.id === activeChildId) || null,
    [students, activeChildId]
  );

  // ── Switch child ──
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

  // ── Derived values ──
  const dashboard = activeChild?.dashboard || null;

  const attendanceSummary = attendanceData?.summary || null;
  const attendanceRecords = attendanceData?.records || [];

  const gradesExams = useMemo(
    () => gradesData?.exams || [],
    [gradesData]
  );
  const gradesSummary = gradesData?.summary || null;

  const gradesFlat = useMemo(() => {
    return gradesExams.flatMap((exam) =>
      (exam.subjects || []).map((s) => ({
        subject: s.subject_id,
        subject_name: s.subject_name,
        exam_name: exam.exam_name,
        exam_date: exam.exam_date,
        marks_obtained: s.marks_obtained,
        max_marks: s.max_marks,
        percentage: s.percentage,
        remarks: s.remarks,
      }))
    );
  }, [gradesExams]);

  // ✅ UPDATED enrollment – now includes section_id and academic_year_id
  const enrollment = useMemo(() => {
    if (!activeChild) return null;

    // Prefer current_class (with IDs) if present, otherwise fallback to dashboard.class_info
    const cc = activeChild.current_class || {};
    const ci = dashboard?.class_info || {};

    return {
      class_level_name: cc.class || ci.class || "",
      section_name: cc.section || ci.section || "",
      academic_year_name: cc.academic_year || ci.academic_year || "",
      roll_number: cc.roll_number || ci.roll_number || "",
      section_id: cc.section_id || null,           // ✅ for timetable
      academic_year_id: cc.academic_year_id || null, // ✅ for timetable
    };
  }, [activeChild, dashboard]);

  return (
    <ParentContext.Provider
      value={{
        parent,
        students,
        activeChildId,
        activeChild,
        lastUpdated,
        dashboard,
        enrollment,
        attendanceSummary,
        attendanceRecords,
        gradesSummary,
        gradesExams,
        gradesFlat,
        circulars,
        refreshCirculars,
        loading,
        childDataLoading,
        error,
        switchChild,
        refresh,
      }}
    >
      {appChildren}
    </ParentContext.Provider>
  );
};

export const useParent = () => useContext(ParentContext);