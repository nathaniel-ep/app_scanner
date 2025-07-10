# 🧾 Projet Scanner MCFOI

Ce projet est une application web permettant de scanner des codes-barres.  
L'interface utilisateur est développée en **React + TypeScript + TailwindCSS**, le backend en **FastAPI** (Python) et les deux sont intégrés ensemble dans un seul serveur grâce à `uvicorn`.

---

## 📁 Structure du projet

```
.
├── backend/              # Serveur FastAPI
│   ├── main.py           # Point d'entrée backend
│   ├── requirements.txt  # Dépendances backend
│   └── static/           # Contient les fichiers du frontend buildé
└── frontend/             # Code source React
    ├── src/              # Composants React
    ├── public/           # Fichiers publics
    ├── index.html        # Page HTML principale
    └── package.json      # Dépendances frontend
```

---

## ⚙️ Technologies utilisées

### 🧠 Frontend
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

### 🧠 Backend
- [FastAPI](https://fastapi.tiangolo.com/)
- [Uvicorn](https://www.uvicorn.org/)

---

## 🌐 Structure des routes

### Backend (`FastAPI`)
| Route                          | Méthode | Description                          |
|--------------------------------|---------|--------------------------------------|
| `/items/`                      | GET     | Récupère la liste actuelle des items |
| `/add_items/{{id}}`            | PUT     | Ajoute un item                       |
| `/delete_item/{{id}}`          | GET     | Supprime un item                     |
| `/finish_task`                 | GET     | Finalise la tâche courante           |
| `/clear_items`                 | GET     | Supprime tous les items              |
| `/get_client_id/{{opt}}/{{id}}`| GET     | Recherche un client                  |

---

## 📚 Bibliothèques principales

### Frontend :
- `react`, `react-dom`
- `vite`
- `tailwindcss`
- `lucide-react` (icônes)

### Backend :
- `fastapi`
- `uvicorn`
- `typing`, `asyncio`, `websockets` etc.

---

## 🚀 Lancer le projet localement (Linux)

### Pour initialiser la machine et installer toutes les dépendances nécessaires :
```bash
./init_server.sh
```

# ou le faire à la main avec les étapes suivantes

## Sur une nouvelle machine
Installation de `python`, `npm`, `python3-venv`, `git`

```bash
sudo apt install git
sudo apt install python3
sudo apt install python3-venv
sudo apt install npm
```

### 1. Cloner le projet
```bash
git clone <url_du_repo>
cd projet-scanner
```

---

### 2. Installer les dépendances

#### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
```

---

### Les étapes 3 et 4 sont à faire uniquement si un changement a été fait dans le frontend

### 3. Build du frontend
Toujours dans le dossier frontend/
```bash
npm run build
```

Le contenu du build sera généré dans `frontend/dist`.

---

### 4. Copier le build dans le backend
Depuis le dossier frontend/
```bash
rm -r ../backend/static/*
cp -r dist/* ../backend/static/
```
Depuis la racine
```bash
rm -r backend/static/*
cp -r frontend/dist/* backend/static/
```

### Lancer le script `build_front.sh` depuis la racine du repo

```bash
cd backend/
./build_front.sh
```

### ou pour le faire à la main :

Dans `backend/static/index.html`, ajoutez `/static` avant `/assets` pour les deux fichiers `.js` et `.css` :

avant :

```html
<script type="module" crossorigin src="/assets/index-D-TihDcz.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-C6G_3qQV.css">
```
après :

```html
<script type="module" crossorigin src="/static/assets/index-D-TihDcz.js"></script>
<link rel="stylesheet" crossorigin href="/static/assets/index-C6G_3qQV.css">
```

> 📌 **Important :** toute modification du frontend doit se faire dans le dossier `frontend/`, puis il faut recompiler avec `npm run build` et recopier dans `backend/static/`.

### 5. Créer l'environnement
L'adresse IP du serveur vers lequel on envoie les WebSocket n'est pas directement inscrite dans le code. Il faut donc créer une variable d'environnement nommée IP_ADDRESS :

```bash
cd backend/
echo -ne "IP_ADDRESS=\"ws://ip_du_server:port\"" > .env
```

### 6. Lancer le serveur pour test
```bash
cd backend
uvicorn main:app --reload
```

### 7. Lancer l'app avec le script `start_app.sh` depuis la racine du repo

```bash
./start_app.sh
```

### Lancer le serveur pour prod
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

| Élément          | Explication                                                                                                                                                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uvicorn`        | Commande pour lancer le serveur ASGI (Asynchronous Server Gateway Interface). Uvicorn est un serveur léger et rapide pour les applications Python asynchrones comme FastAPI.                                                                       |
| `main:app`       | Spécifie le module et l'objet de l'application : <br> - `main` : correspond au fichier `main.py` (sans l’extension `.py`) <br> - `app` : correspond à l'instance FastAPI déclarée dans ce fichier, typiquement : `app = FastAPI()`                 |
| `--host 0.0.0.0` | Permet à l'application d'être accessible depuis **n'importe quelle adresse IP**, pas uniquement `localhost` (127.0.0.1). Cela est **indispensable pour un accès réseau** (depuis un autre appareil ou en production).                              |
| `--port 8000`    | Définit le **port d'écoute** du serveur. Par défaut, FastAPI utilise le port `8000`. Cela signifie que l'application sera accessible sur : `http://adresse_IP:8000`                                                                                 |
| `--reload`       | Active le **rechargement automatique** : <br> - À chaque modification du code source, le serveur redémarre automatiquement. <br> - Très utile **en phase de développement**, mais **à éviter en production** car cela consomme plus de ressources. |


Accédez ensuite à l'application sur :  
📍 `http://<adresse_IP>:8000`

---

## 🧪 Tester l'application

- 📦 Ajouter un item : champ d’ID + bouton "Ajouter"
- 🔎 Rechercher un client : radio bouton + champ ID + bouton "Rechercher"
- 🗑️ Supprimer un item
- ✅ Finaliser tâche
- 🔄 Vider la liste

---

## 💡 Bonnes pratiques

- **Ne jamais modifier directement les fichiers dans `backend/static/`**, toujours passer par :
  ```bash
  cd frontend
  npm run build
  cp -r dist/* ../backend/static/
  ```
- Pensez à activer l’environnement virtuel Python avant chaque lancement backend :
  ```bash
  source venv/bin/activate
  ```

---
