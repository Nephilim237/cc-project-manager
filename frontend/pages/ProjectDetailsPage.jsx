import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import projectService from "../services/projectService";
import taskService from "../services/taskService";
import userService from "../services/userService";
import TaskForm from "../components/TaskForm";
import Chat from "../components/Chat";

const ProjectDetailsPage = () => {
	const { projectId } = useParams(); // Recupere l'ID du projet depuis l'URL
	const navigate = useNavigate();
	const [project, setProject] = useState(null);
	const [tasks, setTasks] = useState([]);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	//  State pour la modification d'une tache
	const [editingTask, setEditingTask] = useState(null);
	const [editTitle, setEditTitle] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [editStatus, setEditStatus] = useState("");
	const [editPriority, setEditPriority] = useState("");
	const [editAssignedTo, setEditAssignedTo] = useState("");

	// State pour l'ajout de nouveaux membres dans le projet
	const [allUsers, setAllUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState('');
	const [memberError, setMemberError] = useState('');
	const [memberSuccess, setMemberSuccess] = useState('');

	// Fonction de chargement des details du projet et de ses taches
	const loadProjectDetails = async () => {
		try {
			// NOTE: On suppose que projectService a une methode getProjectById et on va simuler en utilisant la liste des getProjects et en filtrant cote front-end, ensuite, nous allons implementer getProjectById dans le backend
			const allProjects = await projectService.getProjects();
			const project = allProjects.find((p) => p._id === projectId);
			if (!project) {
				setError("Projet non trouvé ou accès refusé.");
				setLoading(false);
				return;
			}
			setProject(project);

			// Charger les taches associees au projet
			const projectTasks = await taskService.getTasksByProject(projectId);
			setTasks(projectTasks);

			// Charger les utilisateurs de notre plateforme
			const users = await userService.getUsers();
			console.log(users);

			setAllUsers(users);
			setError("");
		} catch (err) {
			setError(err.message || "Erreur lors du chargement des details du projet.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadProjectDetails();
	}, [projectId]);

	// Ajouter une nbouvelle tache a la liste
	const handleTaskCreated = (newTask) => {
		setTasks([newTask, ...tasks]); // Ajouter la nouvelle tache en tete de liste
	};

	//  Supprimer une tache
	const handleDeleteTask = async (taskId) => {
		if (!window.confirm("Supprimer cette tache?")) return;
		try {
			await taskService.deleteTask(taskId);
			setTasks(tasks.filter((t) => t._id !== taskId));
		} catch (error) {
			setError("erreur lors de la suppression de la tache.");
		}
	};

	// Ouvrir le formulaire de modification inline
	const handleEditClick = (task) => {
		setEditingTask(task._id);
		setEditTitle(task.title);
		setEditDescription(task.description);
		setEditStatus(task.status);
		setEditPriority(task.priority);
		setEditAssignedTo(task.assignedTo ? task.assignedTo._id : "");
	};

	// Annuler la modification
	const handleCancelEdit = () => {
		setEditingTask(null);
	};

	//  Sauvegarder la modification
	const handleSaveTask = async (taskId) => {
		try {
			const updated = await taskService.updateTask(taskId, {
				title: editTitle,
				description: editDescription,
				status: editStatus,
				priority: editPriority,
				assignedTo: editAssignedTo || null,
			});
			setTasks(tasks.map((t) => (t._id === taskId ? updated : t)));
			setEditingTask(null);
		} catch (error) {
			setError(`Erreur lors de la mise a jour de la tache ${taskId}.`);
		}
	};

	const handleAddMember = async () => {
		if (!selectedUser) return;
		setMemberError('');
		setMemberSuccess('');
		try {
			const updatedProject = await projectService.addMember(projectId, selectedUser);
			setProject(updatedProject);
			setSelectedUser('');
			setMemberSuccess("Membre ajoute avec succes !");
			setTimeout(() => setMemberSuccess(''), 3000);
		} catch (error) {
			setMemberError(error.message || "Erreur lors de l'ajout du membre.");
		}
	};
	if (loading) {
		return <div className="p-8">Chargement...</div>;
	}
	if (error || !project) {
		return <div className="p-8 error-message">{error}</div>;
	}

	// Concatener le proprietaire et les membres pour afficher tous les participants
	const allMembers = [project.owner, ...project.members.filter((m) => m._id !== project.owner._id)]; // Eviter les doublons
	return (
		<div className="project-details-page p-8">
			<button
				onClick={() => navigate("/dashboard")}
				className="btn bg-green-600 hover:bg-green-400 text-white font-bold transition duration-200 mb-5"
			>
				Tableau de Bord
			</button>
			<h2 className="text-3xl font-bold mb-2">{project.title}</h2>
			<p className="text-dark-500 mb-6">{project.description}</p>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Colonne1 : creation des taches */}
				<div className="lg:col-span-1">
					<TaskForm projectId={projectId} onTaskCreated={handleTaskCreated} projectMembers={allMembers} />
				</div>

				{/* Colonne 2: Liste des taches */}
				<div className="lg:col-span-1 p-4">
					<h2 className="text-xl font-semibold mb-4">Tâches du projet ({tasks.length})</h2>
					{tasks.length === 0 ? (
						<p>Aucune tâche pour ce projet.</p>
					) : (
						<div className="space-y-3">
							{tasks.map((task) => (
								<div key={task._id} className="card">
									<div className="flex border-b border-dark-300 justify-between items-start">
										<h3 className="font-bold text-base">{task.title}</h3>
										<div className="flex gap-1">
											<button
												onClick={() => handleEditClick(task)}
												className="btn btn-yellow btn-xs">
												Modifier
											</button>
											<button
												onClick={() => handleDeleteTask(task._id)}
												className="btn btn-red btn-xs">
												Supprimer
											</button>

										</div>
									</div>
									<p className="text-sm text-dark-500 mb-2 py-3 border-b border-dark-300">
										{task.description}
									</p>

									{/* Mode modification inline */}
									{editingTask === task._id ? (
										<div className="mt-2 space-y-2">
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
													<option value="to-do"> A faire</option>
													<option value="in-progress"> En cours</option>
													<option value="testing"> En test</option>
													<option value="done"> Terminee</option>
												</select>
											</div>
											<div>
												<label className="form-label-xs">Priorite :</label>
												<select
													className="form-input form-field-xs w-full"
													value={editPriority}
													onChange={(e) => setEditPriority(e.target.value)}
												>
													<option value="low"> Basse</option>
													<option value="medium"> Moyenne</option>
													<option value="high"> Haute</option>
													<option value="urgent"> Urgente</option>
												</select>
											</div>
											<div>
												<label className="form-label-xs">Assigne a :</label>
												<select
													className="form-input form-field-xs w-full"
													value={editAssignedTo}
													onChange={(e) => setEditAssignedTo(e.target.value)}
												>
													<option value=""> Non assigne</option>
													{allMembers.map(member => (
														<option key={member._id} value={member._id}>
															{member.name}
														</option>
													))}
												</select>
											</div>
											<div className="flex gap-1 justify-end">
												<button
													onClick={handleCancelEdit}
													className="btn btn-red btn-xs">
													Annuler
												</button>
												<button
													onClick={() => handleSaveTask(task._id)}
													className="btn btn-green btn-xs">
													Modifier
												</button>
											</div>
										</div>
									) : (
										<p className="text-xs">
											<strong>Status:</strong> {task.status} | {" "}
											<strong>Priorité:</strong> {task.priority} | {" "}
											<strong>Assignée à:</strong> {task.assignedTo ? task.assignedTo.name : "Non assignée"} | {" "} <strong>Échéance: </strong>
											{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
										</p>
									)}
								</div>
							))}
						</div>
					)}
				</div>

				{/* Colonne 3: Membres du projet */}
				<div className="lg:col-span-1 p-4">
					<div className="project-member border-b border-dark-300 pb-4">
						<h2 className="text-xl font-semibold mb-4">Membres du projet</h2>
						<h5 className="mb-3 text-base">
							Crée par: <strong>{project.owner.name || project.owner.email}</strong> ({project.owner.role})
						</h5>
						<h6 className="font-semibold text-base">Membres:</h6>
						<ul role="list" className="list-disc px-4">
							{allMembers.map((member) => (
								<li key={member._id} className="mb-2 text-sm font-semibold">
									<div className="flex items-center">
										<div className="flex justify-between items-center w-full">
											<h3 className="tracking-tight">
												{member.name} - {member.email}
											</h3>
											<p className="text-green-500">{member.role}</p>
										</div>
									</div>
								</li>
							))}
						</ul>
					</div>

					<div className="add-member">
						<h6 className="font-semibold text-base mb-2">Ajouter un membre :</h6>
						{memberError && <p className="error-message mb-2">{memberError} </p>}
						{memberSuccess && <p className="success-message mb-2">{memberSuccess} </p>}

						<div className="flex gap-2 items-center">
							<select
								className="form-input form-field-xs flex-1"
								value={selectedUser}
								onChange={(e) => setSelectedUser(e.target.value)}
							>
								<option value="">Selectionner un utilisateur</option>
								{allUsers
									.filter((u) => !allMembers.some((m) => m._id === u._id))
									.map((u) => (
										<option value={u._id} key={u._id}>
											{u.name} - {u.email}
										</option>
									))
								}
							</select>

							<button
								onClick={handleAddMember}
								disabled={!selectedUser}
								className="btn btn-green btn-xs disabled:opacity-50"
							>
								Ajouter
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Section Chat */}
			<div className="mt-8">
				<Chat projectId={projectId} />
			</div>
		</div>
	);
};
export default ProjectDetailsPage;
