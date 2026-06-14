from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db

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
    pageSize: int = 10,
    db = Depends(get_db)
):
    where = {}
    if status:
        where['status'] = status
    if search:
        where['OR'] = [
            {'customerName': {'contains': search}},
            {'notes': {'contains': search}},
        ]
    
    skip = (page - 1) * pageSize
    quotes = await db.quote.find_many(
        where=where,
        skip=skip,
        take=pageSize,
        order={'createdAt': 'desc'},
        include={'customer': True}
    )
    
    result = []
    for quote in quotes:
        total = sum(item.quantity * item.unitPrice for item in quote.items)
        result.append({
            **quote.model_dump(),
            'customerName': quote.customer.name,
            'total': total
        })
    return result


@router.get("/{quote_id}", response_model=Quote)
async def get_quote(quote_id: str, db = Depends(get_db)):
    quote = await db.quote.find_unique(
        where={'id': quote_id},
        include={'customer': True}
    )
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    total = sum(item.quantity * item.unitPrice for item in quote.items)
    return {
        **quote.model_dump(),
        'customerName': quote.customer.name,
        'total': total
    }


@router.post("/", response_model=Quote)
async def create_quote(quote: QuoteCreate, db = Depends(get_db)):
    customer = await db.customer.find_unique(where={'id': quote.customerId})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    total = sum(item.quantity * item.unitPrice for item in quote.items)
    
    new_quote = await db.quote.create(
        data={
            'customerId': quote.customerId,
            'status': quote.status,
            'validUntil': quote.validUntil,
            'notes': quote.notes,
            'items': {
                'create': [
                    {
                        'productId': item.productId,
                        'quantity': item.quantity,
                        'unitPrice': item.unitPrice,
                    }
                    for item in quote.items
                ]
            }
        }
    )
    
    return {
        **new_quote.model_dump(),
        'customerName': customer.name,
        'total': total
    }


@router.put("/{quote_id}/status")
async def update_quote_status(quote_id: str, status: str, db = Depends(get_db)):
    quote = await db.quote.find_unique(where={'id': quote_id})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    await db.quote.update(
        where={'id': quote_id},
        data={'status': status}
    )
    return {"message": "Status updated"}


@router.delete("/{quote_id}")
async def delete_quote(quote_id: str, db = Depends(get_db)):
    await db.quote.delete(where={'id': quote_id})
    return {"message": "Quote deleted"}
