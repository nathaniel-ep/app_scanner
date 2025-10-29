#!/bin/bash

echo "=== Démarrage de MCFOI Scanner ==="

if [[ ! -d "backend" ]]; then
    echo "Erreur: Le dossier 'backend' n'existe pas."
    echo "Assurez-vous d'exécuter ce script depuis le dossier racine de l'application."
    exit 1
fi

cd backend

if [[ ! -f "bin/activate" ]]; then
    echo "Erreur: L'environnement virtuel n'existe pas."
    echo "Veuillez d'abord exécuter: ./init_app.sh depuis la racine de l'application."
    exit 1
fi

source bin/activate

if ! command -v uvicorn &> /dev/null; then
    echo "Erreur: uvicorn n'est pas installé."
    echo "Veuillez exécuter: ./init_app.sh"
    exit 1
fi

if [[ ! -f ".env" ]]; then
    echo "Warning: Le fichier .env n'existe pas."
    echo "L'application peut ne pas fonctionner correctement sans configuration."
    echo "Consultez le README.md section 3 pour créer le fichier .env"
    echo ""
fi

echo "Démarrage du serveur sur http://10.0.20.18:8081"
uvicorn app.main:app --host 10.0.20.18 --port 8081
