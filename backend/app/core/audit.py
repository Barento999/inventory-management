"""
Audit logging for tracking user actions and permission denials
"""

from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models import AuditLog
from app.models import User
import logging

logger = logging.getLogger(__name__)


def log_action(
    db: Session,
    user: Optional[User],
    action: str,
    resource: str,
    resource_id: Optional[int] = None,
    status: str = "success",
    details: Optional[str] = None,
    ip_address: Optional[str] = None,
):
    """Log user action to audit log"""
    try:
        audit = AuditLog(
            user_id=user.id if user else None,
            action=action,
            resource=resource,
            resource_id=resource_id,
            status=status,
            details=details,
            ip_address=ip_address,
            timestamp=datetime.utcnow(),
        )
        db.add(audit)
        db.commit()
        logger.info(f"Audit: {action} on {resource} by user {user.id if user else 'anonymous'}")
    except Exception as e:
        logger.error(f"Failed to log audit: {e}")
        db.rollback()


def log_permission_denial(
    db: Session,
    user: Optional[User],
    permission: str,
    resource: str,
    ip_address: Optional[str] = None,
):
    """Log permission denial"""
    try:
        audit = AuditLog(
            user_id=user.id if user else None,
            action="PERMISSION_DENIED",
            resource=resource,
            status="denied",
            details=f"Permission required: {permission}",
            ip_address=ip_address,
            timestamp=datetime.utcnow(),
        )
        db.add(audit)
        db.commit()
        logger.warning(f"Permission denied: {permission} for {resource} by user {user.id if user else 'anonymous'}")
    except Exception as e:
        logger.error(f"Failed to log permission denial: {e}")
        db.rollback()


def log_authentication_failure(
    db: Session,
    email: str,
    reason: str,
    ip_address: Optional[str] = None,
):
    """Log failed authentication attempt"""
    try:
        audit = AuditLog(
            action="AUTH_FAILURE",
            resource="authentication",
            status="failed",
            details=f"Reason: {reason}",
            ip_address=ip_address,
            timestamp=datetime.utcnow(),
        )
        db.add(audit)
        db.commit()
        logger.warning(f"Auth failure for {email}: {reason}")
    except Exception as e:
        logger.error(f"Failed to log auth failure: {e}")
        db.rollback()


def get_user_audit_logs(db: Session, user_id: int, limit: int = 100):
    """Get audit logs for a specific user"""
    return db.query(AuditLog).filter(
        AuditLog.user_id == user_id
    ).order_by(AuditLog.timestamp.desc()).limit(limit).all()


def get_permission_denials(db: Session, days: int = 7, limit: int = 100):
    """Get recent permission denials"""
    from datetime import timedelta
    cutoff = datetime.utcnow() - timedelta(days=days)
    return db.query(AuditLog).filter(
        (AuditLog.status == "denied") &
        (AuditLog.timestamp >= cutoff)
    ).order_by(AuditLog.timestamp.desc()).limit(limit).all()


def get_authentication_failures(db: Session, hours: int = 24, limit: int = 100):
    """Get recent authentication failures"""
    from datetime import timedelta
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    return db.query(AuditLog).filter(
        (AuditLog.action == "AUTH_FAILURE") &
        (AuditLog.timestamp >= cutoff)
    ).order_by(AuditLog.timestamp.desc()).limit(limit).all()
