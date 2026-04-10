import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/messages`;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
        },
    };
};

const getMessages = async (projectId) => {
    try {
        const response = await axios.get(`${API_URL}/${projectId}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Erreur lors de la récupération des messages.");
    }
};

export default { getMessages };