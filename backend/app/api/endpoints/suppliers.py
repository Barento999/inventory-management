from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db

router = APIRouter()


class SupplierBase(BaseModel):
    name: str
    contactPerson: str
    email: str
    phone: str
    address: str
    status: str


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contactPerson: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None


class Supplier(SupplierBase):
    id: str
    purchaseCount: int

    class Config:
        from_attributes = True


@router.get("/", response_model=List[Supplier])
async def list_suppliers(
    search: Optional[str] = None,
    page: int = 1,
    pageSize: int = 10,
    db = Depends(get_db)
):
    return []


@router.get("/{supplier_id}", response_model=Supplier)
async def get_supplier(supplier_id: str, db = Depends(get_db)):
    raise HTTPException(status_code=404, detail="Supplier not found")


@router.post("/", response_model=Supplier)
async def create_supplier(supplier: SupplierCreate, db = Depends(get_db)):
    raise HTTPException(status_code=500, detail="Database not configured")


@router.put("/{supplier_id}", response_model=Supplier)
async def update_supplier(supplier_id: str, supplier: SupplierUpdate, db = Depends(get_db)):
    raise HTTPException(status_code=404, detail="Supplier not found")


@router.delete("/{supplier_id}")
async def delete_supplier(supplier_id: str, db = Depends(get_db)):
    return {"message": "Supplier deleted"}
