"""
Router pour la gestion des utilisateurs
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.dependencies import create_new_user, get_or_create_user, time_in_run
from app.internal.websocket_utils import ask_cid
import os
from hashlib import md5

router = APIRouter(
    prefix="/user",
    tags=["user"],
)


@router.get("/new")
def new_user_id():
    """
    Crée un nouvel utilisateur et retourne son ID
    """
    user = create_new_user()
    return {"userId": user.uid}


@router.get("/check_session/{uid}")
def check_session(uid: int):
    """
    Met à jour le timestamp de session d'un utilisateur
    """
    user = get_or_create_user(uid)
    
    user.timer = time_in_run()
    return {"message": "Session mise à jour"}


@router.get("/get_client_id/{document_type}/{id}/{uid}")
async def get_client_id(document_type: int, id: int, uid: int):
    """
    Demande le CID client à l'application externe
    """
    user = get_or_create_user(uid)
    
    res = await ask_cid(str(document_type) + ";" + str(id), user.ipmode)
    
    if res is None:
        return JSONResponse(content={"error": "Le client n'existe pas."}, status_code=404)
    
    user.cid = res.split(";")[1]
    return {"message": res}


@router.post("/change_dest/{uid}/{ipmode}")
def change_dest(uid: int, ipmode: int):
    """
    Change le destinataire des données (IP_ADDRESS ou IP_TEST)
    """
    user = get_or_create_user(uid)
    
    modes = ["IP_ADDRESS", "IP_TEST"]
    
    if ipmode not in [0, 1]:
        raise HTTPException(status_code=400, detail="Mode invalide (0 ou 1)")
    
    user.ipmode = modes[ipmode]
    return {"message": "Destinataire changé avec succès."}


@router.post("/sudo/{uid}/{mpass}")
def my_sudo(uid: int, mpass: str):
    """
    Active le mode admin pour un utilisateur
    """
    user = get_or_create_user(uid)
    
    mdp = os.environ.get("ADMIN_MDP")
    
    if not mdp:
        return JSONResponse(content={"error": "Mode admin non configuré"}, status_code=503)
    
    hash_input = md5(mpass.encode()).hexdigest()
    print(f"Hash reçu: {hash_input}")
    print(f"Hash attendu: {mdp}")
    
    if hash_input == mdp:
        user.isadmin = True
        return {"message": "Mode admin activé"}
    
    return JSONResponse(content={"error": "Mauvais mot de passe"}, status_code=401)


@router.get("/isadmin/{uid}")
def is_admin(uid: int):
    """
    Vérifie si un utilisateur est admin
    """
    user = get_or_create_user(uid)
    
    if user.isadmin:
        return {"message": "admin ok"}
    
    return JSONResponse(content={"error": "Not admin"}, status_code=401)
