from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_permission
from app.models import SerialNumber

router = APIRouter()


class SerialNumberBase(BaseModel):
    product_id: int
    serial: str
    status: str = "available"
    purchase_id: Optional[int] = None
    sale_id: Optional[int] = None


class SerialNumberCreate(SerialNumberBase):
    pass


class SerialNumberUpdate(BaseModel):
    status: Optional[str] = None
    sale_id: Optional[int] = None


class SerialNumberSchema(SerialNumberBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True


@router.get("/")
@require_permission("serial_numbers_view")
async def list_serial_numbers(
    product_id: Optional[int] = None,
    status: Optional[str] = None,
    page: int = 1,
    pageSize: int = 10,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
    current_user = None
):
    """Get all serial numbers"""
    query = db.query(SerialNumber)
    
    if product_id:
        query = query.filter(SerialNumber.product_id == product_id)
    
    if status:
        query = query.filter(SerialNumber.status == status)
    
    total = query.count()
    offset = (page - 1) * pageSize
    serials = query.order_by(SerialNumber.created_at.desc()).offset(offset).limit(pageSize).all()
    
    # Convert to dict manually
    serials_data = [
        {
            "id": s.id,
            "productId": s.product_id,
            "serial": s.serial,
            "status": s.status,
            "purchaseId": s.purchase_id,
            "saleId": s.sale_id,
            "createdAt": s.created_at.isoformat() if s.created_at else None
        }
        for s in serials
    ]
    
    return {
        "data": serials_data,
        "pagination": {
            "page": page,
            "pageSize": pageSize,
            "total": total,
            "totalPages": (total + pageSize - 1) // pageSize
        }
    }


@router.post("")
@require_permission("serial_numbers_create")
async def create_serial_number(
    serial: SerialNumberCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
    current_user = None
):
    """Create a new serial number"""
    db_serial = SerialNumber(**serial.dict())
    db.add(db_serial)
    db.commit()
    db.refresh(db_serial)
    
    return {
        "id": db_serial.id,
        "productId": db_serial.product_id,
        "serial": db_serial.serial,
        "status": db_serial.status,
        "purchaseId": db_serial.purchase_id,
        "saleId": db_serial.sale_id,
        "createdAt": db_serial.created_at.isoformat() if db_serial.created_at else None
    }


@router.put("/{serial_id}")
@require_permission("serial_numbers_update")
async def update_serial_number(
    serial_id: int,
    serial: SerialNumberUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
    current_user = None
):
    """Update a serial number"""
    db_serial = db.query(SerialNumber).filter(SerialNumber.id == serial_id).first()
    if not db_serial:
        raise HTTPException(status_code=404, detail="Serial number not found")
    
    update_data = serial.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_serial, key, value)
    
    db.commit()
    db.refresh(db_serial)
    
    return {
        "id": db_serial.id,
        "productId": db_serial.product_id,
        "serial": db_serial.serial,
        "status": db_serial.status,
        "purchaseId": db_serial.purchase_id,
        "saleId": db_serial.sale_id,
        "createdAt": db_serial.created_at.isoformat() if db_serial.created_at else None
    }


@router.delete("/{serial_id}")
@require_permission("serial_numbers_delete")
async def delete_serial_number(
    serial_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
    current_user = None
):
    """Delete a serial number"""
    db_serial = db.query(SerialNumber).filter(SerialNumber.id == serial_id).first()
    if not db_serial:
        raise HTTPException(status_code=404, detail="Serial number not found")
    
    db.delete(db_serial)
    db.commit()
    
    return {"message": "Serial number deleted successfully"}
