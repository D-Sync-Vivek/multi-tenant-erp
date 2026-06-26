import { useState, useEffect, useMemo } from "react";
import { getCurriculumHierarchy } from "../services/api";
// Module-level cache to share fetched curriculum data between different workspaces
let cachedData = null;
let cachedPromise = null;

/**
 * Optional allowedClasses: string[] — when provided, only class names present in
 * this list will appear in the class dropdown. Subjects and chapters cascade
 * correctly from the filtered set. This is used to restrict the picker to the
 * teacher's own assigned classes.
 */
export const useCurriculumData = (
  initialClass = "",
  initialSubject = "",
  initialChapter = "",
  { allowedClasses } = {},
) => {
  const [rawData, setRawData] = useState(cachedData || []);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState(null);
  // Active selections
  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  // Fetch hierarchy data from RAG service
  const fetchData = async (force = false) => {
    if (cachedData && !force) {
      setRawData(cachedData);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (!cachedPromise || force) {
        cachedPromise = getCurriculumHierarchy();
      }
      const response = await cachedPromise;
      const data = response.data || [];
      cachedData = data;
      setRawData(data);
    } catch (err) {
      console.error(
        "[useCurriculumData] Failed to fetch curriculum hierarchy:",
        err,
      );
      setError(err.message || "Failed to load curriculum data");
      cachedPromise = null; // Reset cache promise on error to allow retries
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const refetch = () => {
    fetchData(true);
  };
  // 1. Classes: Unique classes sorted numerically, optionally restricted to teacher's own classes
  const classes = useMemo(() => {
    const uniqueClasses = Array.from(
      new Set(rawData.map((item) => item.class)),
    );
    const filtered = allowedClasses && allowedClasses.length > 0
      ? uniqueClasses.filter((cls) => allowedClasses.includes(cls))
      : uniqueClasses;
    return filtered.sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b);
    });
  }, [rawData, allowedClasses]);
  // 2. Subjects available for the selected class, sorted alphabetically
  const subjects = useMemo(() => {
    if (!selectedClass) return [];
    const filtered = rawData.filter((item) => item.class === selectedClass);
    const uniqueSubjects = Array.from(
      new Set(filtered.map((item) => item.subject)),
    );
    return uniqueSubjects.sort((a, b) => a.localeCompare(b));
  }, [rawData, selectedClass]);
  // Helper for sorting chapters numerically by their prefix
  const sortChapters = (chaptersList) => {
    return [...chaptersList].sort((a, b) => {
      const matchA = a.match(/^\s*(\d+)/);
      const matchB = b.match(/^\s*(\d+)/);
      if (matchA && matchB) {
        const numA = parseInt(matchA[1], 10);
        const numB = parseInt(matchB[1], 10);
        if (numA !== numB) {
          return numA - numB;
        }
      } else if (matchA) {
        return -1;
      } else if (matchB) {
        return 1;
      }
      return a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  };
  // 3. Chapters available for the selected class and subject
  const chapters = useMemo(() => {
    if (!selectedClass || !selectedSubject) return [];
    const match = rawData.find(
      (item) =>
        item.class === selectedClass && item.subject === selectedSubject,
    );
    return match ? sortChapters(match.chapters) : [];
  }, [rawData, selectedClass, selectedSubject]);
  // Cascading setters (called on manual user action in UI)
  const changeClass = (newClass) => {
    setSelectedClass(newClass);
    setSelectedSubject("");
    setSelectedChapter("");
  };
  const changeSubject = (newSubject) => {
    setSelectedSubject(newSubject);
    setSelectedChapter("");
  };
  // Backward compatibility: If loaded value is missing from the database, append it dynamically to the options
  const displayedClasses = useMemo(() => {
    if (selectedClass && !classes.includes(selectedClass)) {
      return [...classes, selectedClass].sort((a, b) => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
      });
    }
    return classes;
  }, [classes, selectedClass]);
  const displayedSubjects = useMemo(() => {
    if (selectedSubject && !subjects.includes(selectedSubject)) {
      return [...subjects, selectedSubject].sort((a, b) => a.localeCompare(b));
    }
    return subjects;
  }, [subjects, selectedSubject]);
  const displayedChapters = useMemo(() => {
    if (selectedChapter && !chapters.includes(selectedChapter)) {
      return [selectedChapter, ...chapters]; // Keep the missing chapter visible at the top
    }
    return chapters;
  }, [chapters, selectedChapter]);
  // Check if loaded saved content parameters are missing from the current RAG database
  const hasSavedContentMissing = useMemo(() => {
    if (loading || rawData.length === 0) return false;
    if (!selectedClass || !selectedSubject || !selectedChapter) return false;
    const matchClassSubject = rawData.find(
      (item) =>
        item.class === selectedClass && item.subject === selectedSubject,
    );
    if (!matchClassSubject) return true;
    return !matchClassSubject.chapters.includes(selectedChapter);
  }, [rawData, loading, selectedClass, selectedSubject, selectedChapter]);
  return {
    rawData,
    loading,
    error,
    classes: displayedClasses,
    subjects: displayedSubjects,
    chapters: displayedChapters,
    selectedClass,
    setSelectedClass,
    selectedSubject,
    setSelectedSubject,
    selectedChapter,
    setSelectedChapter,
    changeClass,
    changeSubject,
    hasSavedContentMissing,
    refetch,
  };
};
