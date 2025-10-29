"""
Router pour la gestion des items (codes-barres)
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.dependencies import get_or_create_user
from app.internal.websocket_utils import send_to_external_app, format_message, ask_cid

router = APIRouter(
    prefix="/items",
    tags=["items"],
)


@router.put("/add/{item_id}/{uid}")
def add_item(item_id: str, uid: int):
    """
    Ajoute un code-barres à la liste de l'utilisateur
    """
    user = get_or_create_user(uid)
    
    if item_id in user.code:
        return {"message": f"Le code-barres {item_id} déjà présent dans la liste."}
    
    user.code.append(item_id)
    return {"message": f"Le code-barres {item_id} ajouté."}


@router.get("/list/{uid}")
def get_all_items(uid: int):
    """
    Récupère tous les items d'un utilisateur
    """
    user = get_or_create_user(uid)
    
    return {"item": user.code}


@router.delete("/clear/{uid}")
def clear_items(uid: int):
    """
    Supprime tous les items d'un utilisateur
    """
    user = get_or_create_user(uid)
    
    user.code.clear()
    return {"message": "La liste a bien été supprimée"}


@router.delete("/delete/{item_id}/{uid}")
def delete_item(item_id: str, uid: int):
    """
    Supprime un item spécifique de la liste d'un utilisateur
    """
    user = get_or_create_user(uid)
    
    if item_id not in user.code:
        raise HTTPException(status_code=404, detail="Code-barres non trouvé dans la liste")
    
    user.code.remove(item_id)
    return {"message": f"Le code-barres {item_id} a bien été supprimé"}


@router.post("/finish_task/{uid}")
async def finish_task(uid: int):
    """
    Finalise et envoie la tâche à l'application externe
    """
    user = get_or_create_user(uid)
    
    # Vérifier que le CID est valide
    try:
        int(user.cid)
    except:
        return JSONResponse(content={"error": "ID client vide."}, status_code=302)
    
    # Vérifier que la liste n'est pas vide
    if len(user.code) < 1:
        return JSONResponse(content={"error": "La liste des données est vide"}, status_code=302)
    
    # Formater et envoyer le message
    message = format_message(user.code, user.cid)
    res = await send_to_external_app(message, user.ipmode)
    
    if res == 84:
        return JSONResponse(content={"error": "Envoi des données impossible"}, status_code=500)
    
    # Réinitialiser l'utilisateur
    user.code.clear()
    user.cid = ""
    
    return {"message": "La tâche a été soumise avec succès. Vous pouvez maintenant fermer la page."}
