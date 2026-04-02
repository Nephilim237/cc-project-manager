import { StrictMode } from "react";
import ReactDom from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "../context/authContext.jsx";

ReactDom.createRoot(document.getElementById("root")).render(
	<StrictMode>
		{/* Envelopper l'application avec le Authprovider pour rendre l'etat accessible partout */}
		<AuthProvider>
			<App />
		</AuthProvider>
	</StrictMode>
);
