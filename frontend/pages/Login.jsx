import { useEffect, useState } from "react";
import { useNavigate, Link, replace } from "react-router-dom";
import authService from "../services/authService";
import {useAuth} from "../hooks/useAuth";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const navigate = useNavigate();
	const {login} = useAuth();
	const {isAuthenticated} = useAuth();

	const handleLogin = async (e) => {
		e.preventDefault();
		setMessage("");

		try {
			// Connecter l'utilisateur
			const data = await login(email, password);

			// Si connexion reussie, redirection vers tableau de bord
			navigate("/dashboard", {replace: true});
		} catch (error) {
			setMessage(error.message || "Erreur lors de la connexion LoginPage.jsx");
		}
	};

	useEffect(() => {
		if(isAuthenticated) {
			navigate("/dashboard", {replace: true});
		}
	}, [isAuthenticated]);

	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<div className="max-w-md w-full bg-green-100 rounded-2xl shadow-2xl p-8">
				<h2 className="text-3xl font-bold text-center mb-8">Connexion</h2>

				{message && <div className="error-message">{message}</div>}

				<form action="" onSubmit={handleLogin} className="space-y-6">
					<input
						type="email"
						placeholder="Ex.: name@domain.com"
						className="w-full form-input bg-gray-300"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<input
						type="password"
						placeholder="Mot de passe"
						className="w-full form-input bg-gray-300"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
					<button type="submit" className="btn w-full py-3 bg-green-600 hover:bg-green-400 text-white font-bold transition duration-200">
						Se connecter
					</button>
				</form>

				<p className="text-center mt-6">
					Pas de compte ? {" "}
					<Link to="/register" className="text-green-900 hover:underline">
						S'inscrire
					</Link>
				</p>
			</div>
		</div>
	);
}
