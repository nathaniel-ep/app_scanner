import asyncio
import websockets
from dotenv import load_dotenv
import os

load_dotenv("./.env")

async def send_to_external_app(data: str, ip:str):
    uri = os.environ.get(ip)
    try:
        async with websockets.connect(uri) as websocket:
            await websocket.send(data)
            print("Envoyé à l'app externe :", data)
    except Exception as e:
        print("Erreur WebSocket sortante:", e)
        return 84
    return 0

async def ask_cid(message:str, ip:str):
    uri = os.environ.get(ip)
    try:
        async with websockets.connect(uri) as websocket:
            await websocket.send(message)
            print("Envoyé à l'app externe :", message)
            response = await websocket.recv()
            print("Réponse de l'app :", response)
            if response[:3] == "ERR":
                return None
    except Exception as e:
        print("Erreur WebSocket sortante:", e)
        return None
    return response

def format_message(db:list, cid:str):
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