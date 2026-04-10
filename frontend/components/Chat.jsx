import React, { useState, useEffect, useRef } from "react";
import { connectSocket, disconnectSocket, getSocket } from "../services/socketService";
import messageService from "../services/messageService";

const Chat = ({ projectId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null); // Pour le scoll automatique

    // Recuperer l'utilisateur connecte
    const currentUser = JSON.parse(localStorage.getItem("user"));

    // Scroll automatique vers le bas a chaque nouveau message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        // 1 Charger l'historique des gens
        const loadMessages = async () => {
            try {
                const history = await messageService.getMessages(projectId);
                setMessages(history);
            } catch (error) {
                setError("Erreur lors du chargement des messages.");
            } finally {
                setLoading(false);
            }
        };
        loadMessages();

        // 2. Connecter le socket et rejoindre le salon du projet
        const socket = connectSocket(token);
        socket.emit("join_project", projectId);

        // 3. Écouter les nouveaux messages
        socket.on("receive_message", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Nettoyage : quitter le salon quand on quitte la page
        return () => {
            const s = getSocket();
            if (s) {
                s.emit("leave_project", projectId);
                s.off("receive_message");
            }
        };
    }, [projectId]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const socket = getSocket();
        if (!socket?.connected) {
            setError("Connexion perdue. Veuillez recharger la page.");
            return;
        }

        socket.emit("send_message", {
            projectId,
            content: newMessage.trim(),
        });

        setNewMessage("");
    };

    // Envoyer avec la touche Entrée
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Formater l'heure du message
    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) return <div className="p-4 text-sm text-gray-500">Chargement du chat...</div>;

    return (
        <div className="flex flex-col h-96 bg-white rounded-lg shadow border border-gray-200">
            {/* En-tête */}
            <div className="px-4 py-3 border-b border-gray-200 bg-green-600 rounded-t-lg">
                <h3 className="text-white font-semibold text-sm">💬 Chat du projet</h3>
            </div>

            {/* Zone des messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {error && <p className="text-red-500 text-xs">{error}</p>}
                {messages.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center mt-8">
                        Aucun message. Soyez le premier à écrire !
                    </p>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender._id === currentUser?._id;
                        return (
                            <div
                                key={msg._id}
                                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                            >
                                {/* Nom de l'expéditeur */}
                                {!isMe && (
                                    <span className="text-xs text-gray-500 mb-1 ml-1">
                                        {msg.sender.name}
                                    </span>
                                )}
                                {/* Bulle du message */}
                                <div
                                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${isMe
                                            ? "bg-green-600 text-white rounded-br-none"
                                            : "bg-gray-100 text-gray-800 rounded-bl-none"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                                {/* Heure */}
                                <span className="text-xs text-gray-400 mt-1">
                                    {formatTime(msg.createdAt)}
                                </span>
                            </div>
                        );
                    })
                )}
                {/* Ancre pour le scroll automatique */}
                <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie */}
            <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
                <textarea
                    className="flex-1 form-input text-sm resize-none"
                    rows="1"
                    placeholder="Écrire un message... (Entrée pour envoyer)"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="btn btn-green btn-xs disabled:opacity-50 self-end"
                >
                    Envoyer
                </button>
            </div>
        </div>
    );
};

export default Chat;
