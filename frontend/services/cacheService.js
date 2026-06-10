const KEYS = {
	PROJECTS: "cc_projects_cache",
	TASKS_PREFIX: "cc_tasks_cache_",
	USERS: "cc_users_cache",
	MESSAGES_PREFIX: "cc_messages_cache_",
	OFFLINE_QUEUE: "cc_offline_queue",
};

const readJSON = (key, fallback) => {
	try {
		const data = localStorage.getItem(key);
		return data ? JSON.parse(data) : fallback;
	} catch {
		return fallback;
	}
};

const writeJSON = (key, value) => {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.warn("Erreur cache:", error);
	}
};

// Projects
const saveProjects = (projects) => writeJSON(KEYS.PROJECTS, projects || []);
const getProjects = () => readJSON(KEYS.PROJECTS, []);

// Tasks
const saveTasks = (projectId, tasks) => writeJSON(`${KEYS.TASKS_PREFIX}${projectId}`, tasks || []);
const getTasks = (projectId) => readJSON(`${KEYS.TASKS_PREFIX}${projectId}`, []);
const removeTasks = (projectId) => {
	try {
		localStorage.removeItem(`${KEYS.TASKS_PREFIX}${projectId}`);
	} catch(error) {
		console.warn("Erreur suppression cache taches:", error);
	}
}

// Users
const saveUsers = (users) => writeJSON(KEYS.USERS, users || []);
const getUsers = () => readJSON(KEYS.USERS, []);

// Messages
const saveMessages = (projectId, messages) => writeJSON(`${KEYS.MESSAGES_PREFIX}${projectId}`, messages || []);
const getMessages = (projectId) => readJSON(`${KEYS.MESSAGES_PREFIX}${projectId}`, []);

// Queue
const getQueue = () => readJSON(KEYS.OFFLINE_QUEUE, []);
const saveQueue = (queue) => writeJSON(KEYS.OFFLINE_QUEUE, queue || []);

export default {
	saveProjects,
	getProjects,
	saveTasks,
	getTasks,
	removeTasks,
	saveUsers,
	getUsers,
	saveMessages,
	getMessages,
	getQueue,
	saveQueue,
};
