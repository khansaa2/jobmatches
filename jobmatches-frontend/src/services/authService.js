import axios from 'axios';

const API_URL = 'http://localhost:8081/api/auth';

const register = async (username, email, password, role) => {
    const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password,
        role
    });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, {
        username,
        password
    });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
};

export default authService; 