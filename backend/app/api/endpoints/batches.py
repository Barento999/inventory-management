from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_permission
from app.models import Batch

router = APIRouter()


class BatchBase(BaseModel):
    product_id: int
    batch_number: str
    quantity: int
    expiry_date: Optional[str] = None
    purchase_id: Optional[int] = None


class BatchCreate(BatchBase):
    pass


class BatchUpdate(BaseModel):
    quantity: Optional[int] = None
    expiry_date: Optional[str] = None


class BatchSchema(BatchBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True


@require_permission("batches_view")
async def list_batches(
    product_id: Optional[int] = None,
    page: int = 1,
    page_size: int = 10,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get all batches"""
    query = db.query(Batch)
    
    if product_id:
        query = query.filter(Batch.product_id == product_id)
    
    total = query.count()
    offset = (page - 1) * page_size
    batches = query.order_by(Batch.created_at.desc()).offset(offset).limit(page_size).all()
    
    # Convert to dict manually
    batches_data = [
        {
            "id": b.id,
            "productId": b.product_id,
            "batchNumber": b.batch_number,
            "quantity": b.quantity,
            "expiryDate": b.expiry_date.isoformat() if b.expiry_date else None,
            "purchaseId": b.purchase_id,
            "createdAt": b.created_at.isoformat() if b.created_at else None
        }
        for b in batches
    ]
    
    return {
        "data": batches_data,
        "pagination": {
            "page": page,
            "pageSize": page_size,
            "total": total,
            "totalPages": (total + page_size - 1) // page_size
        }
    }


@router.post("")
@require_permission("batches_create")
async def create_batch(
    batch: BatchCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Create a new batch"""
    db_batch = Batch(**batch.dict())
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    
    return {
        "id": db_batch.id,
        "productId": db_batch.product_id,
        "batchNumber": db_batch.batch_number,
        "quantity": db_batch.quantity,
        "expiryDate": db_batch.expiry_date.isoformat() if db_batch.expiry_date else None,
        "purchaseId": db_batch.purchase_id,
        "createdAt": db_batch.created_at.isoformat() if db_batch.created_at else None
    }


@router.put("/{batch_id}")
@require_permission("batches_update")
async def update_batch(
    batch_id: int,
    batch: BatchUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Update a batch"""
    db_batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not db_batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    update_data = batch.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_batch, key, value)
    
    db.commit()
    db.refresh(db_batch)
    
    return {
        "id": db_batch.id,
        "productId": db_batch.product_id,
        "batchNumber": db_batch.batch_number,
        "quantity": db_batch.quantity,
        "expiryDate": db_batch.expiry_date.isoformat() if db_batch.expiry_date else None,
        "purchaseId": db_batch.purchase_id,
        "createdAt": db_batch.created_at.isoformat() if db_batch.created_at else None
    }


@router.delete("/{batch_id}")
@require_permission("batches_delete")
async def delete_batch(
    batch_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Delete a batch"""
    db_batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not db_batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    db.delete(db_batch)
    db.commit()
    
    return {"message": "Batch deleted successfully"}
