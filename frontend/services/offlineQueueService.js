import axios from "axios";
import cacheService from "./cacheService";

const API_URL = import.meta.env.VITE_API_URL || `http://localhost:5000/api`;

const getAuthHeaders = () => {
	const token = localStorage.getItem("token");
	return {
		headers: {
			Authorization: token ? `Bearer ${token}` : "",
		},
	};
};

const createId = () => `q_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const enqueue = (action) => {
	const queue = cacheService.getQueue();
	queue.push({
		queueId: createId(),
		createdAt: Date.now(),
		retries: 0,
		...action,
	});

	cacheService.saveQueue(queue);
};

const remapQueueIds = (tempId, realId) => {
	const queue = cacheService.getQueue().map((action) => {
		const mapped = { ...action };

		if (mapped.id === tempId) {
			mapped.id = realId;
		}

		if (mapped.tempId === tempId) {
			mapped.tempId = realId;
		}

		if (mapped.payload?.projectId === tempId) {
			mapped.payload = { ...mapped.payload, projectId: realId };
		}

		if (mapped.payload?.project === tempId) {
			mapped.payload = { ...mapped.payload, project: realId };
		}

		return mapped;
	});

	cacheService.saveQueue(queue);
};

const remapActionsInMemory = (actions, tempId, realId, fromIndex = 0) => {
	for (let i = fromIndex; i < actions.length; i += 1) {
		const action = actions[i];
		if (!action) continue;

		if (action.id === tempId) {
			action.id = realId;
		}
		if (action.tempId === tempId) {
			action.tempId = realId;
		}
		if (action.payload?.projectId === tempId) {
			action.payload = { ...action.payload, projectId: realId };
		}
		if (action.payload?.project === tempId) {
			action.payload = { ...action.payload, project: realId };
		}
	}
};

const replaceTempIdEverywhere = (tempId, realId) => {
	// La queue peut contenir des actions en attente qui référencent encore l'ancien ID temporaire.
	remapQueueIds(tempId, realId);

	// Projets
	const projects = cacheService.getProjects().map(
		(p) => (p._id === tempId ? { ...p, _id: realId, _clientId: tempId, _pending: false } : p)
	);
	cacheService.saveProjects(projects);

	// Migrer cle taches du projet temp
	const tempTasks = cacheService.getTasks(tempId);
	if(tempTasks.length) {
		const migrated = tempTasks.map((t) => ({
			...t, 
			project: t.project === tempId ? realId : t.project,
			_pending: false,
		}));
		
		cacheService.saveTasks(realId, migrated);
		cacheService.removeTasks(tempId);
	}

	// Taches (Toutes les cles des taches peuvent etre connues indirectement a partir du projet auquel elles appartiennent)
	projects.forEach((p) => {
		const tasks = cacheService.getTasks(p._id).map((t) => {
			if (t._id === tempId) return { ...t, _id: realId, _pending: false };
			if (t.project === tempId) return { ...t, project: realId };
			return t;
		});

		cacheService.saveTasks(p._id, tasks);
	});
};

const executeAction = async (action) => {
	const auth = getAuthHeaders();

	if (action.entity === "project") {
		if (action.op === "create") {
			const response = await axios.post(`${API_URL}/projects`, action.payload, auth);
			if (action.tempId) {
				replaceTempIdEverywhere(action.tempId, response.data._id);
				return { tempId: action.tempId, realId: response.data._id };
			}
			return null;
		}
		if (action.op === "update") {
			await axios.put(`${API_URL}/projects/${action.id}`, action.payload, auth);
			return null;
		}
		if (action.op === "delete") {
			await axios.delete(`${API_URL}/projects/${action.id}`, auth);
			return null;
		}
	}

	if (action.entity === "task") {
		if (action.op === "create") {
			const response = await axios.post(`${API_URL}/tasks`, action.payload, auth);
			if (action.tempId) {
				replaceTempIdEverywhere(action.tempId, response.data._id);
				return { tempId: action.tempId, realId: response.data._id };
			}
			return null;
		}
		if (action.op === "update") {
			await axios.put(`${API_URL}/tasks/${action.id}`, action.payload, auth);
			return null;
		}
		if (action.op === "delete") {
			await axios.delete(`${API_URL}/tasks/${action.id}`, auth);
			return null;
		}
	}

	return null;
};

const flushQueue = async () => {
	if (!navigator.onLine) return { flushed: 0, remaining: cacheService.getQueue().length };

	const queue = [...cacheService.getQueue()];
	if (!queue.length) return { flushed: 0, remaining: 0 };

	let flushed = 0;
	const nextQueue = [];

	for (let i = 0; i < queue.length; i += 1) {
		const action = queue[i];
		try {
			const remap = await executeAction(action);
			if (remap?.tempId && remap?.realId) {
				// Important: remapper aussi la copie en mémoire pour les actions suivantes
				// dans ce même flush (sinon elles partent encore avec tempId).
				remapActionsInMemory(queue, remap.tempId, remap.realId, i + 1);
			}
			flushed += 1;
		} catch (error) {
			// Erreur reseaeu => on stoppe (inutile de continuer)
			if (!navigator.onLine) {
				nextQueue.push({ ...action, retries: action.retries + 1 });
				break;
			}

			// Erreur metier (404, 403, 400): on garde en failed pour la visibilite
			nextQueue.push({
				...action,
				retries: action.retries + 1,
				failed: true,
				lastError: error.response?.data?.message || error.message,
			});
		}
	}

	// Ajouter le reste non traite
	const processedIds = new Set(
		queue.slice(0, flushed + nextQueue.length).map((a) => a.queueId || a.id)
	);
	queue.forEach((a) => {
		if (!processedIds.has(a.queueId || a.id)) nextQueue.push(a);
	});

	cacheService.saveQueue(nextQueue);
	return { flushed, remaining: nextQueue.length };
};

let intervalId = null;

const startAutoSync = () => {
	if (intervalId) return;

	const onOnline = () => {
		flushQueue().catch(() => {});
	};

	window.addEventListener("online", onOnline);
	intervalId = window.setInterval(() => {
		if (navigator.onLine) flushQueue().catch(() => {});
	}, 10000);

	// Sync immediat si deja online
	if (navigator.onLine) {
		flushQueue().catch(() => {});
	}

	return () => {
		window.removeEventListener("online", onOnline);
		window.clearInterval(intervalId);
		intervalId = null;
	};
};

export default {
    enqueue, flushQueue, startAutoSync,
};
