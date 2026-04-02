import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tasks`;

const getAuthHeaders = () => {
	const token = localStorage.getItem("token");
	return {
		headers: {
			Authorization: token ? `Bearer ${token}` : "",
		},
	};
};

// 1. Service pour creer une nouvelle tache
const createTask = async (taskData) => {
	// taskData doit contenir: title, description, status, priority, assignedTo, dueDate, projectId
	try {
		const response = await axios.post(API_URL, taskData, getAuthHeaders());
		// Le backend renvoie la tache creee avec les infos peuplees des utilisateurs
		return response.data; // La tache creee
	} catch (error) {
		throw error.response ? error.response.data : new Error("Erreur serveur lors de la creation de la tache.");
	}
};

// 2. Service pour recuperer les taches d'un projet
const getTasksByProject = async (projectId) => {
	try {
		// Appel GET a /api/tasks/project/:projectId
		const response = await axios.get(`${API_URL}/project/${projectId}`, getAuthHeaders());
		return response.data; // Tableau des taches du projet
	} catch (error) {
		throw error.response ? error.response.data : new Error("Erreur serveur lors de la recuperation des taches.");
	}
};

// D'autres services de gestion des taches peuvent etre ajoutes ici (mise a jour, suppression, etc.)
const updateTask = async (id, data) => {
	try {
		const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : new Error("Erreur lors de la mise a jour de la tache.");
	}
};

const deleteTask = async (id) => {
	try {
		const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : new Error("Erreur lors de la suppression de la tache.");
	}
};

const getStats = async () => {
	try {
		const response = await axios.get(`${API_URL}/stats`, getAuthHeaders());
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : new Error("Erreur lors de la recuperation des stats.");
	}
};

export default { createTask, getTasksByProject, updateTask, deleteTask, getStats };
