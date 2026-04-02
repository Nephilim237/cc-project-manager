import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

// @desc Register new user
// @route POST /api/auth/register
// @access Public (Seul l'admin pourra le faire plus tard)
const registerUser = async (req, res) => {
	const { name, email, password, password2 } = req.body;

	try {
		// 1. Verifier si un utilisateur existe deja.
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({ message: "Cet utilisateur existe deja." });
		}

		// Hasher le mot de passe
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// 2. Creer une nouvelle instance de User
		const user = new User({
			name,
			email,
			password: hashedPassword,
		});

		// 3. Sauvegarder manuellement
		await user.save();

		// 4. Reponse en cas de succes
		res.status(201).json({
			token: generateToken(user._id, user.role),
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Erreur register: ", error);
		res.status(500).json({ message: "Erreur serveur", error: error.message });
	}
};

// @desc Login
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		// 1. Recuperer l'utilisateur qui essaie de se connecter
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: "Identifiants invalides" });
		}

		// 2. Comparer le mot de passe du formulaire a celui de la base de donnees
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Identifiants invalides" });
		}

		res.json({
			token: generateToken(user._id, user.role),
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Erreur du serveur lors de la connexion");
	}
};

export { registerUser, loginUser };
