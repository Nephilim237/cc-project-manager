import { createContext, useState } from 'react';
import authService from '../services/authService';

// 1. Creation du context
export const AuthContext = createContext();

// 2. Creation du provider (Fournisseur de l'etat)
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(authService.getCurrentUser());
    const [loading, setLoading] = useState(false); // Etat de chargement

    // Fonction pour gerer la connexion
    const login = async (email, password) => {
        setLoading(true);
        try {
            const data = await authService.login(email, password);
            setUser(data.user);
            setLoading(false);

            return data.user
        }catch(error) {
            setLoading(false);
            throw error;
        }
    };

    // Fonction pour gerer l'inscription
    const register = async (name, email, password) => {
        setLoading(true);
        try {
            const data = await authService.register(name, email, password);
            setUser(data.user);
            setLoading(false);

            return data.user;
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    // Fonction pour gerer la deconnexion
    const logout = () => {
        authService.logout();
        setUser(null);
    };

    // Fonction pour verifier le role de l'utilisateur
    const isAuthorized = (requiredRole) => {
        if(!user) return false;

        // La logique des permissions evoluera selon les besoins
        return user.role === requiredRole;
    }

    // L'objet qui sera partage par le contexte
    const contextValue = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthorized,
        isAuthenticated : !!user, // True si le user existe
    };

    return (
        // Le provider fournit la valeur du contexte a tous les composants enfants
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};