const KEYS = {
	PROJECTS: "cc_projects_cache",
	TASKS_PREFIX: "cc_tasks_cache_", // On va rajouter le projectId par la suite
	USERS: "cc_users_cache",
};

// Sauvegarder les projets
const saveProjects = (projects) => {
	try {
		localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
	} catch (error) {
		console.warn("Erreur Cache projets:", error);
	}
};

// Lire les projets depuis le cache
const getProjects = () => {
	try {
		const data = localStorage.getItem(KEYS.PROJECTS);
		return data ? JSON.parse(data) : [];
	} catch (error) {
		console.warn("Erreur recuperation projet cache: ", error);
		return [];
	}
};

// Sauvegrader les taches d'un projet depuis le cache
const saveTasks = (projectId, tasks) => {
	try {
		localStorage.setItem(`${KEYS.TASKS_PREFIX}${projectId}`, JSON.stringify(tasks));
	} catch (error) {
		console.warn("Erreur cache taches: ", error);
	}
};

// Lire les taches d'un projet depusi el cache
const getTasks = (projectId) => {
	try {
		const data = localStorage.getItem(`${KEYS.TASKS_PREFIX}${projectId}`);
		return data ? JSON.parse(data) : [];
	} catch (error) {
		console.warn("Erreur recuperation taches cache: ", error);
		return [];
	}
};

// Sauvegarder les utilisateur dans le cache
const saveUsers = (users) => {
	try {
		localStorage.setItem(KEYS.USERS, JSON.stringify(users));
	} catch (error) {
		console.warn("Erreur cache taches: ", error);
	}
};

// Lire les utilisateurs depuis le cache
const getUsers = () => {
	try {
		const data = localStorage.getItem(KEYS.USERS);
		return data ? JSON.parse(data) : [];
	} catch (error) {
		console.warn("Erreur recuperation taches cache: ", error);
		return [];
	}
};

export default { saveProjects, getProjects, saveTasks, getTasks, saveUsers, getUsers };
