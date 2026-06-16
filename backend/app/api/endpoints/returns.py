from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_permission, check_permission
from app.models import Return, User

router = APIRouter()


class ReturnBase(BaseModel):
    sale_id: int
    product_id: int
    quantity: int
    reason: str
    status: str = "pending"
    refund_amount: Optional[float] = None


class ReturnCreate(ReturnBase):
    pass


class ReturnUpdate(BaseModel):
    status: Optional[str] = None
    refund_amount: Optional[float] = None


class ReturnSchema(ReturnBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True


@router.get("/")
@require_permission("returns_view")
async def list_returns(
    status: Optional[str] = None,
    page: int = 1,
    pageSize: int = 10,
    current_user: User = Depends(check_permission("returns_view")),
    db: Session = Depends(get_db)
):
    """Get all returns"""
    query = db.query(Return)
    
    if status:
        query = query.filter(Return.status == status)
    
    total = query.count()
    offset = (page - 1) * pageSize
    returns = query.order_by(Return.created_at.desc()).offset(offset).limit(pageSize).all()
    
    # Convert to dict manually
    returns_data = [
        {
            "id": r.id,
            "saleId": r.sale_id,
            "productId": r.product_id,
            "quantity": r.quantity,
            "reason": r.reason,
            "status": r.status,
            "refundAmount": r.refund_amount,
            "createdAt": r.created_at.isoformat() if r.created_at else None
        }
        for r in returns
    ]
    
    return {
        "data": returns_data,
        "pagination": {
            "page": page,
            "pageSize": pageSize,
            "total": total,
            "totalPages": (total + pageSize - 1) // pageSize
        }
    }


@router.post("")
@require_permission("returns_create")
async def create_return(
    return_item: ReturnCreate,
    current_user: User = Depends(check_permission("returns_create")),
    db: Session = Depends(get_db)
):
    """Create a new return"""
    db_return = Return(**return_item.dict())
    db.add(db_return)
    db.commit()
    db.refresh(db_return)
    
    return {
        "id": db_return.id,
        "saleId": db_return.sale_id,
        "productId": db_return.product_id,
        "quantity": db_return.quantity,
        "reason": db_return.reason,
        "status": db_return.status,
        "refundAmount": db_return.refund_amount,
        "createdAt": db_return.created_at.isoformat() if db_return.created_at else None
    }


@router.put("/{return_id}")
@require_permission("returns_update")
async def update_return(
    return_id: int,
    return_item: ReturnUpdate,
    current_user: User = Depends(check_permission("returns_update")),
    db: Session = Depends(get_db)
):
    """Update a return"""
    db_return = db.query(Return).filter(Return.id == return_id).first()
    if not db_return:
        raise HTTPException(status_code=404, detail="Return not found")
    
    update_data = return_item.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_return, key, value)
    
    db.commit()
    db.refresh(db_return)
    
    return {
        "id": db_return.id,
        "saleId": db_return.sale_id,
        "productId": db_return.product_id,
        "quantity": db_return.quantity,
        "reason": db_return.reason,
        "status": db_return.status,
        "refundAmount": db_return.refund_amount,
        "createdAt": db_return.created_at.isoformat() if db_return.created_at else None
    }


@router.delete("/{return_id}")
@require_permission("returns_delete")
async def delete_return(
    return_id: int,
    current_user: User = Depends(check_permission("returns_delete")),
    db: Session = Depends(get_db)
):
    """Delete a return"""
    db_return = db.query(Return).filter(Return.id == return_id).first()
    if not db_return:
        raise HTTPException(status_code=404, detail="Return not found")
    
    db.delete(db_return)
    db.commit()
    
    return {"message": "Return deleted successfully"}
