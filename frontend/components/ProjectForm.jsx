import React, { useState } from "react";
import projectServices from "../services/projectService.js";

const ProjectForm = ({ onProjectCreated }) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage("");
		setLoading(true);

		try {
			// Appel du service API
			const newProject = await projectServices.createProject({ title, description });

			// Reinitialiser le formulaire
			setTitle("");
			setDescription("");

			// Notifier le parent que le projet a ete cree
			onProjectCreated(newProject);
		} catch (error) {
			setMessage(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4 bg-green-100 shadow-2xl rounded-lg">
			<h3 className="text-xl font-semibold mb-5">Creer un nouveau projet</h3>

			{message && <p className="error-message">{message}</p>}

			<form onSubmit={handleSubmit}>
				<div className="mb-4">
					<input
						type="text"
						placeholder="Titre du projet (Ex: Securite Mairie.)"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full form-input bg-dark-100"
						required
					/>
				</div>

				<div className="mb-4">
					<textarea
						placeholder="Description du projet"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="w-full form-input bg-dark-100"
						rows="3"
					></textarea>
				</div>

				<button type="submit" disabled={loading || !title} className="btn bg-green-600 text-white hover:bg-green-400 disabled:opacity-50 transition duration-200">
					{loading ? "Creation..." : "Creer le Projet"}
				</button>
			</form>
		</div>
	);
};

export default ProjectForm;
