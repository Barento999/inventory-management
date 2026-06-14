from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class SaleItem(BaseModel):
    productId: str
    quantity: int
    unitPrice: float


class SaleBase(BaseModel):
    customerId: str
    items: List[SaleItem]
    status: str
    notes: Optional[str] = None


class SaleCreate(SaleBase):
    pass


class SaleUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class Sale(SaleBase):
    id: str
    customerName: str
    total: float
    createdAt: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[Sale])
async def list_sales(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    pageSize: int = 10
):
    # TODO: Implement with Prisma
    return []


@router.get("/{sale_id}", response_model=Sale)
async def get_sale(sale_id: str):
    # TODO: Implement with Prisma
    raise HTTPException(status_code=404, detail="Sale not found")


@router.post("/", response_model=Sale)
async def create_sale(sale: SaleCreate):
    # TODO: Implement with Prisma
    return sale


@router.put("/{sale_id}/status")
async def update_sale_status(sale_id: str, status: str):
    # TODO: Implement with Prisma
    return {"message": "Status updated"}


@router.delete("/{sale_id}")
async def delete_sale(sale_id: str):
    # TODO: Implement with Prisma
    return {"message": "Sale deleted"}
