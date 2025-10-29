"""
Dépendances partagées de l'application
"""
from datetime import datetime, timedelta, timezone
from typing import List

# Constantes globales
SESSION_TIMEOUT = timedelta(minutes=10)

# Variables globales pour gérer les utilisateurs
user_counter = 0
cdb: List['User'] = []


class User:
    """
    Classe représentant un utilisateur de l'application
    """
    def __init__(self, uid: int):
        self.uid: int = uid
        self.code: list = []
        self.cid: str = ""
        self.timer = time_in_run()
        self.ipmode: str = "IP_ADDRESS"
        self.isadmin: bool = False


def time_in_run() -> datetime:
    """
    Retourne le temps actuel avec le fuseau horaire UTC+4
    """
    return datetime.now(timezone.utc) + timedelta(hours=4)


def get_user_by_id(uid: int) -> User | None:
    """
    Récupère un utilisateur par son ID
    """
    for user in cdb:
        if user.uid == uid:
            return user
    return None


def get_or_create_user(uid: int) -> User:
    """
    Récupère un utilisateur par son ID, ou le recrée s'il n'existe plus
    Utile quand une session a expiré côté serveur mais pas côté client
    """
    user = get_user_by_id(uid)
    if user:
        return user
    
    # L'utilisateur n'existe plus (session expirée), on le recrée avec le même UID
    print(f"Recréation de l'utilisateur {uid} (session expirée)")
    user = User(uid)
    cdb.append(user)
    
    # Mettre à jour le compteur si nécessaire
    global user_counter
    if uid > user_counter:
        user_counter = uid
    
    return user


def create_new_user() -> User:
    """
    Crée un nouvel utilisateur et l'ajoute à la base de données
    """
    global user_counter
    user_counter += 1
    user = User(user_counter)
    cdb.append(user)
    print(f"Nouvelle connexion - ID attribué: {user_counter}")
    return user


def remove_user(user: User) -> None:
    """
    Supprime un utilisateur de la base de données
    """
    user.code.clear()
    user.cid = ""
    if user in cdb:
        cdb.remove(user)
        print(f"Utilisateur {user.uid} supprimé")
