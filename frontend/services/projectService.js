import axios from "axios";
import cacheService from "./cacheService.js";
import offlineQueueService from "./offlineQueueService.js";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/projects`;

const getAuthHeaders = () => {
	const token = localStorage.getItem("token");
	return {
		headers: {
			Authorization: token ? `Bearer ${token}` : "",
		},
	};
};

const tmpId = (prefix = "tmp_project") => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const getProjects = async () => {
	if (!navigator.onLine) return cacheService.getProjects();

	try {
		const response = await axios.get(API_URL, getAuthHeaders());
		cacheService.saveProjects(response.data || []);
		return response.data;
	} catch (error) {
		const cached = cacheService.getProjects();
		if (cached.length) return cached;
		throw new Error(error.response?.data?.message || "Erreur lors de la récupération des projets.");
	}
};

const createProject = async (projectData) => {
	if (!navigator.onLine) {
		const user = JSON.parse(localStorage.getItem("user") || "null");
		const tempProject = {
			_id: tmpId(),
			title: projectData.title,
			description: projectData.description || "",
			dueDate: projectData.dueDate || null,
			status: projectData.status || "Active",
			owner: user || { _id: "local_user", name: "Vous", email: "" },
			members: projectData.members || [],
			createdAt: new Date().toISOString(),
			_pending: true,
		};

		const projects = cacheService.getProjects();
		cacheService.saveProjects([tempProject, ...projects]);

		offlineQueueService.enqueue({
			entity: "project",
			op: "create",
			tempId: tempProject._id,
			payload: projectData,
		});

		return tempProject;
	}

	const response = await axios.post(API_URL, projectData, getAuthHeaders());
	const projects = cacheService.getProjects();
	cacheService.saveProjects([response.data, ...projects.filter((p) => p._id !== response.data._id)]);
	return response.data;
};

const updateProject = async (id, data) => {
	// Optimistic cache update
	const projects = cacheService.getProjects();
	const updatedLocal = projects.map((p) => (p._id === id ? { ...p, ...data, _pending: !navigator.onLine } : p));
	cacheService.saveProjects(updatedLocal);

	if (!navigator.onLine) {
		offlineQueueService.enqueue({
			entity: "project",
			op: "update",
			id,
			payload: data,
		});
		return updatedLocal.find((p) => p._id === id);
	}

	const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
	const merged = cacheService.getProjects().map((p) => (p._id === id ? { ...response.data, _pending: false } : p));
	cacheService.saveProjects(merged);
	return response.data;
};

const deleteProject = async (id) => {
	// Optimistic cache delete
	const projects = cacheService.getProjects().filter((p) => p._id !== id);
	cacheService.saveProjects(projects);

	if (!navigator.onLine) {
		offlineQueueService.enqueue({
			entity: "project",
			op: "delete",
			id,
		});
		return { message: "Suppression planifiée hors ligne." };
	}

	const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
	return response.data;
};

const addMember = async (projectId, userId) => {
	// volontairement online-only (conflits élevés sur membres)
	if (!navigator.onLine) {
		throw new Error("Ajout de membre indisponible hors ligne.");
	}

	const response = await axios.post(`${API_URL}/${projectId}/members`, { userId }, getAuthHeaders());

	const projects = cacheService.getProjects().map((p) => (p._id === projectId ? response.data : p));
	cacheService.saveProjects(projects);

	return response.data;
};

export default { createProject, getProjects, updateProject, deleteProject, addMember };
