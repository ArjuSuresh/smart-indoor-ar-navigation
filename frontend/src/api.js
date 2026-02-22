import axios from 'axios';

// Create an Axios instance with base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor for logging (optional, helpful for debugging)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response || error.message);
        return Promise.reject(error);
    }
);

export const endpoints = {
    navigate: '/navigate',
    crowdUpdate: '/crowd/update',
    crowdStatus: '/crowd/status',
    qr: (id) => `/qr/${id}`,
};

export default api;
