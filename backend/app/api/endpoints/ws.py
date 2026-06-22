from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from app.core.websocket import manager
from app.core.auth import verify_token_ws
from app.core.database import get_db
from sqlalchemy.orm import Session
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws/notifications/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    """
    WebSocket endpoint for real-time notifications
    
    Usage:
    - Connect: ws://localhost:8000/api/ws/notifications/{your_token}
    - Receive: {"type": "notification", "data": {...}, "timestamp": "2024-06-23..."}
    - Send ping: {"type": "ping"}
    - Receive pong: {"type": "pong", "timestamp": "..."}
    """
    
    # Verify token and get user
    user = await verify_token_ws(token, db)
    
    if not user:
        await websocket.close(code=1008, reason="Unauthorized")
        return
    
    await manager.connect(websocket, user.id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            message_type = message.get("type")
            
            # Handle ping/pong for keep-alive
            if message_type == "ping":
                await websocket.send_text(json.dumps({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                }))
            
            # Log received message
            logger.debug(f"WebSocket message from user {user.id}: {message_type}")
            
    except WebSocketDisconnect:
        await manager.disconnect(websocket, user.id)
        logger.info(f"User {user.id} disconnected from WebSocket")
    except Exception as e:
        logger.error(f"WebSocket error for user {user.id}: {e}")
        await manager.disconnect(websocket, user.id)


@router.get("/ws/status")
async def websocket_status():
    """Get WebSocket connection status"""
    return {
        "connected_users": manager.get_connected_users_count(),
        "total_connections": manager.get_connection_count(),
        "status": "online"
    }
