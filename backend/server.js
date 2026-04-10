import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connection from "./config/db.js";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Message } from "./models/Message.js";
import User from "./models/User.js";

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
app.use("/api/messages", messageRoutes);

// Connexion MongoDB
connection();

// Creer le serveur HTTP a partir d'Express
const httpServer = createServer(app);

// Initialiser socket.io sur le meme serveur http
const io = new Server(httpServer, {
	cors: { origin: "*" },
});

// Middleware socket.io pour verifier le token jwt a la connexion
io.use((socket, next) => {
	const token = socket.handshake.auth.token;
	if (!token) {
		return next(new Error("Token manquant!"));
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		socket.user = decoded; // {role, id}
		next();
	} catch (error) {
		return next(new Error("Token invalide."));
	}
});

// gestion des evenements webSocket
io.on("connection", async (socket) => {
	console.log(`🔌 Utilisateur connecte: ${socket.user.id}`);

	// Rejoindre un salon de projet
	socket.on("join_project", (projectId) => {
		socket.join(projectId);
		console.log(`👥 ${socket.user.id} a rejoint le projet ${projectId}`);
	});

	// Quitter un salon de projet
	socket.on("leave_project", (projectId) => {
		socket.leave(projectId);
		console.log(`🚪 ${socket.user.id} a quitte le projet ${projectId}`);
	});

	// Recevoir et diffuser un message
	socket.on("send_message", async (data) => {
		const { projectId, content } = data;

		if (!content || !content.trim()) return;

		try {
			// sauvegarder le message en base de donnees
			const message = new Message({
				content: content.trim(),
				sender: socket.user.id,
				project: projectId,
			});
			await message.save();

			// Peupler les informations du destinateur
			const populated = await Message.findById(message._id).populate("sender", "name email role");

			// diffuser a tous les membres du salon
			io.to(projectId).emit("receive_message", populated);
		} catch (error) {
			console.error("Erreur lors de l'envoie du message:", error);
		}
	});

	socket.on("disconnect", () => {
		console.log(`❌ Utilisateur deconnecte : ${socket.user.id}`);
	});
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
	console.log(`🚀 Serveur backend sur le port ${PORT}`);
	console.log(`🔗 Accedez a : http://localhost:${PORT}`);
});
