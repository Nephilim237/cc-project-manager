import axios from "axios";
import cacheService from "./cacheService.js";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/messages`;

const getAuthHeaders = () => {
	const token = localStorage.getItem("token");
	return {
		headers: {
			Authorization: token ? `Bearer ${token}` : "",
		},
	};
};

const tmpId = () => `tmp_msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const getMessages = async (projectId) => {
	if (!navigator.onLine) return cacheService.getMessages(projectId);

	try {
		const response = await axios.get(`${API_URL}/${projectId}`, getAuthHeaders());
		cacheService.saveMessages(projectId, response.data || []);
		return response.data;
	} catch (error) {
		const cached = cacheService.getMessages(projectId);
		if (cached.length) return cached;
		throw new Error(error.response?.data?.message || "Erreur lors de la récupération des messages.");
	}
};

const createLocalPendingMessage = (projectId, content) => {
	const currentUser = JSON.parse(localStorage.getItem("user") || "null");
	const pending = {
		_id: tmpId(),
		project: projectId,
		content,
		sender: currentUser || { _id: "local_user", name: "Vous" },
		createdAt: new Date().toISOString(),
		_pending: true,
		_failed: false,
	};

	const messages = cacheService.getMessages(projectId);
	cacheService.saveMessages(projectId, [...messages, pending]);
	return pending;
};

const markMessageAsSent = (projectId, tempId, realMessage) => {
	const messages = cacheService.getMessages(projectId).map((m) => (m._id === tempId ? { ...realMessage, _pending: false, _failed: false } : m));
	cacheService.saveMessages(projectId, messages);
};

const markMessageAsFailed = (projectId, tempId) => {
	const messages = cacheService.getMessages(projectId).map((m) => (m._id === tempId ? { ...m, _pending: false, _failed: true } : m));
	cacheService.saveMessages(projectId, messages);
};

const getPendingMessages = (projectId) => {
	return cacheService.getMessages(projectId).filter((m) => m._pending || m._failed);
};

export default {
	getMessages,
	createLocalPendingMessage,
	markMessageAsSent,
	markMessageAsFailed,
	getPendingMessages,
};
