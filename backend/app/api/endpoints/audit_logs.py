from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_permission, check_permission
from app.models import AuditLog, User

router = APIRouter()


class AuditLogBase(BaseModel):
    user_id: Optional[int] = None
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    details: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogSchema(AuditLogBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True


@router.get("/")
@require_permission("audit_logs_view")
async def list_audit_logs(
    page: int = 1,
    pageSize: int = 10,
    current_user: User = Depends(check_permission("audit_logs_view")),
    db: Session = Depends(get_db)
):
    """Get all audit logs"""
    query = db.query(AuditLog)
    total = query.count()
    offset = (page - 1) * pageSize
    logs = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(pageSize).all()
    
    # Convert to dict manually
    logs_data = [
        {
            "id": log.id,
            "userId": log.user_id,
            "action": log.action,
            "entityType": log.entity_type,
            "entityId": log.entity_id,
            "details": log.details,
            "createdAt": log.created_at.isoformat() if log.created_at else None
        }
        for log in logs
    ]
    
    return {
        "data": logs_data,
        "pagination": {
            "page": page,
            "pageSize": pageSize,
            "total": total,
            "totalPages": (total + pageSize - 1) // pageSize
        }
    }


@router.post("")
@require_permission("audit_logs_view")
async def create_audit_log(
    log: AuditLogCreate,
    current_user: User = Depends(check_permission("audit_logs_view")),
    db: Session = Depends(get_db)
):
    """Create a new audit log"""
    db_log = AuditLog(**log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    return {
        "id": db_log.id,
        "userId": db_log.user_id,
        "action": db_log.action,
        "entityType": db_log.entity_type,
        "entityId": db_log.entity_id,
        "details": db_log.details,
        "createdAt": db_log.created_at.isoformat() if db_log.created_at else None
    }
