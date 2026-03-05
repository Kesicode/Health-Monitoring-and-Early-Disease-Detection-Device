from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models.animal import Animal
from app.models.user import User
from app.services.ws_manager import ws_manager

router = APIRouter(tags=["websocket"])


async def _verify_ws_token(token: str, db: Session) -> User | None:
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None
        user = db.get(User, int(payload["sub"]))
        return user if user and user.is_active else None
    except (JWTError, ValueError):
        return None


@router.websocket("/ws/health/{animal_id}")
async def ws_health(
    websocket: WebSocket,
    animal_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    user = await _verify_ws_token(token, db)
    if not user:
        await websocket.close(code=4001)
        return

    animal = db.get(Animal, animal_id)
    if not animal or (animal.owner_id != user.id and user.role != "admin"):
        await websocket.close(code=4003)
        return

    await ws_manager.connect_health(websocket, animal_id)
    try:
        while True:
            await websocket.receive_text()  # keep-alive
    except WebSocketDisconnect:
        ws_manager.disconnect_health(websocket, animal_id)


@router.websocket("/ws/alerts/{user_id}")
async def ws_alerts(
    websocket: WebSocket,
    user_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    user = await _verify_ws_token(token, db)
    if not user or (user.id != user_id and user.role != "admin"):
        await websocket.close(code=4001)
        return

    await ws_manager.connect_alerts(websocket, user_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect_alerts(websocket, user_id)
