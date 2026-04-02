import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import Register from "../pages/Register.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Login from "../pages/Login.jsx";
import Home from "../pages/Home.jsx";
import ProjectDetailsPage from "../pages/ProjectDetailsPage.jsx";

function App() {
	return (
		// BrowserRouter permet d'utiliser l'API 'historique' du navigateur pour le routage
		<BrowserRouter>
			{/* Routes Definit l'ensemble des chemins possibles */}
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />

				<Route path="/" element={<ProtectedRoute element={<Navigate to="/dashboard" replace />}/>} />

				{/* PROTECTION: seuls les utilisateurs connectes peuvent acceder au dashboard */}
				<Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />

				<Route path="/projects/:projectId" element={<ProtectedRoute element={<ProjectDetailsPage />} />} />


				<Route path="*" element={<div>404 Not Found</div>} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
