from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.shipment import Shipment, ShipmentStatus

router = APIRouter()


class ShipmentSchema(BaseModel):
    id: int
    sale_id: int
    tracking_number: Optional[str]
    carrier: str
    status: str
    ship_from_address: str
    ship_to_address: str
    weight_kg: float
    length_cm: Optional[float]
    width_cm: Optional[float]
    height_cm: Optional[float]
    ship_date: Optional[datetime]
    delivery_date: Optional[datetime]
    expected_delivery: Optional[datetime]
    shipping_cost: float
    insurance_cost: float
    notes: Optional[str]
    is_return: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ShipmentCreateSchema(BaseModel):
    sale_id: int
    carrier: str
    ship_from_address: str
    ship_to_address: str
    weight_kg: float
    length_cm: Optional[float] = None
    width_cm: Optional[float] = None
    height_cm: Optional[float] = None
    shipping_cost: float = 0
    insurance_cost: float = 0
    notes: Optional[str] = None


class ShipmentUpdateSchema(BaseModel):
    status: Optional[str] = None
    tracking_number: Optional[str] = None
    delivery_date: Optional[datetime] = None
    notes: Optional[str] = None


@router.post("/", response_model=ShipmentSchema)
async def create_shipment(
    payload: ShipmentCreateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new shipment"""
    shipment = Shipment(
        sale_id=payload.sale_id,
        carrier=payload.carrier,
        ship_from_address=payload.ship_from_address,
        ship_to_address=payload.ship_to_address,
        weight_kg=payload.weight_kg,
        length_cm=payload.length_cm,
        width_cm=payload.width_cm,
        height_cm=payload.height_cm,
        shipping_cost=payload.shipping_cost,
        insurance_cost=payload.insurance_cost,
        notes=payload.notes,
    )
    
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    
    return shipment


@router.get("/", response_model=List[ShipmentSchema])
async def list_shipments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0),
    limit: int = Query(50, le=100),
    status: Optional[str] = None,
    carrier: Optional[str] = None,
):
    """List all shipments"""
    query = db.query(Shipment)
    
    if status:
        query = query.filter(Shipment.status == status)
    
    if carrier:
        query = query.filter(Shipment.carrier == carrier)
    
    shipments = query.order_by(desc(Shipment.created_at)).offset(skip).limit(limit).all()
    
    return shipments


@router.get("/{shipment_id}", response_model=ShipmentSchema)
async def get_shipment(
    shipment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific shipment"""
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    return shipment


@router.put("/{shipment_id}", response_model=ShipmentSchema)
async def update_shipment(
    shipment_id: int,
    payload: ShipmentUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a shipment"""
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    if payload.status:
        shipment.status = payload.status
    if payload.tracking_number:
        shipment.tracking_number = payload.tracking_number
    if payload.delivery_date:
        shipment.delivery_date = payload.delivery_date
    if payload.notes is not None:
        shipment.notes = payload.notes
    
    db.commit()
    db.refresh(shipment)
    
    return shipment


@router.delete("/{shipment_id}")
async def delete_shipment(
    shipment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a shipment"""
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    db.delete(shipment)
    db.commit()
    
    return {"status": "success", "message": "Shipment deleted"}


@router.get("/tracking/{tracking_number}")
async def track_shipment(
    tracking_number: str,
    db: Session = Depends(get_db),
):
    """Track a shipment by tracking number"""
    shipment = db.query(Shipment).filter(
        Shipment.tracking_number == tracking_number
    ).first()
    
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    return {
        "tracking_number": shipment.tracking_number,
        "carrier": shipment.carrier,
        "status": shipment.status,
        "ship_date": shipment.ship_date,
        "expected_delivery": shipment.expected_delivery,
        "delivery_date": shipment.delivery_date,
    }


@router.get("/stats/overview")
async def get_shipment_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get shipment statistics"""
    total = db.query(Shipment).count()
    pending = db.query(Shipment).filter(Shipment.status == ShipmentStatus.PENDING).count()
    shipped = db.query(Shipment).filter(Shipment.status == ShipmentStatus.SHIPPED).count()
    delivered = db.query(Shipment).filter(Shipment.status == ShipmentStatus.DELIVERED).count()
    
    total_cost = db.query(Shipment).with_entities(
        db.func.sum(Shipment.shipping_cost + Shipment.insurance_cost)
    ).scalar() or 0
    
    return {
        "total_shipments": total,
        "pending": pending,
        "shipped": shipped,
        "delivered": delivered,
        "total_cost": float(total_cost),
    }
