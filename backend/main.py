from typing import Union
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi import FastAPI
from pydantic import BaseModel
import asyncio
import websockets
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

class User:
    def __init__(self, uid:int):
        self.uid:int = uid
        self.code:list = []
        self.cid:str = ""

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
load_dotenv("./.env")

user_counter = 0
uri = os.environ.get("IP_ADRESS")
cdb = []

async def send_to_external_app(data: str):
    try:
        async with websockets.connect(uri) as websocket:
            await websocket.send(data)
            print("Envoyé à l'app externe :", data)
            response = await websocket.recv()
            print("Réponse de l'app :", response)
    except Exception as e:
        print("Erreur WebSocket sortante:", e)
        return 84
    return 0

async def ask_cid(message:str):
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

@app.get("/", response_class=HTMLResponse)
def read_root():
    with open('static/index.html', "r") as f:
        return f.read()

@app.put("/add_items/{item_id}/{uid}")
def update_item(item_id: int, uid:int):
    for user in cdb:
        if user.uid == uid:
            if item_id in user.code:
                return {"message" : f"Le code-barre {item_id} deja pésent dans la liste."} 
            user.code.append(item_id)
    return {"message": f"Le code-barre {item_id} ajouté."}

@app.get("/finish_task/{uid}")
async def finish_task(uid:int):
    for user in cdb:
        if user.uid == uid:
            try:
                int(user.cid)
            except:
                return JSONResponse(content={"error" : "ID client vide."})
            message = format_message(user.code, user.cid)
            if len(user.code) < 1:
                return JSONResponse(content={"error": "La liste des données est vide"})
            res = await send_to_external_app(message)
            if res == 84:
                return JSONResponse(content={"error": "Envoi des données impossible"}, status_code=500)
            user.code.clear()
            user.cid = ""
            return {"message": "La tâche a été soumise avec succès. Vous pouvez maintenant fermer la page."}


@app.get("/get_client_id/{document_type}/{id}/{uid}")
async def get_client_id(document_type:int, id:int, uid:int):
    res = await ask_cid(str(document_type) + ";" + str(id))
    if res == None:
        return JSONResponse(content={"error": "Le client n'existe pas."}, status_code=404)
    for user in cdb:
        if user.uid == uid:
            user.cid = res.split(";")[1]
            return {"message" : res}

@app.get("/items/{uid}")
def get_all_items(uid:int):
    for user in cdb:
        if user.uid == uid:
            return {"item" : user.code}
    return JSONResponse(content={"error" : "utilisateur non trouvé."}, status_code=404)

@app.get("/clear_items/{uid}")
def clear_items(uid:int):
    for user in cdb:
        if user.uid == uid:
            user.code.clear()
            return {"message" :"La liste a bien été supprimée"}
    return JSONResponse(content={"error" : "utilisateur non trouvé."}, status_code=404)

@app.get("/delete_item/{item_id}/{uid}")
def delete_item(item_id:int, uid:int):
    for user in cdb:
        if user.uid == uid:
            if item_id in user.code:
                user.code.remove(item_id)
                return {"message": f"Le code-barre {item_id} a bien été supprimé"}
    return JSONResponse(content={"error" : "utilisateur non trouvé."}, status_code=404)

@app.get("/new_user_id")
def new_user_id():
    global user_counter
    user_counter += 1
    cdb.append(User(user_counter))
    print("Nouvelle connexion ID attribué:", user_counter)
    return {"userId": user_counter}
