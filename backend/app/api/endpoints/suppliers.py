from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from prisma import Prisma

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
    db: Prisma = Depends(get_db)
):
    where = {}
    if search:
        where['OR'] = [
            {'name': {'contains': search}},
            {'email': {'contains': search}},
            {'contactPerson': {'contains': search}},
        ]
    
    skip = (page - 1) * pageSize
    suppliers = await db.supplier.find_many(
        where=where,
        skip=skip,
        take=pageSize,
        order={'createdAt': 'desc'},
        include={'purchases': True}
    )
    
    result = []
    for supplier in suppliers:
        result.append({
            **supplier.model_dump(),
            'purchaseCount': len(supplier.purchases)
        })
    return result


@router.get("/{supplier_id}", response_model=Supplier)
async def get_supplier(supplier_id: str, db: Prisma = Depends(get_db)):
    supplier = await db.supplier.find_unique(
        where={'id': supplier_id},
        include={'purchases': True}
    )
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    return {
        **supplier.model_dump(),
        'purchaseCount': len(supplier.purchases)
    }


@router.post("/", response_model=Supplier)
async def create_supplier(supplier: SupplierCreate, db: Prisma = Depends(get_db)):
    new_supplier = await db.supplier.create(
        data={
            'name': supplier.name,
            'contactPerson': supplier.contactPerson,
            'email': supplier.email,
            'phone': supplier.phone,
            'address': supplier.address,
            'status': supplier.status,
        }
    )
    return {**new_supplier.model_dump(), 'purchaseCount': 0}


@router.put("/{supplier_id}", response_model=Supplier)
async def update_supplier(supplier_id: str, supplier: SupplierUpdate, db: Prisma = Depends(get_db)):
    existing = await db.supplier.find_unique(
        where={'id': supplier_id},
        include={'purchases': True}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    update_data = {k: v for k, v in supplier.model_dump().items() if v is not None}
    updated = await db.supplier.update(
        where={'id': supplier_id},
        data=update_data
    )
    
    return {
        **updated.model_dump(),
        'purchaseCount': len(existing.purchases)
    }


@router.delete("/{supplier_id}")
async def delete_supplier(supplier_id: str, db: Prisma = Depends(get_db)):
    await db.supplier.delete(where={'id': supplier_id})
    return {"message": "Supplier deleted"}
