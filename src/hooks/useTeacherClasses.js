import { useMemo } from "react";
import { getMyTeacherAssignments } from "../services/api";
import { useStaleData } from "./useStaleData";

/**
 * Returns the unique class-level names (strings) for the currently logged-in
 * teacher's active assignments, sorted numerically.
 *
 * Reuses the same cache key as MyClassesHub/Dashboard so no extra network
 * request is made if those pages have already been visited.
 *
 * @returns {{ teacherClasses: string[], loading: boolean }}
 */
export function useTeacherClasses() {
  const { data: assignmentsPayload, loading } = useStaleData(
    "teacher:my-assignments",
    () => getMyTeacherAssignments({ status: "current" }),
  );

  const teacherClasses = useMemo(() => {
    const list = Array.isArray(assignmentsPayload)
      ? assignmentsPayload
      : assignmentsPayload?.results ?? [];

    const seen = new Set();
    const classNames = [];

    list.forEach((assignment) => {
      // class_level.name comes back as e.g. "Grade 10" or "10"
      // The curriculum RAG stores classes as plain numbers like "10"
      // so we strip the common "Grade " / "Class " / "Std " prefixes.
      const raw = String(assignment.class_level?.name || "").trim();
      const normalized = raw.replace(/^(grade|class|standard|std)\s*/i, "").trim();
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        classNames.push(normalized);
      }
    });

    return classNames.sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [assignmentsPayload]);

  return { teacherClasses, loading };
}
