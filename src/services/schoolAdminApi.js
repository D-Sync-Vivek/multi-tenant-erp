import apiClient from './apiClient';

// --- Dashboard & General ---
export const getDashboardStats = async () => {
    const response = await apiClient.get('/school-admin/dashboard/stats/');
    return response.data;
};

export const getEnrollmentTrends = async () => {
    const response = await apiClient.get('/school-admin/dashboard/trends/');
    return response.data;
};

export const getNotifications = async () => {
    const response = await apiClient.get('/school-admin/notifications/');
    return response.data;
};

export const getRecentActivity = async () => {
    const response = await apiClient.get('/school-admin/logs/');
    return response.data;
};

// --- Academic Years ---
export const getAcademicYearDetails = async (id) => {
    const response = await apiClient.get(`/academics/academic-years/${id}/`);
    return response.data;
};

export const createAcademicYear = async (data) => {
    const response = await apiClient.post('/academics/academic-years/', data);
    return response.data;
};

export const updateAcademicYear = async (id, data) => {
    const response = await apiClient.patch(`/academics/academic-years/${id}/`, data);
    return response.data;
};

export const deleteAcademicYear = async (id) => {
    const response = await apiClient.delete(`/academics/academic-years/${id}/`);
    return response.data;
};

// --- Roles & Permissions ---
export const getRoles = async () => {
    const response = await apiClient.get('/accounts/roles/');
    return response.data;
};

export const getRoleDetails = async (id) => {
    const response = await apiClient.get(`/accounts/roles/${id}/`);
    return response.data;
};

export const createRole = async (data) => {
    const response = await apiClient.post('/accounts/roles/', data);
    return response.data;
};

export const updateRole = async (id, data) => {
    const response = await apiClient.patch(`/accounts/roles/${id}/`, data);
    return response.data;
};

export const deleteRole = async (id) => {
    const response = await apiClient.delete(`/accounts/roles/${id}/`);
    return response.data;
};

export const getPermissions = async () => {
    const response = await apiClient.get('/accounts/permissions/');
    return response.data;
};

// --- Profiles & Academics ---
export const createClassLevel = async (data) => {
    const response = await apiClient.post('/academics/class-levels/', data);
    return response.data;
};

// --- AddStudent Service Methods ---
export const createUser = async (data) => {
    const response = await apiClient.post('/users/', data);
    return response.data;
};

export const createStudentProfile = async (data) => {
    const response = await apiClient.post('/profiles/students/', data);
    return response.data;
};

export const registerStudent = async (data) => {
    const response = await apiClient.post('/profiles/students/register/', data);
    return response.data;
};

export const createTeacherProfile = async (data) => {
    const response = await apiClient.post('/profiles/teachers/', data);
    return response.data;
};

export const createParentProfile = async (data) => {
    const response = await apiClient.post('/profiles/parents/', data);
    return response.data;
};

export const createMapping = async (data) => {
    const response = await apiClient.post('/profiles/parent-student-mappings/', data);
    return response.data;
};

export const getSubjects = async () => {
    const response = await apiClient.get('/academics/subjects/');
    return response.data;
};

export const getClassLevels = async () => {
    const response = await apiClient.get('/academics/class-levels/');
    return response.data;
};

export const getSections = async () => {
    const response = await apiClient.get('/academics/sections/');
    return response.data;
};

export const createTeacherAssignment = async (data) => {
    const response = await apiClient.post('/academics/teacher-assignments/', data);
    return response.data;
};

export const getParentDetails = async (id) => {
    const response = await apiClient.get(`/profiles/parents/${id}/`);
    return response.data;
};

export const updateStudent = async (id, data) => {
    const response = await apiClient.patch(`/profiles/students/${id}/`, data);
    return response.data;
};

export const getStudentById = async (id) => {
    const response = await apiClient.get(`/profiles/students/${id}/`);
    return response.data;
};

export const getTeacherById = async (id) => {
    const response = await apiClient.get(`/profiles/teachers/${id}/`);
    return response.data;
};

export const updateTeacher = async (id, data) => {
    const response = await apiClient.patch(`/profiles/teachers/${id}/`, data);
    return response.data;
};

export const getMappingById = async (id) => {
    const response = await apiClient.get(`/profiles/parent-student-mappings/${id}/`);
    return response.data;
};

export const getTeacherAssignmentById = async (id) => {
    const response = await apiClient.get(`/academics/teacher-assignments/${id}/`);
    return response.data;
};

export const updateTeacherAssignment = async (id, data) => {
    const response = await apiClient.patch(`/academics/teacher-assignments/${id}/`, data);
    return response.data;
};

export const deleteTeacherAssignment = async (id) => {
    const response = await apiClient.delete(`/academics/teacher-assignments/${id}/`);
    return response.data;
};

export const createSection = async (data) => {
    const response = await apiClient.post('/academics/sections/', data);
    return response.data;
};

export const getSettings = async () => {
    const response = await apiClient.get('/school-admin/settings/');
    return response.data;
};

export const updateSettings = async (data) => {
    const response = await apiClient.patch('/school-admin/settings/', data);
    return response.data;
};

// --- Paginated List Methods ---
export const getStudents = async (page = 1) => {
    const response = await apiClient.get(`/profiles/students/?page=${page}`);
    return response.data;
};

export const getTeachers = async (page = 1) => {
    const response = await apiClient.get(`/profiles/teachers/?page=${page}`);
    return response.data;
};

export const getParents = async (page = 1) => {
    const response = await apiClient.get(`/profiles/parents/?page=${page}`);
    return response.data;
};

export const getParentStudentMappings = async (page = 1) => {
    const response = await apiClient.get(`/profiles/parent-student-mappings/?page=${page}`);
    return response.data;
};

export const getTeacherAssignments = async (page = 1) => {
    const response = await apiClient.get(`/academics/teacher-assignments/?page=${page}`);
    return response.data;
};

export const getAcademicYears = async (page = 1) => {
    const response = await apiClient.get(`/academics/academic-years/?page=${page}`);
    return response.data;
};

// --- Bundled Export ---
export const schoolAdminApi = {
    getDashboardStats,
    getEnrollmentTrends,
    getNotifications,
    getRecentActivity,
    getAcademicYears,
    getAcademicYearDetails,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    getStudents,
    getTeachers,
    getParents,
    getParentStudentMappings,
    getTeacherAssignments,
    createClassLevel,
    getRoles,
    getRoleDetails,
    createRole,
    updateRole,
    deleteRole,
    getPermissions,
    createUser,
    createStudentProfile,
    registerStudent,
    createTeacherProfile,
    createParentProfile,
    createMapping,
    getSubjects,
    getClassLevels,
    getSections,
    createTeacherAssignment,
    getParentDetails,
    updateStudent,
    getStudentById,
    getTeacherById,  
    updateTeacher,
    getMappingById,
    getTeacherAssignmentById,
    updateTeacherAssignment,
    deleteTeacherAssignment,
    createSection,
    getSettings,
    updateSettings
};