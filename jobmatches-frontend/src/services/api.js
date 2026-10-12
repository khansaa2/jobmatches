import axios from 'axios';

const API_URL = 'http://localhost:8081/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/authenticate', credentials);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export default api; 