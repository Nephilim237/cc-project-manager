import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/projects`;

// Fonction utilisataire pour recuperer le JWT depuis le localstorage
const getAuthHeaders = () => {
	const token = localStorage.getItem("token");
	return {
		headers: {
			// Le format Standard pour l'autorisation par token est "Bearer <token>"
			Authorization: token ? `Bearer ${token}` : "",
		},
	};
};

// --------------------------------------------------
// 1. Creer un projet (CREATE FRONT)
// ---------------------------------------------------
const createProject = async (projectData) => {
	try {
		// On post un projet depuis notre service front qui l'enverra pour creation au serveur. On va ensuite recuperer un ensemble d'informations qu'on va stoker dans response
		const response = await axios.post(API_URL, projectData, getAuthHeaders());

		// response.data contient le nouveau projet cree par le serveur, on va retourner cela
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || "Erreur lors de la creation du projet.");
	}
};

// ---------------------------------------------------------
// 2. Recuperation de tous les projets (PARTIE FRONT)
// -----------------------------------------------------------
const getProjects = async () => {
	try {
		// Requete GET vers api/projects
		const response = await axios.get(API_URL, getAuthHeaders());

		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || "Erreur lors de la Recuperation des projets.");
	}
};

const updateProject = async (id, data) => {
	try {
		const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || "Erreur lors de la mise a jour du projet");
	}
};

const deleteProject = async (id) => {
	try {
		const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || "Erreur lors de la suppression du projet");
	}
};

const addMember = async (projectId, userId) => {
	try {
		const response = await axios.post(`${API_URL}/${projectId}/members`, { userId }, getAuthHeaders());
		return response.data;
	} catch(error) {
		throw new Error(error.response?.data?.message || "Errur lors de l'ajout du membre sur le projet.");
	}
};

export default { createProject, getProjects, updateProject, deleteProject, addMember };
