import { Message } from "../models/Message.js";
import { Project } from "../models/Project.js";

// Récupérer l'historique des messages d'un projet
export const getMessages = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.id;

    try {
        // Vérifier que l'utilisateur est membre du projet
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Projet non trouvé." });
        }

        const isMember = project.owner.equals(userId) || project.members.includes(userId);
        const isAdmin = ["admin", "project-manager"].includes(req.user.role);
        if (!isMember && !isAdmin) {
            return res.status(403).json({ message: "Accès non autorisé." });
        }

        const messages = await Message.find({ project: projectId })
            .populate("sender", "name email")
            .sort({ createdAt: 1 }) // Plus anciens en premier
            .limit(100); // 100 derniers messages max

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des messages." });
    }
};

