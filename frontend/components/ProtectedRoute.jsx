import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Le composant protectedRoute prend en argument les pages a proteger
const ProtectedRoute = ({element: Element}) => {
    const {isAuthenticated, loading} = useAuth();

    if(loading) {
        // Afficher un indicateur de chartgement pendant la verification du token
        return <div>Chargement ...</div>;
    }

    // Si l'utilisateur est authentifie, on affiche le composant (Element)
    if(isAuthenticated) {
        return Element;
    }

    // Si pas authentifie, on redirige vers la page de connexion
    return <Navigate to="/login" replace />;
};

export default ProtectedRoute;