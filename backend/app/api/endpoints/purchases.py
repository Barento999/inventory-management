from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db

router = APIRouter()


class PurchaseItem(BaseModel):
    productId: str
    quantity: int
    unitCost: float


class PurchaseBase(BaseModel):
    supplierId: str
    items: List[PurchaseItem]
    status: str
    expectedDate: Optional[str] = None
    notes: Optional[str] = None


class PurchaseCreate(PurchaseBase):
    pass


class PurchaseUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class Purchase(PurchaseBase):
    id: str
    supplierName: str
    total: float
    createdAt: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[Purchase])
async def list_purchases(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    pageSize: int = 10,
    db = Depends(get_db)
):
    where = {}
    if status:
        where['status'] = status
    if search:
        where['OR'] = [
            {'supplierName': {'contains': search}},
            {'notes': {'contains': search}},
        ]
    
    skip = (page - 1) * pageSize
    purchases = await db.purchase.find_many(
        where=where,
        skip=skip,
        take=pageSize,
        order={'createdAt': 'desc'},
        include={'supplier': True}
    )
    
    result = []
    for purchase in purchases:
        total = sum(item.quantity * item.unitCost for item in purchase.items)
        result.append({
            **purchase.model_dump(),
            'supplierName': purchase.supplier.name,
            'total': total
        })
    return result


@router.get("/{purchase_id}", response_model=Purchase)
async def get_purchase(purchase_id: str, db = Depends(get_db)):
    purchase = await db.purchase.find_unique(
        where={'id': purchase_id},
        include={'supplier': True}
    )
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    
    total = sum(item.quantity * item.unitCost for item in purchase.items)
    return {
        **purchase.model_dump(),
        'supplierName': purchase.supplier.name,
        'total': total
    }


@router.post("/", response_model=Purchase)
async def create_purchase(purchase: PurchaseCreate, db = Depends(get_db)):
    supplier = await db.supplier.find_unique(where={'id': purchase.supplierId})
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    total = sum(item.quantity * item.unitCost for item in purchase.items)
    
    new_purchase = await db.purchase.create(
        data={
            'supplierId': purchase.supplierId,
            'status': purchase.status,
            'expectedDate': purchase.expectedDate,
            'notes': purchase.notes,
            'items': {
                'create': [
                    {
                        'productId': item.productId,
                        'quantity': item.quantity,
                        'unitCost': item.unitCost,
                    }
                    for item in purchase.items
                ]
            }
        }
    )
    
    return {
        **new_purchase.model_dump(),
        'supplierName': supplier.name,
        'total': total
    }


@router.put("/{purchase_id}/approve")
async def approve_purchase(purchase_id: str, db = Depends(get_db)):
    purchase = await db.purchase.find_unique(where={'id': purchase_id})
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    
    await db.purchase.update(
        where={'id': purchase_id},
        data={'status': 'ordered'}
    )
    return {"message": "Purchase approved"}


@router.delete("/{purchase_id}")
async def delete_purchase(purchase_id: str, db = Depends(get_db)):
    await db.purchase.delete(where={'id': purchase_id})
    return {"message": "Purchase deleted"}
