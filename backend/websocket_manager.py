from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # user_id -> list of active connections (a user might have multiple tabs)
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"WS: User {user_id} connected. Active connections: {len(self.active_connections[user_id])}")

    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            print(f"WS: User {user_id} disconnected.")
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast_to_user(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            print(f"WS: Broadcasting to user {user_id} ({len(self.active_connections[user_id])} connections)")
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"WS: Error broadcasting to user {user_id}: {e}")
        else:
            print(f"WS: User {user_id} is not connected. Broadcast skipped.")

manager = ConnectionManager()
