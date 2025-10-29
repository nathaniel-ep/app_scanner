"""
Point d'entrée principal de l'application MCFOI Scanner
"""
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import asyncio
from dotenv import load_dotenv

from app.internal.tasks import free_user
from app.routers import items, user

# Charger les variables d'environnement
load_dotenv('./.env')


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestion du cycle de vie de l'application
    Lance les tâches de fond au démarrage et les arrête proprement à l'arrêt
    """
    # Démarrage: lancer la tâche de purge des utilisateurs inactifs
    task = asyncio.create_task(free_user())
    print("Tâche de purge des utilisateurs démarrée")
    
    yield
    
    # Arrêt: annuler proprement la tâche
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("Tâche de purge arrêtée proprement")


# Créer l'application FastAPI
app = FastAPI(
    title="MCFOI Scanner API",
    description="API pour la gestion des scans de codes-barres et l'envoi vers une application externe",
    version="1.0.0",
    lifespan=lifespan
)

# Monter les fichiers statiques (frontend)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Inclure les routers
app.include_router(items.router)
app.include_router(user.router)


@app.get("/", response_class=HTMLResponse)
def read_root():
    """
    Sert la page HTML principale
    """
    with open('static/index.html', "r") as f:
        return f.read()


@app.get("/health")
def health_check():
    """
    Endpoint de vérification de l'état de l'application
    """
    return {"status": "ok", "message": "MCFOI Scanner API is running"}
