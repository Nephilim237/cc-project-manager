import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import projectService from "../services/projectService.js";
import taskService from "../services/taskService.js";
import ProjectForm from "../components/ProjectForm"; // Importation du formulaire

const Dashboard = () => {
	const { user, logout } = useAuth();
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState(null);
	const navigate = useNavigate();

	// state pour la mofdification d'un projet
	const [editingProject, setEditingProject] = useState(null);
	const [editTitle, setEditTitle] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [editStatus, setEditStatus] = useState("");

	// state pour les stats
	const [stats, setStats] = useState(null);

	const handleLogout = () => {
		logout();
		navigate("/login", { replace: true });
	};

	// Fonction pour charger les projets depuis l'API
	const fetchProjects = async () => {
		try {
			const projects = await projectService.getProjects();
			setProjects(projects);

			console.log(projects);

			const taskStats = await taskService.getStats();
			setStats(taskStats);

			setMessage(null);
		} catch (error) {
			setMessage(error.message);
			// Si le token est invalide (401), on deconnecte l'utilisateur
			if (error.message.includes("Acces non autorise")) {
				handleLogout();
			}
		} finally {
			setLoading(false);
		}
	};

	// Charger les projets au montage du composant
	useEffect(() => {
		fetchProjects();
	}, []);

	// Fonction passee au formulaire pour rafraichir la liste
	const handleProjectCreated = (newProject) => {
		setProjects([newProject, ...projects]); // On ajoute le nouveau projet aux autres existant deja
	};

	// Ouvrir le formulaire de modification inline
	const handleEditClick = (e, project) => {
		e.preventDefault();
		setEditingProject(project._id);
		setEditTitle(project.title);
		setEditDescription(project.description);
		setEditStatus(project.status);
	};

	const handleCancelEdit = () => {
		setEditingProject(null);
	};

	//  Mise a jour du projet
	const handleSaveProject = async (projectId) => {
		try {
			const updated = await projectService.updateProject(projectId, {
				title: editTitle,
				description: editDescription,
				status: editStatus,
			});
			setProjects(projects.map((p) => (p._id === projectId ? updated : p)));
			setEditingProject(null);
		} catch (error) {
			setMessage("Errur lors de la mise a jour du projet");
		}
	}

	// Suppression d'un projet
	const handleDeleteProject = async (e, projectId) => {
		e.preventDefault(); // Empecher la navigation vers les projet
		if (!window.confirm("Supprimer ce projet? Cette action est irreversible."));
		try {
			await projectService.deleteProject(projectId);
			setProjects(projects.filter((p) => p._id !== projectId));
		} catch (error) {
			setMessage("Errue lors de la suppression du projet.");
		}
	}

	if (loading) {
		return <div className="p-8">Chargement du tableau de bord ...</div>;
	}

	return (
		<div className="p-8">
			<header className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Bienvenue, {user ? user.name : "Utilisateur"}!</h1>
				<button onClick={handleLogout} className="btn btn-sm btn-red">
					Deconnexion
				</button>
			</header>
			{/* Section statistiques */}
			{stats && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					{/* Projets */}
					<div className="card text-center">
						<p className="text-3xl font-bold text-green-600">{projects.length}</p>
						<p className="text-sm text-gray-500 mt-1">Projets total</p>
					</div>
					<div className="card text-center">
						<p className="text-3xl font-bold text-blue-600">
							{projects.filter((p) => p.status === "Active").length}
						</p>
						<p className="text-sm text-gray-500 mt-1">Projets actifs</p>
					</div>
					<div className="card text-center">
						<p className="text-3xl font-bold text-gray-600">{stats.total}</p>
						<p className="text-sm text-gray-500 mt-1">Tâches total</p>
					</div>
					<div className="card text-center">
						<p className="text-3xl font-bold text-green-600">{stats.byStatus["done"]}</p>
						<p className="text-sm text-gray-500 mt-1">Tâches terminées</p>
					</div>

					{/* Détail tâches par statut */}
					<div className="card text-center">
						<p className="text-2xl font-bold text-red-500">{stats.byStatus["to-do"]}</p>
						<p className="text-sm text-gray-500 mt-1">À faire</p>
					</div>
					<div className="card text-center">
						<p className="text-2xl font-bold text-yellow-500">{stats.byStatus["in-progress"]}</p>
						<p className="text-sm text-gray-500 mt-1">En cours</p>
					</div>
					<div className="card text-center">
						<p className="text-2xl font-bold text-blue-400">{stats.byStatus["testing"]}</p>
						<p className="text-sm text-gray-500 mt-1">En test</p>
					</div>
					<div className="card text-center">
						<p className="text-2xl font-bold text-purple-500">
							{projects.filter((p) => p.status === "Completed").length}
						</p>
						<p className="text-sm text-gray-500 mt-1">Projets terminés</p>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{/* Colonne 1: Creation de Projet */}
				<div className="md:col-span-1">
					<ProjectForm onProjectCreated={handleProjectCreated} />
				</div>

				{/* Colonne 2: Liste des projets */}
				<div className="md:col-span-2">
					<h2 className="text-2xl font-semibold mb-4">Vos projets recents</h2>
					{message && <p className="error-message">{message}</p>}
					{projects.length === 0 && !loading && !message ? (
						<p className="text-gray-500">Aucun projet trouvé. Creez en un pour commencer.</p>
					) : (
						<div className="space-y-4">
							{projects.map((project) => (
								<div className="card hover:bg-green-100 transition duration-300" key={project._id}>
									{/* Mode Affichage normal */}
									{editingProject !== project._id ? (
										<div className="flex justify-between items-start">
											<Link to={`/projects/${project._id}`} key={project._id} >
												<h3 className="card-title">{project.title}</h3>
												<p className="text-gray-600 text-sm mt-1">{project.description}</p>
												<p className="card-muted mt-2">
													Crée le : {new Date(project.createdAt).toLocaleDateString()} Par {project.owner.name} | Nombre de Participants:{" "}
													{project.members.length}
												</p>
											</Link>

											<div className="flex gap-2 ml-4">
												<button
													onClick={(e) => handleEditClick(e, project)}
													className="btn btn-yellow btn-xs">
													Modifier
												</button>
												<button
													onClick={(e) => handleDeleteProject(e, project._id)}
													className="btn btn-red btn-xs">
													Supprimer
												</button>
											</div>
										</div>
									) : (
										// Mode modification inline
										<div className="space-y-2">
											<div>
												<label className="form-label-xs">Titre: </label>
												<input
													type="text"
													className="form-input form-field-xs w-full"
													value={editTitle}
													onChange={(e) => setEditTitle(e.target.value)} />
											</div>
											<div>
												<label className="form-label-xs">Decription: </label>
												<textarea
													className="form-input form-field-xs w-full"
													value={editDescription}
													onChange={(e) => setEditDescription(e.target.value)}></textarea>
											</div>
											<div>
												<label className="form-label-xs">Statut :</label>
												<select
													className="form-input form-field-xs w-full"
													value={editStatus}
													onChange={(e) => setEditStatus(e.target.value)}
												>
													<option value="Active">Actif</option>
													<option value="Completed">Termine</option>
													<option value="Archived">Archive</option>
												</select>
											</div>
											<div className="flex gap-1 justify-end">
												<button
													onClick={handleCancelEdit}
													className="btn btn-red btn-xs">
													Annuler
												</button>
												<button
													onClick={() => handleSaveProject(project._id)}
													className="btn btn-green btn-xs">
													Modifier
												</button>
											</div>
										</div>
									)}

								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
