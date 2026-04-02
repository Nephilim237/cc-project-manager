import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connection from "./config/db.js";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json()); // Permet de traiter le corps des requetes en JSON (pour les POST/PUT)
// app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: "*",
	}),
); // Autorise le frontend a faire des requetes (meme port que react)

// Route de base
app.get("/", (req, res) => {
	res.send({ message: "API BTS Gestion des taches collaboratives" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// Connexion MongoDB
connection();

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`🚀 Serveur backend sur le port ${PORT}`);
	console.log(`🔗 Accedez a : http://localhost:${PORT}`);
});
