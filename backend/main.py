from typing import Union
from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import asyncio
from pydantic import BaseModel
from websocket_utils import send_to_external_app, format_message, ask_cid
from datetime import datetime, timedelta, timezone

#Définition des variable global accesible a toutes les routes et fonction
SESSION_TIMEOUT = timedelta(minutes=1)
user_counter = 0
cdb = []

# Création d'un objet User pour gerer les différents utilisateurs qui utiliseront l'application
class User:
    def __init__(self, uid:int):
        self.uid:int = uid
        self.code:list = []
        self.cid:str = ""
        self.timer = datetime.now(timezone.utc) + timedelta(hours=4)

# foncion utilisé dans l'API
def time_in_run():
    return datetime.now(timezone.utc) + timedelta(hours=4)

async def free_user():
    while True:
        await asyncio.sleep(60)
        for user in cdb:
            print(f"user {user.uid}: timer: {time_in_run() - user.timer} > {SESSION_TIMEOUT}")
            if time_in_run() - user.timer > SESSION_TIMEOUT:
                print(user.uid, "supprimé")
                user.code.clear()
                user.cid = ""
                cdb.remove(user)

# Configuration API
@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(free_user())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("Tâche de purge arrêtée proprement.")

app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Routes API
@app.get("/", response_class=HTMLResponse)
def read_root():
    with open('static/index.html', "r") as f:
        return f.read()

@app.put("/add_items/{item_id}/{uid}")
def update_item(item_id: int, uid:int):
    for user in cdb:
        if user.uid == uid:
            if item_id in user.code:
                return {"message" : f"Le code-barres {item_id} deja pésent dans la liste."} 
            user.code.append(item_id)
    return {"message": f"Le code-barres {item_id} ajouté."}

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
        print(user.uid)
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
                return {"message": f"Le code-barres {item_id} a bien été supprimé"}
    return JSONResponse(content={"error" : "utilisateur non trouvé."}, status_code=404)

@app.get("/new_user_id")
def new_user_id():
    global user_counter
    user_counter += 1
    cdb.append(User(user_counter))
    print("Nouvelle connexion ID attribué:", user_counter)
    return {"userId": user_counter}

@app.get("/check_session/{uid}")
def check_session(uid: int):
    print("en vie", uid)
    for user in cdb:
        if user.uid == uid:
            user.timer = time_in_run()