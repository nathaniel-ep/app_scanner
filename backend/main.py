from typing import Union
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi import FastAPI
from pydantic import BaseModel
import asyncio
import websockets
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
load_dotenv("./.env")


db = []
uri = os.environ.get("IP_ADRESS")
cid = ""

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

def format_message():
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

@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id in db:
        return {"item" : item_id}

@app.put("/add_items/{item_id}/")
def update_item(item_id: int):
    for item in db:
        if item_id == item:
            return {"Already in"}
    db.append(item_id)
    return {"message": "Update ok"}

@app.get("/finish_task")
async def finish_task():
    global cid
    try:
        int(cid)
    except:
        return JSONResponse(content={"error" : "ID clien vide."})
    message = format_message()
    if len(db) < 1:
        return JSONResponse(content={"error": "La liste des données est vide"}, status_code=500)
    res = await send_to_external_app(message)
    if res == 84:
        return JSONResponse(content={"error": "Envoi des données impossible"}, status_code=500)
    db.clear()
    cid = ""
    return {"message": "Task finished"}

@app.get("/get_client_id/{document_type}/{id}")
async def get_client_id(document_type:int, id:int):
    global cid
    res = await ask_cid(str(document_type) + ";" + str(id))
    if res == None:
        return JSONResponse(content={"error": "Le client n'existe pas."}, status_code=402)
    cid = res.split(";")[1]
    return {"message" : res}

@app.get("/items/")
def get_all_items():
    return {"item" : db}
@app.get("/clear_items")
def clear_items():
    db.clear()
    return {"message" :"clearing list"}

@app.get("/delete_item/{item_id}")
def delete_item(item_id:int):
    if item_id in db:
        db.remove(item_id)
        return {"message": "Update ok"}
    return {"Not in"}