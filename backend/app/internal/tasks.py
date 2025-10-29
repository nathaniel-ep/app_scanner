"""
Tâches de fond pour la gestion des utilisateurs
"""
import asyncio
from app.dependencies import cdb, SESSION_TIMEOUT, time_in_run, remove_user


async def free_user():
    """
    Tâche de fond qui supprime les utilisateurs inactifs
    Vérifie toutes les 5 minutes
    """
    while True:
        await asyncio.sleep(5 * 60)
        
        # Créer une copie de la liste pour éviter les problèmes de modification pendant l'itération
        users_to_remove = []
        
        for user in cdb:
            elapsed_time = time_in_run() - user.timer
            print(f"user {user.uid}: timer: {elapsed_time}")
            
            if elapsed_time > SESSION_TIMEOUT:
                users_to_remove.append(user)
        
        # Supprimer les utilisateurs inactifs
        for user in users_to_remove:
            remove_user(user)
            print(f"Utilisateur {user.uid} supprimé pour inactivité")
