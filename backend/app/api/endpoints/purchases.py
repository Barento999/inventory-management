from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_permission
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

    @classmethod
    def from_orm(cls, obj):
        data = {
            "id": obj.id,
            "supplier_id": obj.supplier_id,
            "total": obj.total,
            "status": obj.status,
            "expected_date": obj.expected_date.isoformat() if obj.expected_date else None,
            "notes": obj.notes,
        }
        return cls(**data)

    class Config:
        from_attributes = True


@router.get("/")
@require_permission("purchases_view")
async def list_purchases(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    pageSize: int = 10,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
    current_user = None
):
    """List all purchases with pagination wrapper"""
    query = db.query(Purchase)
    
    if status:
        query = query.filter(Purchase.status == status)
    
    total = query.count()
    offset = (page - 1) * pageSize
    purchases = query.order_by(Purchase.created_at.desc()).offset(offset).limit(pageSize).all()
    
    # Convert to dict manually
    purchases_data = [
        {
            "id": p.id,
            "supplier_id": p.supplier_id,
            "total": p.total,
            "status": p.status,
            "expected_date": p.expected_date.isoformat() if p.expected_date else None,
            "notes": p.notes
        }
        for p in purchases
    ]
    
    return {
        "data": purchases_data,
        "pagination": {
            "page": page,
            "pageSize": pageSize,
            "total": total,
            "totalPages": (total + pageSize - 1) // pageSize
        }
    }


@router.get("/{purchase_id}", response_model=PurchaseSchema)
@require_permission("purchases_view")
async def get_purchase(
    purchase_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
    current_user = None
):
    """Get a specific purchase"""
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return purchase


@router.post("/", response_model=PurchaseSchema)
@require_permission("purchases_create")
async def create_purchase(
    purchase: PurchaseCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
    current_user = None
):
    """Create a new purchase"""
    db_purchase = Purchase(**purchase.dict())
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)
    return db_purchase


@router.put("/{purchase_id}", response_model=PurchaseSchema)
@require_permission("purchases_update")
async def update_purchase(
    purchase_id: int,
    purchase: PurchaseUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
    current_user = None
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
@require_permission("purchases_delete")
async def delete_purchase(
    purchase_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
    current_user = None
):
    """Delete a purchase"""
    db_purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not db_purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    
    db.delete(db_purchase)
    db.commit()
    return {"message": "Purchase deleted successfully"}
