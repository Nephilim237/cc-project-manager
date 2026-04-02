import { Task } from "../models/Task.js";
import { Project } from "../models/Project.js"; // Necessaires pour verifier les permissions

/**
 * Creates a new task within a project.
 * @description This function handles the creation of a new task. It verifies that the user has the necessary permissions to create a task in the specified project. Only project members with appropriate roles can create tasks.
 * @route POST /api/tasks
 * @access Private (Authenticated users only)
 * @body {string} title - The title of the task (required).
 * @async
 * @param {import('express').Request} req - Express request object (authenticated user on req.user)
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Sends an HTTP response as described above.
 */
export const createTask = async (req, res) => {
	const { title, description, status, priority, assignedTo, dueDate, projectId } = req.body;
	const createdBy = req.user.id; // Id de l'utilisateur connecte

	try {
		// 1. La tache doit etre associee a un projet
		const project = await Project.findById(projectId);
		if (!project) {
			return res.status(404).json({ message: "Projet non trouve" });
		}

		// 2. Verification des permissions: Seul un membre du projet peut creer une tache
		const isMember = project.owner.equals(createdBy) || project.members.includes(createdBy);
		const isAdmin = req.user.role === "admin" || req.user.role === "project-manager";
		if (!isMember && !isAdmin) {
			return res.status(403).json({ message: `Acces non autorise: Vous devez etre au moins PM.` });
		}

		// 3. Creation de la nouvelle tache
		const task = new Task({
			title,
			description,
			status,
			priority: priority || "Medium",
			project: projectId,
			assignedTo: assignedTo || null,
			dueDate,
			createdBy: req.user.id,
		});
		const createdTask = await task.save();

		// 4. Reponse: On renvoie la tache nouvellement creee
		// On la "populate" pour renvoyer directement les noms d'utilisateurs sur le front-end
		const populatedTask = await Task.findById(createdTask._id).populate("assignedTo", "name email").populate("createdBy", "name email");

		// On revoie l'objet peuple
		res.status(201).json(populatedTask);
	} catch (error) {
		if (error.name === "ValidationError") {
			return res.status(400).json({ message: error.message });
		}

		console.error("Erreur detaillee: ", error.message);
		res.status(500).json({ message: "Erreur serveur lors de la creation de la tache." });
	}
};

/**
 * @description Cette fonction permet de recuperer toutes les taches d'un projet specifique. Elle verifie que l'utilisateur a les permissions necessaires pour acceder aux taches du projet. Seuls les membres du projet peuvent voir les taches associees.
 * @route GET /api/tasks/project/:projectId
 * @access Private (Utilisateurs authentifies uniquement)
 * @async
 * @param {import('express').Request} req - Objet de requete Express (utilisateur authentifie sur req.user)
 * @param {import('express').Response} res - Objet de reponse Express
 * @returns {Promise<void>} Envoie une reponse HTTP comme decrit ci-dessus.
 */

export const getTasksByProject = async (req, res) => {
	const { projectId } = req.params;
	const userId = req.user.id;

	try {
		// 1. verification du projet
		const project = await Project.findById(projectId);
		if (!project) {
			return res.status(404).json({ message: "Projet non trouve" });
		}

		// 2. Verification des permissions: Seul un membre du projet peut voir les taches
		const isMember = project.owner.equals(userId) || project.members.includes(userId);
		// const isAdmin = req.user.role === "admin" || req.user.role === "project-manager";
		const isAdmin = ["admin", "project-manager"].includes(req.user.role);

		if (!isMember && !isAdmin) {
			return res.status(403).json({ message: `Acces non autorise: Vous devez etre membre de ce projet.` });
		}

		// 3. Recuperation des taches
		const tasks = await Task.find({ project: projectId })
			.populate("assignedTo", "name email")
			.populate("createdBy", "name email")
			.sort({ createdAt: -1 }); // Taches les plus recentes en premier
		res.status(200).json(tasks);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Erreur serveur lors de la recuperation des taches.");
	}
};

export const updateTask = async (req, res) => {
	const { title, description, status, priority, assignedTo, dueDate } = req.body;

	try {
		const task = await Task.findById(req.params.id);
		if (!task) {
			return res.status(404).json({ message: "Tache non trouvee." });
		}

		// Verifier que l'utilisateur est membre du projet
		const project = await Project.findById(task.project);
		const isMember = project.owner.equals(req.user.id) || project.members.includes(req.user.id);
		const isAdmin = ["admin", "project-manager"].includes(req.user.role);
		if (!isMember && !isAdmin) {
			return res.status(403).json({ message: "Acces non autorise." });
		}

		task.title = title || task.title;
		task.description = description || task.description;
		task.status = status || task.status;
		task.priority = priority || task.priority;
		task.assignedTo = assignedTo || task.assignedTo;
		task.dueDate = dueDate || task.dueDate;

		const updatedTask = await task.save();
		const populatedTask = await Task.findById(updatedTask._id).populate("assignedTo", "name email role").populate("createdBy", "name email role");

		res.json(populatedTask);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur serveur lors de la mise a jour de la tache." });
	}
};

export const deleteTask = async (req, res) => {
	try {
		const task = await Task.findById(req.params.id);
		if (!task) {
			return res.status(404).json({ message: "Tache non trouvee." });
		}

		// Seul celui qui cree la tache, le proprietaire du projet ou un admin peut la supprimer
		const project = await Project.findById(task.project);
		const isCreator = task.createdBy.equals(req.user.id);
		const isOwner = project.owner.equals(req.user.id);
		const isAdmin = ["admin", "project-manager"].includes(req.user.role);
		if (!isOwner && !isAdmin && !isCreator) {
			return res.status(403).json({ message: "Acces non autorise." });
		}

		await task.deleteOne();
		res.json({ message: "Tache supprimee avec succes." });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur serveur lors de la suppression de la tache." });
	}
};

export const getTasksStats = async (req, res) => {
	const userId = req.user.id;
	const isAdmin = ["admin", "project-manager"].includes(req.user.role);

	try {
		// Recuperer les projets en fonction du niveau d'access autorise
		let projectFilter = {};
		if (!isAdmin) {
			projectFilter = { $or: [{ owner: userId }, { members: userId }] };
		}

		const projects = await Project.find(projectFilter).select("_id");
		const projectIds = projects.map((p) => p._id);

		// Agregation des tache par statut
		const stats = await Task.aggregate([
			{ $match: { project: { $in: projectIds } } },
			{ $group: { _id: "$status", count: { $sum: 1 } } }
		]);

		// Formater le resultat
		const result = { "to-do": 0, "in-progress": 0, "testing": 0, "done": 0 };
		stats.forEach((s) => {
			result[s._id] = s.count;
		});

		res.json({
			total: Object.values(result).reduce((a, b) => a + b, 0),
			byStatus: result,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur serveur lors du calcul des stats" });
	}
};
