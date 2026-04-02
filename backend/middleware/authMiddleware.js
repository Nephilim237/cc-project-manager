import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * @description Middleware pour verifier le JWT et proteger les routes.
 * Utilise la fonction next() pour passer au controleur si le token est valide
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const protect = async (req, res, next) => {
	let token;

	// 1. REcuperer le token dans l'en-tete (standard: 'Bearer TOKEN')
	if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
		try {
			// Extraction du token (retirer le prefixe 'Bearer')
			token = req.headers.authorization.split(" ")[1];

			// 2. Verification du token
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// 3. Ajouter l'id et le role de l'utilisateur pour 
			// que le controleur suivant puisse l'utiliser
			req.user = {id: decoded.id, role: decoded.role};
			next();
		} catch (error) {
			res.status(401).json({ message: "Acces non autorise: token invalide ou expire" });
		}
	}

	if (!token) {
		res.status(401).json({ message: "Acces non autorise: token manquant" });
	}
};
export { protect };
