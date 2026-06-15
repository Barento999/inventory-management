from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_permission
from app.models import Supplier

router = APIRouter()


class SupplierBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None


class SupplierSchema(SupplierBase):
    id: int

    class Config:
        from_attributes = True


@router.get("")
@require_permission("suppliers_view")
async def list_suppliers_no_slash(
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """List all suppliers (no trailing slash)"""
    return await list_suppliers(search, page, page_size, authorization, db)


@router.get("/")
@require_permission("suppliers_view")
async def list_suppliers(
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """List all suppliers with pagination wrapper"""
    query = db.query(Supplier)
    
    if search:
        query = query.filter(
            (Supplier.name.ilike(f"%{search}%")) | 
            (Supplier.email.ilike(f"%{search}%"))
        )
    
    total = query.count()
    offset = (page - 1) * page_size
    suppliers = query.offset(offset).limit(page_size).all()
    
    # Convert to dict manually
    suppliers_data = [
        {
            "id": s.id,
            "name": s.name,
            "email": s.email,
            "phone": s.phone,
            "address": s.address,
            "contact_person": s.contact_person
        }
        for s in suppliers
    ]
    
    return {
        "data": suppliers_data,
        "pagination": {
            "page": page,
            "pageSize": page_size,
            "total": total,
            "totalPages": (total + page_size - 1) // page_size
        }
    }


@router.get("/{supplier_id}", response_model=SupplierSchema)
@require_permission("suppliers_view")
async def get_supplier(
    supplier_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get a specific supplier"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


@router.post("/", response_model=SupplierSchema)
@require_permission("suppliers_create")
async def create_supplier(
    supplier: SupplierCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Create a new supplier"""
    db_supplier = Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier


@router.put("/{supplier_id}", response_model=SupplierSchema)
@require_permission("suppliers_update")
async def update_supplier(
    supplier_id: int,
    supplier: SupplierUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Update a supplier"""
    db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    update_data = supplier.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_supplier, key, value)
    
    db.commit()
    db.refresh(db_supplier)
    return db_supplier


@router.delete("/{supplier_id}")
@require_permission("suppliers_delete")
async def delete_supplier(
    supplier_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Delete a supplier"""
    db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    db.delete(db_supplier)
    db.commit()
    return {"message": "Supplier deleted successfully"}
