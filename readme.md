# Formation reactJS

## Presentation de la formation
    Lea formation vise a construire ici une application Collaborative de Gestion des Projets et de Communication en Interne dans une Entreprise.

### Fonctionnalités principales
1. Gestion des utilisateurs de des permissions
2. Gestion des taches et des projets
3. Systeme de communication en interne
4. Tableau de bord et reporting
5. Synchronisation bidirectionnelle offline/online

## Pre-requis
    Etre a l'aise avec le JavaScript et particulierement le standard ECMAScript 2020, Syntaxe dans laquelle on utilise tres souvent des fonctions fléchées.

## Outils necessaires
#### Node.js
    Qui est un environnement qui permet d'utiliser le JavaScript pour creer des applications côté serveur. Donc, de faire du backend

> Télécharger Node.js ici 👉 [Node.js](https://nodejs.org/en/download)

    Verifier la version Node.js: node --version ou node -v
    Verifier la version npm (Node Package Manager): npm --version ou npm -v

#### MongoDB & MongoDB Compass
    MongoDB est une base de donnees NoSQL tres populaire. Elle est plus flexible que les bases de donnees relationnelles telles que MySQL, PostgreSQL ...

> Telecharger MongoDB ici 👉 [MongoDB](https://www.mongodb.com/try/download/community)

    MongoDB Compass est l'interface graphique officielle pour MongoDB.
    Si MongoDB est le moteur qui stocke vos donnees, Compass est le tableau de bord qui vous permet de visualiser et de traiter ces donnees sans avoir a taper dans un terminal. Il est comparable a phpMyAdmin pour MySQL.

> Telecharger MongoDB Compass ici 👉 [MongoDB Compass](https://www.mongodb.com/try/download/compass)

#### Editeur de texte
Un editeur de votre choix fera l'affaire
> VS Code est fortement recommandé.

## Structure du projet
1. Un dossier backend (ou server) avec un fichier server.js a la racine. C'est dans ce dossier que sera traiter la partie Back de notre application
2. Un dossier frontend (ou client) dans lequel on fera la partie front de notre application

## Installation du projet
1. Ouvrir un nouveau terminal sur le bureau
2. Taper la commande ```> mkdir collab-app```, un dossier nommer collab-app se creera sur le bureau
3. Taper la commande ```> cd collab-app``` pour vous rendre dans le dossier collab-app nouvellement crée
4. Installer reactJS dans le dossier frontend avec la commande 

```> npm create vite@latest frontend -- --template react```

```> cd frontend```

```> npm install```

5. Sortir du dossier frontend avec la commande ```> cd ..```
6. Creer le dossier backend avec ```> mkdir backend```, se rendre dans backend ```> cd backend``` et taper la commande ```> npm init -y```
7. Dans backend, installer les packages suivants

```> npm install express mongoose dotenv cors bcryptjs jsonwebtoken```

```> npm install --save-dev nodemon```

8. Dans package.json, ajouter les lignes suivantes dans la section "scripts"
```json
"script": {
    "start": "node server.js",
    "dev": "nodemon server.js"
}
```

9. Dans le dossier frontend, installer ```> npm install -D tailwindcss @tailwindcss/vite```

10. Ajouter les lignes suivante dans vite.config.js pour configurer tailwindcss 
```javascript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        tailwindcss(),
    ]
})
```

## Test de l'installation
1. Ouvrir un terminal dans le dossier backend et taper la commande ```> npm run dev``` Nodemon va demarrer le serveur node sur l'url http://localhost:5000
2. Ouvrir un autre terminal dans le dossier frontend et taper la commande ```> npm run dev``` Vite va demarrer react sur l'url http://localhost:5173

Si tel est le cas, Felicitations, vous avez correctement installer reactJS.

## Debut de la formation


main          (branche principale - stable)
│
└── develop   (branche de développement - test)
    │
    ├── feature/US1-page-accueil
    ├── feature/US2-menu-navigation
    ├── feature/US3-recherche-covoiturage
    └── feature/US7-authentification
