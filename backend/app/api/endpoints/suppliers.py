from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
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


@router.get("/", response_model=List[SupplierSchema])
async def list_suppliers(
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db)
):
    """List all suppliers"""
    query = db.query(Supplier)
    
    if search:
        query = query.filter(
            (Supplier.name.ilike(f"%{search}%")) | 
            (Supplier.email.ilike(f"%{search}%"))
        )
    
    offset = (page - 1) * page_size
    suppliers = query.offset(offset).limit(page_size).all()
    return suppliers


@router.get("/{supplier_id}", response_model=SupplierSchema)
async def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Get a specific supplier"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


@router.post("/", response_model=SupplierSchema)
async def create_supplier(supplier: SupplierCreate, db: Session = Depends(get_db)):
    """Create a new supplier"""
    db_supplier = Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier


@router.put("/{supplier_id}", response_model=SupplierSchema)
async def update_supplier(
    supplier_id: int, 
    supplier: SupplierUpdate, 
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
async def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Delete a supplier"""
    db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    db.delete(db_supplier)
    db.commit()
    return {"message": "Supplier deleted successfully"}
