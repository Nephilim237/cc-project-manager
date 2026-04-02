import React, { useState } from "react";
import taskServices from "../services/taskService";

// Le prop projectId est requis pour lier la tache au projet
const TaskForm = ({ projectId, onTaskCreated, projectMembers = [] }) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState("medium");
	const [dueDate, setDueDate] = useState("");
	const [assignedTo, setAssignedTo] = useState("");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const taskData = {
			title,
			description,
			priority,
			dueDate: dueDate ? new Date(dueDate) : null,
			projectId,
			assignedTo: assignedTo || undefined, // Undefined si non assigné
		};

		try {
			const createdTask = await taskServices.createTask(taskData);
			setTitle("");
			setAssignedTo("");
			setDescription("");
			setPriority("medium");
			setDueDate("");
			setSuccess(true);

			setTimeout(() => setSuccess(false), 3000); // Supprimer le message de succes apres 3s

			// Notifier le parent de la creation de la tache (la page du projet)
			onTaskCreated(createdTask); // Appel du callback pour informer le parent
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4 bg-green-100 shadow-2xl rounded-lg mb-6">
			<form onSubmit={handleSubmit} className="task-form">
				<h3 className="text-xl font-semibold mb-5">Créer une nouvelle tâche</h3>
				{error && <p className="error-message">{error}</p>}
				{success && <p className="success-message">Tâche créée avec succès !</p>}
				<div className="form-group">
					<label className="form-label">Titre *:</label>
					<input
						className="form-input bg-dark-100 w-full"
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Ex:. Acheter les cables et la sertisseuse"
						required
					/>
				</div>
				<div className="form-group">
					<label className="form-label">Description:</label>
					<textarea
						className="form-input bg-dark-100 w-full"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Détails supplémentaires sur la tâche"
					/>
				</div>
				<div className="form-group">
					{/* Selecteur de priorité */}
					<label className="form-label">Priorité *:</label>
					<select className="form-input bg-dark-100 w-full" value={priority} onChange={(e) => setPriority(e.target.value)}>
						<option value="low">Basse</option>
						<option value="medium">Moyenne</option>
						<option value="high">Haute</option>
						<option value="urgent">Urgente</option>
					</select>
				</div>
				<div className="form-group">
					<label className="form-label">Date d'échéance *:</label>
					<input className="form-input bg-dark-100 w-full" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
				</div>
				<div className="form-group">
					{/* Selecteur des assignés */}
					<label className="form-label">Assigné à *:</label>
					<select className="form-input bg-dark-100 w-full" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
						<option value="">Non assigné</option>
						{/* Les projectMembers doivent etre les objets utilisateur (avec _id) */}
						{projectMembers &&
							projectMembers.map((member) => (
								<option key={member._id} value={member._id}>
									{member.name}
								</option>
							))}
					</select>
				</div>

				<button
					className="btn bg-green-600 hover:bg-green-400 transition duration-200 w-full disabled:opacity-50 "
					type="submit"
					disabled={loading || !title}
				>
					{loading ? "Creation..." : "Créer la tâche"}
				</button>
			</form>
		</div>
	);
};

export default TaskForm;
