/**
 * API Service - Centralized API endpoint management
 *
 * Configure your API base URL here:
 * - Development: http://localhost:8000
 * - Production: https://api.example.com
 */

// Get API base URL from environment or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

console.log("[API SERVICE] Initialized with base URL:", API_BASE_URL);

/**
 * Generic API fetch wrapper with error handling
 */
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log(`[API] ${options.method || "GET"} ${url}`);

  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      ...options,
      headers,
    });

    console.log(
      `[API RESPONSE] Status: ${response.status} ${response.statusText}`,
    );
    console.log(
      `[API RESPONSE] Content-Type: ${response.headers.get("content-type")}`,
    );

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(
        "[API ERROR] Response is not JSON:",
        text.substring(0, 300),
      );
      throw new Error(
        `API returned ${contentType} instead of JSON.\n` +
          `Status: ${response.status}\n` +
          `URL: ${url}\n` +
          `This usually means:\n` +
          `1. The endpoint doesn't exist\n` +
          `2. The API is not running\n` +
          `3. The base URL is incorrect (currently: ${API_BASE_URL})`,
      );
    }

    if (!response.ok) {
      if (response.status === 401) {
        console.error(
          "[API ERROR] Unauthorized. Token might be expired. Redirecting to login.",
        );
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }

      const errorData = await response.json();
      console.error("[API ERROR] Response error:", errorData);
      throw new Error(
        `API Error ${response.status}: ${errorData.detail || errorData.message || response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("[API SUCCESS] Response data:", data);
    return data;
  } catch (error) {
    console.error("[API EXCEPTION]", error.message);
    throw error;
  }
};

/**
 * Helper to fetch all pages of a paginated API response
 */
export const fetchAllPages = async (initialEndpoint) => {
  const response = await apiCall(initialEndpoint);
  if (response && response.results && response.next) {
    let allResults = [...response.results];
    let nextUrl = response.next;

    while (nextUrl) {
      const urlObj = new URL(nextUrl);
      const nextPath = urlObj.pathname + urlObj.search;
      const nextResponse = await apiCall(nextPath);
      if (nextResponse && nextResponse.results) {
        allResults = [...allResults, ...nextResponse.results];
        nextUrl = nextResponse.next;
      } else {
        break;
      }
    }
    return { ...response, results: allResults };
  }
  return response;
};

/**
 * Get the logged-in user's profile
 * GET /api/v1/profiles/me/
 *
 * Returns:
 * {
 *   "identity": { id, email, first_name, last_name, school_id },
 *   "roles": [],
 *   "is_superuser": false,
 *   "profiles": {
 *     "student": { exists, id },
 *     "teacher": { exists, id },
 *     "parent": { exists, id }
 *   }
 * }
 */
export const getMyProfile = () => apiCall("/api/v1/profiles/me/");

/**
 * Get teacher's assigned classes
 * GET /api/v1/academics/teacher-assignments/?teacher=<id>&status=current
 */
export const getTeacherClasses = (teacherId, status = "current") =>
  apiCall(
    `/api/v1/academics/teacher-assignments/?teacher=${teacherId}&status=${status}`,
  );

/**
 * Get a specific teacher assignment by ID
 * GET /api/v1/academics/teacher-assignments/<id>/
 */
export const getTeacherAssignment = (id) =>
  apiCall(`/api/v1/academics/teacher-assignments/${id}/`);

/**
 * Get students enrolled in a section
 * GET /api/v1/academics/enrollments/?section=<id>&academic_year=<id>
 */
export const getSectionEnrollments = (sectionId, academicYearId) => {
  let endpoint = "/api/v1/academics/enrollments/";
  const params = [];

  if (sectionId) params.push(`section=${sectionId}`);
  if (academicYearId) params.push(`academic_year=${academicYearId}`);

  if (params.length > 0) {
    endpoint += `?${params.join("&")}`;
  }

  return fetchAllPages(endpoint);
};

/**
 * Get individual student profile details
 * GET /api/v1/profiles/students/<id>/
 */
export const getStudentProfile = (studentId) =>
  apiCall(`/api/v1/profiles/students/${studentId}/`);

/**
 * Bulk record attendance
 * POST /api/v1/operations/attendance/bulk-record/
 */
export const bulkRecordAttendance = (payload) =>
  apiCall("/api/v1/operations/attendance/bulk-record/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

/**
 * Get attendance records
 * GET /api/v1/operations/attendance/
 */
export const getAttendanceRecords = (sectionId, academicYearId, date) => {
  let endpoint = "/api/v1/operations/attendance/";
  const params = [];

  if (sectionId) params.push(`section=${sectionId}`);
  if (academicYearId) params.push(`academic_year=${academicYearId}`);
  if (date) params.push(`date=${date}`);

  params.push("page_size=1000"); // Ensure we get all records

  if (params.length > 0) {
    endpoint += `?${params.join("&")}`;
  }

  return fetchAllPages(endpoint);
};

/**
 * Get grades
 * GET /api/v1/operations/grades/
 */
export const getGrades = (subjectId, examId) => {
  let endpoint = "/api/v1/operations/grades/";
  const params = new URLSearchParams();
  if (subjectId) params.append("subject", subjectId);
  if (examId) params.append("exam", examId);
  
  const query = params.toString();
  if (query) {
    endpoint += `?${query}`;
  }
  return fetchAllPages(endpoint);
};

/**
 * Update grade
 * PATCH /api/v1/operations/grades/{id}/
 */
export const updateGrade = (id, data) => 
  apiCall(`/api/v1/operations/grades/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

/**
 * Bulk submit grades
 * POST /api/v1/operations/grades/bulk-submit/
 */
export const bulkSubmitGrades = (data) =>
  apiCall("/api/v1/operations/grades/bulk-submit/", {
    method: "POST",
    body: JSON.stringify(data),
  });

/**
 * Get all exams
 * GET /api/v1/operations/exams/
 */
export const getExams = () => fetchAllPages("/api/v1/operations/exams/");

/**
 * Get a specific exam by ID
 * GET /api/v1/operations/exams/<id>/
 */
export const getExam = (id) => apiCall(`/api/v1/operations/exams/${id}/`);

export default {
  getMyProfile,
  getTeacherClasses,
  getTeacherAssignment,
  getSectionEnrollments,
  getStudentProfile,
  bulkRecordAttendance,
  getAttendanceRecords,
  getGrades,
  updateGrade,
  bulkSubmitGrades,
  getExam,
  getExams,
  API_BASE_URL,
};
