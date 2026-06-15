from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_permission, require_role
from app.models import Settings

router = APIRouter()


class SettingsBase(BaseModel):
    company_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    currency: Optional[str] = None
    tax_rate: Optional[float] = None
    low_stock_threshold: Optional[int] = None


class SettingsUpdate(SettingsBase):
    pass


class SettingsSchema(SettingsBase):
    id: int

    class Config:
        from_attributes = True


@router.get("")
@require_permission("settings_view")
async def get_settings(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get current settings"""
    settings = db.query(Settings).first()
    if not settings:
        # Create default settings if none exist
        settings = Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return {
        "id": settings.id,
        "companyName": settings.company_name,
        "email": settings.email,
        "phone": settings.phone,
        "address": settings.address,
        "currency": settings.currency,
        "taxRate": settings.tax_rate,
        "lowStockThreshold": settings.low_stock_threshold,
    }


@router.put("")
@require_permission("settings_update")
async def update_settings(
    settings_update: SettingsUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Update settings"""
    settings = db.query(Settings).first()
    if not settings:
        settings = Settings()
        db.add(settings)
    
    update_data = settings_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        # Convert camelCase to snake_case for database
        db_key = key.replace("companyName", "company_name").replace("taxRate", "tax_rate").replace("lowStockThreshold", "low_stock_threshold")
        setattr(settings, db_key, value)
    
    db.commit()
    db.refresh(settings)
    
    return {
        "id": settings.id,
        "companyName": settings.company_name,
        "email": settings.email,
        "phone": settings.phone,
        "address": settings.address,
        "currency": settings.currency,
        "taxRate": settings.tax_rate,
        "lowStockThreshold": settings.low_stock_threshold,
    }


@router.post("/reset")
@require_permission("settings_reset")
@require_role("admin")
async def reset_data(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Reset all data (dangerous operation)"""
    # This would reset all data - for now just return success
    return {"message": "Data reset functionality not implemented"}
