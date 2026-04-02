import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users`;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : ""
        },
    };
};

const getUsers = async() => {
    try {
        const response = await axios.get(API_URL, getAuthHeaders());
        return response.data;
    }catch(error) {
        throw new Error(error.response?.data?.message || "Errur lors de la recuperation des utilisateurs.");
    }
};

export default { getUsers };