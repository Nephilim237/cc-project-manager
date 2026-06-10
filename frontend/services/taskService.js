import axios from "axios";
import cacheService from "./cacheService.js";
import offlineQueueService from "./offlineQueueService.js";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/tasks`;

const getAuthHeaders = () => {
	const token = localStorage.getItem("token");
	return {
		headers: {
			Authorization: token ? `Bearer ${token}` : "",
		},
	};
};

const tmpId = (prefix = "tmp_task") => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const createTask = async (taskData) => {
	const projectId = taskData.projectId;

	if (!navigator.onLine) {
		const user = JSON.parse(localStorage.getItem("user") || "null");
		const task = {
			_id: tmpId(),
			title: taskData.title,
			description: taskData.description || "",
			status: taskData.status || "to-do",
			priority: taskData.priority || "medium",
			assignedTo: null,
			dueDate: taskData.dueDate || null,
			project: projectId,
			createdBy: user || null,
			createdAt: new Date().toISOString(),
			_pending: true,
		};

		const tasks = cacheService.getTasks(projectId);
		cacheService.saveTasks(projectId, [task, ...tasks]);

		offlineQueueService.enqueue({
			entity: "task",
			op: "create",
			tempId: task._id,
			payload: taskData,
		});

		return task;
	}

	const response = await axios.post(API_URL, taskData, getAuthHeaders());
	const tasks = cacheService.getTasks(projectId);
	cacheService.saveTasks(projectId, [response.data, ...tasks.filter((t) => t._id !== response.data._id)]);
	return response.data;
};

const getTasksByProject = async (projectId) => {
	if (!navigator.onLine) return cacheService.getTasks(projectId);

	try {
		const response = await axios.get(`${API_URL}/project/${projectId}`, getAuthHeaders());
		cacheService.saveTasks(projectId, response.data || []);
		return response.data;
	} catch (error) {
		const cached = cacheService.getTasks(projectId);
		if (cached.length) return cached;
		throw new Error(error.response?.data?.message || "Erreur serveur lors de la récupération des tâches.");
	}
};

const updateTask = async (id, data, projectIdHint) => {
	// Trouver la tâche dans le cache
	const projects = cacheService.getProjects();
	let projectId = projectIdHint || null;

	if (!projectId) {
		for (const p of projects) {
			const tasks = cacheService.getTasks(p._id);
			const found = tasks.find((t) => t._id === id);
			if (found) {
				projectId = p._id;
				break;
			}
		}
	}

	if (!projectId) throw new Error("Projet de la tâche introuvable en cache.");

	const tasks = cacheService.getTasks(projectId);
	const updatedLocalList = tasks.map((t) => (t._id === id ? { ...t, ...data, _pending: !navigator.onLine } : t));
	cacheService.saveTasks(projectId, updatedLocalList);

	if (!navigator.onLine) {
		offlineQueueService.enqueue({
			entity: "task",
			op: "update",
			id,
			payload: data,
		});
		return updatedLocalList.find((t) => t._id === id);
	}

	const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
	const merged = cacheService.getTasks(projectId).map((t) => (t._id === id ? { ...response.data, _pending: false } : t));
	cacheService.saveTasks(projectId, merged);
	return response.data;
};

const deleteTask = async (id, projectIdHint) => {
	const projects = cacheService.getProjects();
	let projectId = projectIdHint || null;

	if (!projectId) {
		for (const p of projects) {
			const tasks = cacheService.getTasks(p._id);
			if (tasks.some((t) => t._id === id)) {
				projectId = p._id;
				break;
			}
		}
	}

	if (!projectId) throw new Error("Projet de la tâche introuvable en cache.");

	const tasks = cacheService.getTasks(projectId).filter((t) => t._id !== id);
	cacheService.saveTasks(projectId, tasks);

	if (!navigator.onLine) {
		offlineQueueService.enqueue({
			entity: "task",
			op: "delete",
			id,
		});
		return { message: "Suppression planifiée hors ligne." };
	}

	const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
	return response.data;
};

const getStats = async () => {
	if (!navigator.onLine) {
		// fallback calculé localement
		const projects = cacheService.getProjects();
		const allTasks = projects.flatMap((p) => cacheService.getTasks(p._id));
		const byStatus = { "to-do": 0, "in-progress": 0, testing: 0, done: 0 };
		allTasks.forEach((t) => {
			if (byStatus[t.status] !== undefined) byStatus[t.status] += 1;
		});
		return {
			total: allTasks.length,
			byStatus,
		};
	}

	const response = await axios.get(`${API_URL}/stats`, getAuthHeaders());
	return response.data;
};

export default { createTask, getTasksByProject, updateTask, deleteTask, getStats };
