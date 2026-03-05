"""WebSocket connection manager for real-time health and alert broadcasts."""
import asyncio
import json
from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        # animal_id -> list of websockets
        self._health_sockets: dict[int, list[WebSocket]] = defaultdict(list)
        # user_id -> list of websockets
        self._alert_sockets: dict[int, list[WebSocket]] = defaultdict(list)

    # ── Health channel ────────────────────────────────────────────────────────

    async def connect_health(self, websocket: WebSocket, animal_id: int) -> None:
        await websocket.accept()
        self._health_sockets[animal_id].append(websocket)

    def disconnect_health(self, websocket: WebSocket, animal_id: int) -> None:
        self._health_sockets[animal_id].discard(websocket) \
            if hasattr(self._health_sockets[animal_id], "discard") \
            else self._health_sockets[animal_id].remove(websocket)

    async def broadcast_health(self, animal_id: int, data: dict) -> None:
        dead: list[WebSocket] = []
        for ws in list(self._health_sockets[animal_id]):
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._health_sockets[animal_id].remove(ws)

    # ── Alert channel ─────────────────────────────────────────────────────────

    async def connect_alerts(self, websocket: WebSocket, user_id: int) -> None:
        await websocket.accept()
        self._alert_sockets[user_id].append(websocket)

    def disconnect_alerts(self, websocket: WebSocket, user_id: int) -> None:
        try:
            self._alert_sockets[user_id].remove(websocket)
        except ValueError:
            pass

    async def broadcast_alert(self, user_id: int, data: dict) -> None:
        dead: list[WebSocket] = []
        for ws in list(self._alert_sockets[user_id]):
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._alert_sockets[user_id].remove(ws)

    async def broadcast_alert_all_admins(self, admin_ids: list[int], data: dict) -> None:
        for uid in admin_ids:
            await self.broadcast_alert(uid, data)


ws_manager = ConnectionManager()
