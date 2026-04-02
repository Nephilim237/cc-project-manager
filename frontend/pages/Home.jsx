import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
    // Le useAuth nous permet de determiner si un tuilisateur est deja connecte

    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-green-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-4xl w-full text-center">
                <header className="mb-10">
                    <h1 className="text-5xl font-heading font-extrabold mb-6 text-dark-500">
                        Bienvenue sur la Plateforme <br />
                        <span className=" text-green-500"> G</span>.
                        <span className=" text-yellow-500">L</span>.
                        <span className=" text-green-500">C</span>
                    </h1>
                    <h3 className="text-2xl text-dark-700 font-extrabold">
                        <span className="text-green-500">Gestion </span> -
                        <span className="text-yellow-500"> Liaison </span> -
                        <span className="text-green-500"> Collaboration</span>
                    </h3>
                    <p className="text-lg text-dark-500">
                        Votre solution simple pour gerer les projets, organiser les taches et collaborer efficacement en equipe
                    </p>
                </header>

                <main className="mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {/* Caracteristique 1 */}
                        <div className="p-6 bg-green-100 shadow-lg rounded-lg border-t-4 border-green-500">
                            <h3 className="text-xl font-semibold text-dark-300 uppercase mb-2">Gestion des Membres</h3>
                            <p className="text-dark-500">Creez des projets, assignez des responsables et gerer les membres d'equipes efficacement</p>
                        </div>

                        {/* Caracteristique 2 */}
                        <div className="p-6 bg-yellow-100 shadow-lg rounded-lg border-t-4 border-yellow-500">
                            <h3 className="text-xl font-semibold text-dark-300 uppercase mb-2">Suivi des Taches</h3>
                            <p className="text-dark-500">Organiser les taches par statut (To-Do, En cours, fait) et par priorite</p>
                        </div>

                        {/* Caracteristique 1 */}
                        <div className="p-6 bg-green-100 shadow-lg rounded-lg border-t-4 border-green-500">
                            <h3 className="text-xl font-semibold text-dark-300 uppercase mb-2">Collaboration Securisee</h3>
                            <p className="text-dark-500">Seuls les membres autorises peuvent acceder et modifier des donnees du projet.</p>
                        </div>
                    </div>
                </main>

                {/* CTA Section */}
                <footer className="mt-10">
                    {isAuthenticated ? (
                        <Link
                            to="/dashboard"
                            className="inline-block px-10 py-3 text-lg font-medium text-white bg-green-500 rounded-full hover:bg-green-700 transition duration-300 shadow-md"
                        >
                            Acceder au tableau de bord
                        </Link>
                    ) : (
                        <div className="space-x-4">
                            <Link
                                to="/login"
                                className="inline-block px-10 py-3 text-lg font-medium text-white bg-green-500 rounded-full hover:bg-green-700 transition duration-300 shadow-md"
                            >
                                Se Connecter
                            </Link>
                            <Link
                                to="/register"
                                className="inline-block px-10 py-3 text-lg font-medium bg-yellow-500 rounded-full hover:bg-yellow-700 text-text transition duration-300 shadow-md"
                            >
                                S'inscrire
                            </Link>
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
}
