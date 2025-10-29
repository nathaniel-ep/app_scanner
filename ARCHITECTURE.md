# Architecture de l'application MCFOI Scanner

## Structure des dossiers

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Point d'entrée principal
│   ├── dependencies.py         # Modèles et fonctions partagées
│   ├── routers/                # Routes API
│   │   ├── __init__.py
│   │   ├── items.py           # Gestion des codes-barres
│   │   └── user.py            # Gestion des utilisateurs
│   └── internal/               # Utilitaires internes
│       ├── __init__.py
│       ├── tasks.py           # Tâches de fond
│       └── websocket_utils.py # Utilitaires WebSocket
├── static/                     # Frontend (HTML, CSS, JS)
├── .env                        # Variables d'environnement
└── requirements.txt
```

## Description des modules

### `app/main.py`
Point d'entrée de l'application FastAPI. Configure:
- Le cycle de vie de l'application (lifespan)
- Les routes statiques
- L'inclusion des routers
- La route racine servant le frontend

### `app/dependencies.py`
Contient les dépendances partagées:
- Classe `User`: modèle d'utilisateur
- Variables globales: `user_counter`, `cdb`, `SESSION_TIMEOUT`
- Fonctions utilitaires: `get_user_by_id()`, `create_new_user()`, etc.

### `app/routers/items.py`
Routes pour la gestion des codes-barres:
- `PUT /items/add/{item_id}/{uid}`: Ajouter un code-barres
- `GET /items/list/{uid}`: Lister les codes-barres
- `GET /items/clear/{uid}`: Effacer la liste
- `DELETE /items/delete/{item_id}/{uid}`: Supprimer un item
- `GET /items/finish_task/{uid}`: Finaliser et envoyer la tâche

### `app/routers/user.py`
Routes pour la gestion des utilisateurs:
- `GET /user/new`: Créer un nouvel utilisateur
- `GET /user/check_session/{uid}`: Mettre à jour la session
- `GET /user/get_client_id/{document_type}/{id}/{uid}`: Demander le CID
- `POST /user/change_dest/{uid}/{ipmode}`: Changer la destination
- `POST /user/sudo/{uid}/{mpass}`: Activer le mode admin
- `GET /user/isadmin/{uid}`: Vérifier le statut admin

### `app/internal/tasks.py`
Tâches de fond:
- `free_user()`: Purge automatique des utilisateurs inactifs (toutes les 5 min)

### `app/internal/websocket_utils.py`
Utilitaires WebSocket:
- `send_to_external_app()`: Envoie des données à l'app externe
- `ask_cid()`: Demande un CID à l'app externe
- `format_message()`: Formate les messages pour l'envoi

## Changements d'API

Les URLs ont été réorganisées avec des préfixes de router:

### Anciennes URLs → Nouvelles URLs

**Items:**
- `/add_items/{item_id}/{uid}` → `/items/add/{item_id}/{uid}`
- `/items/{uid}` → `/items/list/{uid}`
- `/clear_items/{uid}` → `/items/clear/{uid}`
- `/delete_item/{item_id}/{uid}` → `/items/delete/{item_id}/{uid}`
- `/finish_task/{uid}` → `/items/finish_task/{uid}`

**User:**
- `/new_user_id` → `/user/new`
- `/check_session/{uid}` → `/user/check_session/{uid}`
- `/get_client_id/{document_type}/{id}/{uid}` → `/user/get_client_id/{document_type}/{id}/{uid}`
- `/change_dest/{uid}/{ipmode}` → `/user/change_dest/{uid}/{ipmode}`
- `/sudo/{uid}/{mpass}` → `/user/sudo/{uid}/{mpass}`
- `/isadmin/{uid}` → `/user/isadmin/{uid}`

**Note:** Le frontend devra être mis à jour pour utiliser ces nouvelles URLs.

## Démarrage

```bash
# Initialisation (première fois)
./init_app.sh

# Démarrage
./start_app.sh
```

## Documentation API

Une fois l'application démarrée, la documentation interactive est disponible sur:
- Swagger UI: http://10.0.20.18:8081/docs
- ReDoc: http://10.0.20.18:8081/redoc
