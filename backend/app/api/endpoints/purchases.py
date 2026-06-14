from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Purchase

router = APIRouter()


class PurchaseBase(BaseModel):
    supplier_id: int
    total: float
    status: str = "draft"
    expected_date: Optional[str] = None
    notes: Optional[str] = None


class PurchaseCreate(PurchaseBase):
    pass


class PurchaseUpdate(BaseModel):
    total: Optional[float] = None
    status: Optional[str] = None
    expected_date: Optional[str] = None
    notes: Optional[str] = None


class PurchaseSchema(PurchaseBase):
    id: int

    class Config:
        from_attributes = True


@router.get("/", response_model=List[PurchaseSchema])
async def list_purchases(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db)
):
    """List all purchases"""
    query = db.query(Purchase)
    
    if status:
        query = query.filter(Purchase.status == status)
    
    offset = (page - 1) * page_size
    purchases = query.order_by(Purchase.created_at.desc()).offset(offset).limit(page_size).all()
    return purchases


@router.get("/{purchase_id}", response_model=PurchaseSchema)
async def get_purchase(purchase_id: int, db: Session = Depends(get_db)):
    """Get a specific purchase"""
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return purchase


@router.post("/", response_model=PurchaseSchema)
async def create_purchase(purchase: PurchaseCreate, db: Session = Depends(get_db)):
    """Create a new purchase"""
    db_purchase = Purchase(**purchase.dict())
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)
    return db_purchase


@router.put("/{purchase_id}", response_model=PurchaseSchema)
async def update_purchase(
    purchase_id: int, 
    purchase: PurchaseUpdate, 
    db: Session = Depends(get_db)
):
    """Update a purchase"""
    db_purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not db_purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    
    update_data = purchase.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_purchase, key, value)
    
    db.commit()
    db.refresh(db_purchase)
    return db_purchase


@router.delete("/{purchase_id}")
async def delete_purchase(purchase_id: int, db: Session = Depends(get_db)):
    """Delete a purchase"""
    db_purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not db_purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    
    db.delete(db_purchase)
    db.commit()
    return {"message": "Purchase deleted successfully"}
