"""
Audit logs endpoints - view audit trail and permission denials
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_permission, check_permission
from app.models import AuditLog, User
from app.core.audit import get_user_audit_logs, get_permission_denials, get_authentication_failures
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class AuditLogSchema(BaseModel):
    id: int
    user_id: int = None
    action: str
    resource: str
    resource_id: int = None
    status: str
    details: str = None
    ip_address: str = None
    timestamp: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[AuditLogSchema])
@require_permission("audit_logs_view")
async def list_audit_logs(
    current_user: User = Depends(check_permission("audit_logs_view")),
    db: Session = Depends(get_db),
    page: int = 1,
    page_size: int = 50,
):
    """Get audit logs"""
    query = db.query(AuditLog).order_by(AuditLog.timestamp.desc())
    total = query.count()
    offset = (page - 1) * page_size
    logs = query.offset(offset).limit(page_size).all()
    
    return logs


@router.get("/user/{user_id}", response_model=List[AuditLogSchema])
@require_permission("audit_logs_view")
async def get_user_logs(
    user_id: int,
    current_user: User = Depends(check_permission("audit_logs_view")),
    db: Session = Depends(get_db),
    limit: int = 100,
):
    """Get audit logs for specific user"""
    logs = get_user_audit_logs(db, user_id, limit)
    return logs


@router.get("/permission-denials", response_model=List[AuditLogSchema])
@require_permission("audit_logs_view")
async def get_permission_denials_logs(
    current_user: User = Depends(check_permission("audit_logs_view")),
    db: Session = Depends(get_db),
    days: int = 7,
    limit: int = 100,
):
    """Get recent permission denials"""
    denials = get_permission_denials(db, days, limit)
    return denials


@router.get("/auth-failures", response_model=List[AuditLogSchema])
@require_permission("audit_logs_view")
async def get_auth_failures_logs(
    current_user: User = Depends(check_permission("audit_logs_view")),
    db: Session = Depends(get_db),
    hours: int = 24,
    limit: int = 100,
):
    """Get recent authentication failures"""
    failures = get_authentication_failures(db, hours, limit)
    return failures


@router.get("/summary", response_model=dict)
@require_permission("audit_logs_view")
async def get_audit_summary(
    current_user: User = Depends(check_permission("audit_logs_view")),
    db: Session = Depends(get_db),
):
    """Get audit summary statistics"""
    total_logs = db.query(AuditLog).count()
    total_denials = db.query(AuditLog).filter(AuditLog.status == "denied").count()
    total_failures = db.query(AuditLog).filter(AuditLog.action == "AUTH_FAILURE").count()
    
    return {
        "total_logs": total_logs,
        "permission_denials": total_denials,
        "auth_failures": total_failures,
    }
