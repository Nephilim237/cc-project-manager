import User from "../models/User.js";

// @desc Recuperer tous les utilisateurs (sans les mots de passe)
// @route GET /api/users
// @access Private
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({isActive: true})
        .select("-password") // On n'envoie jamais le mot de passe
        .sort({name: 1}); // tri alphabetique

        res.json(users);
    } catch(error) {
        console.error(error);
        res.status(500).json({message: "Erreur serveur lors de la recuperation des utilisateurs"});
    }
};