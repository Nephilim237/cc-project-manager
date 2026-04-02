import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // a changer en prod
    withCredentials: true
});

// Intercepteur pour ajouter le token a chaqie requet
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default API;