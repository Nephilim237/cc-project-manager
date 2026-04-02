import { Project } from "../models/Project.js";

export const createProject = async (req, res) => {
	const { title, description, dueDate, members } = req.body;

	try {
		const newProject = new Project({
			title,
			description,
			dueDate,
			members: [req.user.id, ...(members || [])], // Ajoute le proprietaire du projet et les autres membres
			owner: req.user.id, // l'id vient du middleware 'protect'
		});

		const project = await newProject.save();
		const populatedProject = await Project.findById(project._id).populate("owner", "name email role").populate("members", "name email role");
		res.status(201).json(populatedProject);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur du serveur lors de la creation du projet" });
	}
};

export const getProjects = async (req, res) => {
	// Recuperation du role et de l'id de l'utilisateur decodé via le JWT
	const userRole = req.user.role;
	const userId = req.user.id;

	// Initialisation du filtre de requetes MongoDB
	let filter = {};

	// Si l'utilisateur est admin, il accede a tous les projets
	if (userRole !== "admin" && userRole !== "project-manager") {
		filter = {
			$or: [{ owner: userId }, { members: userId }],
		};
	}

	try {
		const projects = await Project.find(filter).sort({ createdAt: -1 }).populate("owner", "name email role").populate("members", "name email role");

		res.json(projects);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Erreur du serveur lors de la recuperation des projets.");
	}
};

export const updateProject = async (req, res) => {
	const { title, description, dueDate, status, members } = req.body;

	try {
		const project = await Project.findById(req.params.id);
		if (!project) {
			return res.status(404).json({ message: "Projet non trouve." });
		}

		// Verification requise pour pouvoir modifier
		const isOwner = project.owner.equals(req.user.id);
		const isAdmin = ["admin", "project-manager"].includes(req.user.role);

		if (!isOwner && !isAdmin) {
			return res.status(403).json({ message: "Acces non autorise" });
		}

		project.title = title ?? project.title;
		project.description = description ?? project.description;
		project.dueDate = dueDate ?? project.dueDate;
		project.status = status ?? project.status;
		project.members = members ?? project.members;

		const updatedProject = await project.save();
		const populatedProject = await Project.findById(updatedProject._id).populate("owner", "name email role").populate("members", "name email role");

		res.json(populatedProject);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur serveur lors de la mise a jour du projet." });
	}
};

export const deleteProject = async (req, res) => {
	try {
		const project = await Project.findById(req.params.id);
		if (!project) {
			return res.status(404).json({ message: "Projet non trouve" });
		}

		// Verification requise pour pouvoir modifier
		const isOwner = project.owner.equals(req.user.id);
		const isAdmin = ["admin", "project-manager"].includes(req.user.role);

		if (!isOwner && !isAdmin) {
			return res.status(403).json({ message: "Acces non autorise" });
		}

		await project.deleteOne();
		res.json({ message: "Projet supprime avec succes." });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur serveur lors de la suppression du projet." });
	}
};

export const addMember = async (req, res) => {
	const { userId } = req.body;

	try {
		const project = await Project.findById(req.params.id);
		if (!project) {
			return res.status(404).json({ message: "Projet non trouve." });
		}

		//  Seul el proprietaire ou un admin peut ajouter des membres sur un projet
		const isOwner = project.owner.equals(req.user.id);
		const isAdmin = ["admin", "project-manager"].includes(req.user.role);
		if (!isOwner && !isAdmin) {
			return res.status(403).json({ message: "Acces non autorise." });
		}

		// Verifier si l'utilisateur qu'on souhaite ajouter est deja membre duy projet
		if (project.members.includes(userId)) {
			return res.status(400).json({ message: "Cet utilisateur es deja membre de ce projet." });
		}

		project.members.push(userId);
		await project.save();

		const populated = await Project.findById(project._id).populate("owner", "name email role").populate("members", "name email role");

		res.json(populated);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur serveur lors de l'ajout du membre." });
	}
};
