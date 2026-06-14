from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

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
    pageSize: int = 10
):
    # TODO: Implement with Prisma
    return []


@router.get("/{purchase_id}", response_model=Purchase)
async def get_purchase(purchase_id: str):
    # TODO: Implement with Prisma
    raise HTTPException(status_code=404, detail="Purchase not found")


@router.post("/", response_model=Purchase)
async def create_purchase(purchase: PurchaseCreate):
    # TODO: Implement with Prisma
    return purchase


@router.put("/{purchase_id}/approve")
async def approve_purchase(purchase_id: str):
    # TODO: Implement with Prisma
    return {"message": "Purchase approved"}


@router.delete("/{purchase_id}")
async def delete_purchase(purchase_id: str):
    # TODO: Implement with Prisma
    return {"message": "Purchase deleted"}
