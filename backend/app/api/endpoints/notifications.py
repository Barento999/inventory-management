from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.notification import Notification, NotificationType

router = APIRouter()


class NotificationSchema(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None
    related_entity: Optional[str] = None
    related_id: Optional[int] = None

    class Config:
        from_attributes = True


class NotificationCreateSchema(BaseModel):
    title: str
    message: str
    type: str = "info"
    related_entity: Optional[str] = None
    related_id: Optional[int] = None


@router.get("/", response_model=List[NotificationSchema])
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, le=100),
    unread_only: bool = False,
    skip: int = 0,
):
    """Get user's notifications"""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = (
        query.order_by(desc(Notification.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return notifications


@router.get("/{notification_id}", response_model=NotificationSchema)
async def get_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific notification"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return notification


@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark notification as read"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    notification.read_at = datetime.utcnow()
    db.commit()
    db.refresh(notification)
    
    return {"status": "success", "message": "Notification marked as read"}


@router.put("/mark-all-read")
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark all notifications as read"""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).update({
        Notification.is_read: True,
        Notification.read_at: datetime.utcnow(),
    })
    
    db.commit()
    
    return {"status": "success", "message": "All notifications marked as read"}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a notification"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    db.commit()
    
    return {"status": "success", "message": "Notification deleted"}


@router.delete("/clear-all")
async def clear_all_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Clear all notifications"""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
    ).delete()
    
    db.commit()
    
    return {"status": "success", "message": "All notifications cleared"}


@router.get("/count/unread")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get unread notification count"""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).count()
    
    return {"unread_count": count}


# Internal endpoint for creating notifications
@router.post("/")
async def create_notification(
    payload: NotificationCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a notification (internal use)"""
    notification = Notification(
        user_id=current_user.id,
        title=payload.title,
        message=payload.message,
        type=payload.type,
        related_entity=payload.related_entity,
        related_id=payload.related_id,
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification
