# Démarrage rapide — MCFOI Scanner (bundle ZIP)

Ce guide explique comment initialiser et lancer l’application à partir de l’archive zip qui contient uniquement ce qu’il faut pour exécuter le backend avec le frontend déjà compilé.

Contenu attendu de l’archive:
- backend/static/ (frontend déjà build)
- backend/main.py
- backend/requirements.txt
- backend/websocket_utils.py
- init_app.sh
- start_app.sh


## Prérequis (Linux)
- Python 3.10+ (recommandé 3.12)
- python3-venv et pip
- Outils système de base (bash, coreutils)

Si besoin, installez-les:
```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip
```


## 1) Décompresser l’archive
Placez-vous dans le dossier où se trouve le zip puis:
```bash
unzip mcfoiscan.zip -d mcfoiscan
cd mcfoiscan
```


## 2) Initialiser l’environnement
La méthode la plus simple est d’utiliser le script fourni:
```bash
chmod +x init_app.sh
./init_app.sh
```
Ce script:
- crée (si besoin) un environnement virtuel Python dans `backend/`
- installe les dépendances Python via `backend/requirements.txt`

Alternative manuelle (si vous préférez):
```bash
cd backend
python3 -m venv .
source bin/activate
pip install -r requirements.txt
cd ..
```


## 3) Configurer les variables d’environnement (backend/.env)
Le backend lit les variables dans `backend/.env`.
Créez ce fichier avec au minimum l’URL WebSocket de la cible finale:
```bash
cat > backend/.env << 'EOF'
# Destination par défaut pour l’envoi des données via WebSocket
IP_ADDRESS="ws://ip_du_server:port"

# Optionnel: destination alternative de test, sélectionnable depuis l’UI
IP_TEST="ws://ip_de_test:port"

# Optionnel: mot de passe admin sous forme de hash MD5 (hexadécimal)
# Pour générer le hash: echo -n 'mon_mot_de_passe' | md5sum | cut -d' ' -f1
ADMIN_MDP="<hash_md5>"
EOF
```
Explications:
- IP_ADDRESS et IP_TEST sont lues par le backend selon le mode choisi: l’API utilise leur nom pour chercher la valeur correspondante.
- ADMIN_MDP: si configuré, permet d’activer le mode admin via une route protégée. La valeur attendue est le hash MD5 du mot de passe.


## 4) Lancer l’application
Avec le script fourni (recommandé):
```bash
chmod +x start_app.sh
./start_app.sh
```
Ce script active l’environnement virtuel et démarre le serveur FastAPI avec Uvicorn sur `0.0.0.0:8000`.

Lancement manuel (équivalent):
```bash
cd backend
source bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

Accès: ouvrez votre navigateur sur
- http://<adresse_IP_serveur>:8000


## À propos de l’application
- Le frontend est déjà présent dans `backend/static/`. La page d’accueil est servie depuis `GET /` et les assets via `/static`.
- Les WebSockets sortantes (vers votre application distante) utilisent les variables `IP_ADDRESS` ou `IP_TEST` du `.env`.


## Dépannage
- Permission denied sur les scripts:
  ```bash
  chmod +x init_app.sh start_app.sh
  ```
- uvicorn introuvable: activez d’abord l’environnement virtuel:
  ```bash
  source backend/mcfscan/bin/activate
  ```
- Erreurs de connexion WebSocket: vérifiez `backend/.env` et que l’URL est bien accessible depuis la machine (ex: pare-feu, réseau, port).
- Changer de destination depuis l’UI: l’API supporte deux modes `IP_ADDRESS` (prod) et `IP_TEST` (test), sélectionnés via l’interface.


## Sécurité (admin)
Si vous souhaitez activer le mode admin, définissez `ADMIN_MDP` avec le hash MD5 de votre mot de passe:
```bash
echo -n 'votre_mot_de_passe' | md5sum | cut -d' ' -f1
```
Copiez la valeur (32 caractères hex) dans `backend/.env`.


## Ce que vous n’avez PAS besoin de faire
- Aucun build frontend: tout est déjà dans `backend/static/`.
- Aucune installation npm: non nécessaire pour ce bundle d’exécution.

Bon démarrage ! 🚀
