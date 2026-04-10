import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000";

let socket = null;

// Initialiser la connexion WebSocket
export const connectSocket = (token) => {
	if (socket?.connected) return socket;

	socket = io(SOCKET_URL, {
		auth: { token },
		transports: ["websocket", "polling"],
	});

	socket.on("connect", () => {
		console.log("🔌 Socket connecte:", socket.id);
	});

	socket.on("connect_error", (error) => {
		console.log("❌ Erreur connexion socket:", error.message);
	});

	return socket;
};

// Recuperer l'instance socket existante
export const getSocket = () => socket;

// Deconnecter
export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
};
