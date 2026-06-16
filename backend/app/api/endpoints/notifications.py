from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Notification

router = APIRouter()


class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"


class NotificationCreate(NotificationBase):
    pass


class NotificationSchema(NotificationBase):
    id: int
    is_read: bool
    created_at: str

    class Config:
        from_attributes = True


async def list_notifications(db: Session = Depends(get_db)):
    """Get all notifications"""
    notifications = db.query(Notification).order_by(Notification.created_at.desc()).all()
    
    # Convert to dict manually
    notifications_data = [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "isRead": n.is_read,
            "createdAt": n.created_at.isoformat() if n.created_at else None
        }
        for n in notifications
    ]
    
    return notifications_data


@router.put("/{notification_id}/read")
async def mark_read(notification_id: int, db: Session = Depends(get_db)):
    """Mark notification as read"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    
    return {"id": notification.id, "isRead": True}


@router.put("/read-all")
async def mark_all_read(db: Session = Depends(get_db)):
    """Mark all notifications as read"""
    notifications = db.query(Notification).filter(Notification.is_read == False).all()
    for notification in notifications:
        notification.is_read = True
    
    db.commit()
    
    return {"message": "All notifications marked as read"}
