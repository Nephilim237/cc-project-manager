import axios from "axios";

// l'utilisation de la librairie Axios nous permet de gerer automatiquement
// le JSON.stringify, le Content-Type et le response.json

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth`;

const register = async (name, email, password, password2) => {
	try {
		// POST avec Axios : (URL, Body)
		const response = await axios.post(`${API_URL}/register`, {
			name,
			email,
			password,
			password2,
		});

		// Avec Axios, les donnees se trouvent directement dans response.data
		const { token, user } = response.data;

		// Stocker le token et les infos utilisateurs dans le localStorage pour la persistance
		localStorage.setItem("user", JSON.stringify(user));
		localStorage.setItem("token", token);

		return { token, user };
	} catch (error) {
		// Dans Axios, l'erreur d'API est dans error.response.data
		throw new Error(error.response?.data?.message || "Echec service inscription");
	}

	// return fetch(`${API_URL}/register`, {
	// 	method: "POST",
	// 	headers: {
	// 		"Content-Type": "application/json",
	// 	},
	// 	body: JSON.stringify({ name, email, password, password2 }),
	// })
	// 	.then((response) => {
	// 		if (!response.ok) {
	// 			// Gerer les erreurs 400, 500, ...
	// 			return response.json().then((error) => {
	// 				throw new Error(error.message || "Echec de l'inscription.");
	// 			});
	// 		}

	// 		return response.json();
	// 	})
	// 	.then((data) => {
	// 		// Stocker le token et les infos utilisateurs dans le localStorage pour la persistance
	// 		localStorage.setItem("user", JSON.stringify(data.user));
	// 		localStorage.setItem("token", data.token);

	// 		return data;
	// 	});
};

const login = async (email, password) => {
	const response = await fetch(`${API_URL}/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, password }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "Echec lors de la connexion");
	}

	const data = await response.json();
	localStorage.setItem("user", JSON.stringify(data.user));
	localStorage.setItem("token", data.token);

	return data;
};

const logout = () => {
	localStorage.removeItem("user");
	localStorage.removeItem("token");
};

const getCurrentUser = () => {
	try {
		const user = localStorage.getItem("user");
		return user ? JSON.parse(user) : null;
	} catch (error) {
		console.log(error.message);
		return null;
	}
};

export default { register, login, logout, getCurrentUser };
