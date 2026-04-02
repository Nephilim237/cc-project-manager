import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";

export default function Register() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [password2, setPassword2] = useState("");
	const [message, setMessage] = useState("");
	const navigate = useNavigate();

	const handleRegister = async (e) => {
		e.preventDefault();
		setMessage("");

		try {
			if (password !== password2) {
				return setMessage("Les mots de passe ne sont pas identiques");
			}

			await authService.register(name, email, password, password2);

			// Si inscription ok, redirection vers formulaire de connexion
			navigate("/login");
		} catch (error) {
			setMessage(error.message || "Erreur lors de l'inscription Register.jsx");
		}
	};

	return (
		<div className="container-lg min-h-screen bg-white flex items-center justify-center px-4">
			<div className="max-w-md grid-cols-8 gap-4 bg-green-100 rounded-2xl shadow-2xl p-8">
				<h2 className="text-3xl font-bold text-center mb-8">Creer un compte</h2>

				{message && <div className="error-message">{message}</div>}

				<form action="" onSubmit={handleRegister} className="space-y-6">
					<input
						type="text"
						placeholder="Nom Complet"
						className="form-input w-full bg-dark-300"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
					<input
						type="email"
						placeholder="Ex.: name@domain.com"
						className="form-input w-full bg-dark-300"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<input
						type="password"
						placeholder="Mot de passe"
						className="form-input w-full bg-dark-300"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
					<input
						type="password"
						placeholder="Confirmer le mot de passe"
						className="form-input w-full bg-dark-300"
						value={password2}
						onChange={(e) => setPassword2(e.target.value)}
						required
					/>
					<button type="submit" className="btn bg-green-600 hover:bg-green-400 text-white font-bold transition duration-200 w-full">
						S'inscrire
					</button>
				</form>

				<p className="text-center mt-6">
					Deja un compte ?{" "}
					<Link to="/login" className="text-green-900">
						Se connecter
					</Link>
				</p>
			</div>
		</div>
	);
}
