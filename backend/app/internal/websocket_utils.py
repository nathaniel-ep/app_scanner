"""
Utilitaires pour la communication WebSocket avec l'application externe
"""
import asyncio
import websockets
import os


async def send_to_external_app(data: str, ip: str) -> int:
    """
    Envoie des données à l'application externe via WebSocket
    
    Args:
        data: Les données à envoyer
        ip: Le nom de la variable d'environnement contenant l'URI WebSocket
        
    Returns:
        0 si succès, 84 si erreur
    """
    uri = os.environ.get(ip)
    
    if not uri:
        print(f"Erreur: Variable d'environnement '{ip}' non configurée")
        return 84
    
    print(f"Tentative de connexion à : {uri}")
    
    try:
        async with websockets.connect(uri, ping_interval=20, ping_timeout=10) as websocket:
            await asyncio.wait_for(websocket.send(data), timeout=5.0)
            print("Envoyé à l'app externe :", data)
            
            try:
                ack = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                print(f"Confirmation reçue : {ack}")
            except asyncio.TimeoutError:
                print("Pas de confirmation reçue (normal si le serveur ne répond pas)")
                
    except asyncio.TimeoutError:
        print("Erreur: Timeout lors de l'envoi des données")
        return 84
    except websockets.exceptions.WebSocketException as e:
        print(f"Erreur WebSocket : {e}")
        return 84
    except Exception as e:
        print(f"Erreur inattendue : {type(e).__name__} - {e}")
        return 84
    
    return 0


async def ask_cid(message: str, ip: str) -> str:
    """
    Demande un CID à l'application externe via WebSocket
    
    Args:
        message: Le message à envoyer
        ip: Le nom de la variable d'environnement contenant l'URI WebSocket
        
    Returns:
        La réponse du serveur ou None en cas d'erreur
    """
    uri = os.environ.get(ip)
    
    if not uri:
        print(f"Erreur: Variable d'environnement '{ip}' non configurée")
        return None
    
    print(f"Tentative de connexion à : {uri}")
    
    try:
        async with websockets.connect(uri, ping_interval=20, ping_timeout=10) as websocket:
            await asyncio.wait_for(websocket.send(message), timeout=5.0)
            print("Envoyé à l'app externe :", message)
            
            response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
            print("Réponse de l'app :", response)
            
            if response[:3] == "ERR":
                print("Erreur reçue du serveur distant")
                return None
                
            return response
            
    except asyncio.TimeoutError:
        print("Erreur: Timeout lors de la communication")
        return None
    except websockets.exceptions.WebSocketException as e:
        print(f"Erreur WebSocket : {e}")
        return None
    except Exception as e:
        print(f"Erreur inattendue : {type(e).__name__} - {e}")
        return None


def format_message(db: list, cid: str) -> str:
    """
    Formate un message pour l'envoi à l'application externe
    
    Args:
        db: Liste des codes-barres
        cid: ID client
        
    Returns:
        Le message formaté
    """
    message = f"9;{cid};"
    elements = ""
    i = 0
    space = ""
    for data in db:
        elements += f"{space}{i + 1}|{data}"
        i += 1
        if i > 0:
            space = " "
    return message + elements
