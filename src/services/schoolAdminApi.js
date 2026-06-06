import apiClient from './apiClient';

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

// --- Add this new function ---
export const getRecentActivity = async () => {
    const response = await apiClient.get('/school-admin/logs/');
    return response.data; // DRF ListAPIView returns { count, next, previous, results: [...] }
};