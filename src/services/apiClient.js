import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercept requests to attach the JWT token
apiClient.interceptors.request.use(
    (config) => {
        // TEMPORARY FALLBACK: Paste your long access token from Swagger here.
        // Once the auth developer merges their branch, they will store the token in localStorage.
        const mockSwaggerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgwNDAzMjE3LCJpYXQiOjE3ODAzOTk2MTcsImp0aSI6ImFmNTEyYjUyYTJkMjQ5NDI4MTYzOGYwOWU2Y2EyMDkwIiwidXNlcl9pZCI6ImU0ZDQ1YjQ4LTk2YTEtNGZmYi1iZjc0LTQ0MGUwOTE5M2U2MyJ9.ZBc-WOGkRe5cNA2Ga9bl0RfFYPlOPDbEm-sZHKRcgTo"; 
        
        const token = localStorage.getItem('access_token') || mockSwaggerToken;
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;