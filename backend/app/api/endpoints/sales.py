from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_permission
from app.models import Sale

router = APIRouter()


class SaleBase(BaseModel):
    customer_id: int
    total: float
    status: str = "draft"
    notes: Optional[str] = None


class SaleCreate(SaleBase):
    pass


class SaleUpdate(BaseModel):
    total: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class SaleSchema(SaleBase):
    id: int

    class Config:
        from_attributes = True


@router.get("")
@require_permission("sales_view")
async def list_sales_no_slash(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """List all sales (no trailing slash)"""
    return await list_sales(search, status, page, page_size, authorization, db)


@router.get("/")
@require_permission("sales_view")
async def list_sales(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """List all sales with pagination wrapper"""
    query = db.query(Sale)
    
    if status:
        query = query.filter(Sale.status == status)
    
    total = query.count()
    offset = (page - 1) * page_size
    sales = query.order_by(Sale.created_at.desc()).offset(offset).limit(page_size).all()
    
    # Convert to dict manually
    sales_data = [
        {
            "id": s.id,
            "customer_id": s.customer_id,
            "total": s.total,
            "status": s.status,
            "notes": s.notes
        }
        for s in sales
    ]
    
    return {
        "data": sales_data,
        "pagination": {
            "page": page,
            "pageSize": page_size,
            "total": total,
            "totalPages": (total + page_size - 1) // page_size
        }
    }


@router.get("/{sale_id}", response_model=SaleSchema)
@require_permission("sales_view")
async def get_sale(
    sale_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get a specific sale"""
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale


@router.post("/", response_model=SaleSchema)
@require_permission("sales_create")
async def create_sale(
    sale: SaleCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Create a new sale"""
    db_sale = Sale(**sale.dict())
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db_sale


@router.put("/{sale_id}", response_model=SaleSchema)
@require_permission("sales_update")
async def update_sale(
    sale_id: int,
    sale: SaleUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Update a sale"""
    db_sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not db_sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    update_data = sale.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_sale, key, value)
    
    db.commit()
    db.refresh(db_sale)
    return db_sale


@router.delete("/{sale_id}")
@require_permission("sales_delete")
async def delete_sale(
    sale_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Delete a sale"""
    db_sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not db_sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    db.delete(db_sale)
    db.commit()
    return {"message": "Sale deleted successfully"}
