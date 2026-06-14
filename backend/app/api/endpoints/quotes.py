from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class QuoteItem(BaseModel):
    productId: str
    quantity: int
    unitPrice: float


class QuoteBase(BaseModel):
    customerId: str
    items: List[QuoteItem]
    status: str
    validUntil: Optional[str] = None
    notes: Optional[str] = None


class QuoteCreate(QuoteBase):
    pass


class QuoteUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class Quote(QuoteBase):
    id: str
    customerName: str
    total: float
    createdAt: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[Quote])
async def list_quotes(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    pageSize: int = 10
):
    # TODO: Implement with Prisma
    return []


@router.get("/{quote_id}", response_model=Quote)
async def get_quote(quote_id: str):
    # TODO: Implement with Prisma
    raise HTTPException(status_code=404, detail="Quote not found")


@router.post("/", response_model=Quote)
async def create_quote(quote: QuoteCreate):
    # TODO: Implement with Prisma
    return quote


@router.put("/{quote_id}/status")
async def update_quote_status(quote_id: str, status: str):
    # TODO: Implement with Prisma
    return {"message": "Status updated"}


@router.delete("/{quote_id}")
async def delete_quote(quote_id: str):
    # TODO: Implement with Prisma
    return {"message": "Quote deleted"}
