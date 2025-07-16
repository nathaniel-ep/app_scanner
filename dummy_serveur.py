import asyncio
import websockets

# Base simulée de clients avec leur numéro de document
clients_db = {
    "5622632": {
        "entete_id": "12345",
        "code_client": "C001",
        "nom_client": "Dupont SARL",
        "date_piece": "2025-07-07 10:45",
        "reference": "REF-5622632"
    },
    "778899": {
        "entete_id": "67890",
        "code_client": "C045",
        "nom_client": "Tech Innov",
        "date_piece": "2025-07-08 14:30",
        "reference": "REF-778899"
    },
    "445566": {
        "entete_id": "89123",
        "code_client": "C112",
        "nom_client": "Green Solutions",
        "date_piece": "2025-07-09 09:15",
        "reference": "REF-445566"
    },
    # ... ajoute autant de clients que nécessaire
}

async def handle_client(websocket, path):
    async for message in websocket:
        print("Message reçu :", message)

        parts = message.strip().split(";")

        if len(parts) == 2:
            # Cas doVerif : type_document;numero_document
            type_doc, num = parts
            client_info = clients_db.get(num.strip())

            if client_info:
                response = f"OK;{client_info['entete_id']};{client_info['code_client']};{client_info['nom_client']};{client_info['date_piece']};{client_info['reference']}"
            else:
                response = "ERR;Client inconnu"

        elif len(parts) >= 3 and parts[0] == "9":
            # Cas doEnvoi : 9;entete_id;code1 code2 ...
            entete_id = parts[1]
            codes = parts[2]
            code_list = codes.strip().split()
            print(f"Réception de {len(code_list)} codes-barres pour entête {entete_id}: {codes}")
            response = f"RECU;{entete_id};{len(code_list)} codes reçus"

        else:
            response = "ERR;Format invalide"

        await websocket.send(response)
        print("Réponse envoyée :", response)

start_server = websockets.serve(handle_client, "0.0.0.0", 8765)

print("Serveur WebSocket fictif en écoute sur ws://0.0.0.0:8765...")
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
