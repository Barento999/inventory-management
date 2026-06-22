from fastapi import WebSocket
from typing import Dict, Set
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manage WebSocket connections for real-time notifications"""
    
    def __init__(self):
        # Store active connections: {user_id: set(WebSocket)}
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        # Store all connections for broadcasting
        self.all_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket, user_id: int):
        """Add a new connection"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        self.all_connections.add(websocket)
        
        logger.info(f"User {user_id} connected via WebSocket")
    
    async def disconnect(self, websocket: WebSocket, user_id: int):
        """Remove a connection"""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        self.all_connections.discard(websocket)
        logger.info(f"User {user_id} disconnected from WebSocket")
    
    async def send_personal(self, message: dict, user_id: int):
        """Send message to a specific user"""
        if user_id in self.active_connections:
            message_json = json.dumps(message)
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message_json)
                except Exception as e:
                    logger.error(f"Error sending personal message to user {user_id}: {e}")
    
    async def send_to_user_list(self, message: dict, user_ids: list):
        """Send message to multiple users"""
        message_json = json.dumps(message)
        for user_id in user_ids:
            if user_id in self.active_connections:
                for connection in self.active_connections[user_id]:
                    try:
                        await connection.send_text(message_json)
                    except Exception as e:
                        logger.error(f"Error sending message to user {user_id}: {e}")
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected users"""
        message_json = json.dumps(message)
        disconnected = set()
        
        for connection in self.all_connections:
            try:
                await connection.send_text(message_json)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")
                disconnected.add(connection)
        
        # Clean up disconnected connections
        self.all_connections -= disconnected
    
    async def broadcast_to_role(self, message: dict, role_id: int, db_session):
        """Broadcast message to all users with a specific role"""
        from app.models import User
        
        users = db_session.query(User).filter(User.role_id == role_id).all()
        user_ids = [user.id for user in users]
        await self.send_to_user_list(message, user_ids)
    
    def get_connected_users_count(self) -> int:
        """Get total number of connected users"""
        return len(self.active_connections)
    
    def get_connection_count(self) -> int:
        """Get total number of connections"""
        return len(self.all_connections)


# Global connection manager instance
manager = ConnectionManager()
