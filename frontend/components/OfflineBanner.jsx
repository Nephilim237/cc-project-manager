import React, { useEffect, useState } from "react";
import useOnlineStatus from "../hooks/useOnlineStatus";

const OfflineBanner = () => {
    const isOnline = useOnlineStatus();
    const [showBanner, setShowBanner] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setShowBanner(true);
            setWasOffline(true);
        } else if (wasOffline) {
            // l'utilisateur vient de se reconnecter
            // On affiche un message de reconnexion pendant 3 sescondes
            setShowBanner(true);
            const timer = setTimeout(() => {
                setShowBanner(false);
                setWasOffline(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline]);

    if (!showBanner) return null;

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 text-center text-sm font-semibold transition-all duration-300 ${
                isOnline ? "bg-green-500 text-white" : "bg-red-500 text-white" 
                }`}
        >
            {isOnline ? (
                <span>✅ Connexion retablie - vos donnees ont ete mises a jour</span>
            ) : (
                <span>⚠️ Connexion perdue - vos donnees seront mises a jour une fois connecte</span>
            )}
        </div>
    );
};

export default OfflineBanner;