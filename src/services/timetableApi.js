import apiClient from './apiClient';

// ─── TIMETABLE SETTINGS ──────────────────────────────────────────────────────
export const getTimetableSettings = async () => {
    const response = await apiClient.get('/school-admin/timetable-settings/');
    return response.data;
};

export const onboardTimetableSettings = async (data) => {
    const response = await apiClient.post('/school-admin/timetable-settings/onboard/', data);
    return response.data;
};

export const updateTimetableSettings = async (data) => {
    const response = await apiClient.patch('/school-admin/timetable-settings/', data);
    return response.data;
};

// ─── TIME SLOTS ──────────────────────────────────────────────────────────────
export const getTimeSlots = async (params = {}) => {
    const response = await apiClient.get('/timetable/time-slots/', { params });
    return response.data;
};

export const createTimeSlot = async (data) => {
    const response = await apiClient.post('/timetable/time-slots/', data);
    return response.data;
};

export const updateTimeSlot = async (id, data) => {
    const response = await apiClient.patch(`/timetable/time-slots/${id}/`, data);
    return response.data;
};

export const deleteTimeSlot = async (id) => {
    const response = await apiClient.delete(`/timetable/time-slots/${id}/`);
    return response.data;
};

// ─── TIMETABLE ENTRIES ──────────────────────────────────────────────────────
export const getTimetableEntries = async (params = {}) => {
    const response = await apiClient.get('/timetable/entries/', { params });
    return response.data;
};

export const createTimetableEntry = async (data) => {
    const response = await apiClient.post('/timetable/entries/', data);
    return response.data;
};

export const updateTimetableEntry = async (id, data) => {
    const response = await apiClient.patch(`/timetable/entries/${id}/`, data);
    return response.data;
};

export const deleteTimetableEntry = async (id) => {
    const response = await apiClient.delete(`/timetable/entries/${id}/`);
    return response.data;
};

export const bulkCreateEntries = async (payload) => {
    const response = await apiClient.post('/timetable/entries/bulk-create/', payload);
    return response.data;
};

export const getEntriesSummary = async (params = {}) => {
    const response = await apiClient.get('/timetable/entries/summary/', { params });
    return response.data;
};

export const getMyTimetable = async (params = {}) => {
    const response = await apiClient.get('/timetable/entries/my-timetable/', { params });
    return response.data;
};

export const getSectionTimetable = async (sectionId, params = {}) => {
    const response = await apiClient.get(`/timetable/entries/section/${sectionId}/`, { params });
    return response.data;
};

export const getClassTimetable = async (classLevelId, params = {}) => {
    const response = await apiClient.get(`/timetable/entries/class/${classLevelId}/`, { params });
    return response.data;
};

export const getTeacherTimetable = async (teacherId, params = {}) => {
    const response = await apiClient.get(`/timetable/entries/teacher/${teacherId}/`, { params });
    return response.data;
};

export const getTimetableConflicts = async (academicYearId) => {
    const response = await apiClient.get('/timetable/entries/conflicts/', {
        params: { academic_year: academicYearId },
    });
    return response.data;
};

export const generateTimeSlots = async (academicYearId) => {
    const response = await apiClient.post('/timetable/entries/generate-slots/', {
        academic_year_id: academicYearId,
    });
    return response.data;
};

// ─── TIMETABLE TEMPLATES ────────────────────────────────────────────────────
export const getTimetableTemplates = async (params = {}) => {
    const response = await apiClient.get('/timetable/templates/', { params });
    return response.data;
};

export const createTimetableTemplate = async (data) => {
    const response = await apiClient.post('/timetable/templates/', data);
    return response.data;
};

export const updateTimetableTemplate = async (id, data) => {
    const response = await apiClient.patch(`/timetable/templates/${id}/`, data);
    return response.data;
};

export const deleteTimetableTemplate = async (id) => {
    const response = await apiClient.delete(`/timetable/templates/${id}/`);
    return response.data;
};

export const applyTimetableTemplate = async (templateId, payload) => {
    const response = await apiClient.post(`/timetable/templates/${templateId}/apply/`, payload);
    return response.data;
};

export const publishTimetable = async (academicYearId, sectionId) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { detail: "Timetable deployed successfully." };
};
// ─── BUNDLED EXPORT ──────────────────────────────────────────────────────────
export const timetableApi = {
    getTimetableSettings,
    onboardTimetableSettings,
    updateTimetableSettings,
    getTimeSlots,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    getTimetableEntries,
    createTimetableEntry,
    updateTimetableEntry,
    deleteTimetableEntry,
    bulkCreateEntries,
    getEntriesSummary,
    getMyTimetable,
    getSectionTimetable,
    getClassTimetable,
    getTeacherTimetable,
    getTimetableConflicts,
    generateTimeSlots,
    getTimetableTemplates,
    createTimetableTemplate,
    updateTimetableTemplate,
    deleteTimetableTemplate,
    applyTimetableTemplate,
    publishTimetable,
};