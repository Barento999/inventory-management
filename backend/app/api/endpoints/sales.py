from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db

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
    sales = await db.sale.find_many(
        where=where,
        skip=skip,
        take=pageSize,
        order={'createdAt': 'desc'},
        include={'customer': True}
    )
    
    result = []
    for sale in sales:
        total = sum(item.quantity * item.unitPrice for item in sale.items)
        result.append({
            **sale.model_dump(),
            'customerName': sale.customer.name,
            'total': total
        })
    return result


@router.get("/{sale_id}", response_model=Sale)
async def get_sale(sale_id: str, db = Depends(get_db)):
    sale = await db.sale.find_unique(
        where={'id': sale_id},
        include={'customer': True}
    )
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    total = sum(item.quantity * item.unitPrice for item in sale.items)
    return {
        **sale.model_dump(),
        'customerName': sale.customer.name,
        'total': total
    }


@router.post("/", response_model=Sale)
async def create_sale(sale: SaleCreate, db = Depends(get_db)):
    customer = await db.customer.find_unique(where={'id': sale.customerId})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    total = sum(item.quantity * item.unitPrice for item in sale.items)
    
    new_sale = await db.sale.create(
        data={
            'customerId': sale.customerId,
            'status': sale.status,
            'notes': sale.notes,
            'items': {
                'create': [
                    {
                        'productId': item.productId,
                        'quantity': item.quantity,
                        'unitPrice': item.unitPrice,
                    }
                    for item in sale.items
                ]
            }
        }
    )
    
    return {
        **new_sale.model_dump(),
        'customerName': customer.name,
        'total': total
    }


@router.put("/{sale_id}/status")
async def update_sale_status(sale_id: str, status: str, db = Depends(get_db)):
    sale = await db.sale.find_unique(where={'id': sale_id})
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    await db.sale.update(
        where={'id': sale_id},
        data={'status': status}
    )
    return {"message": "Status updated"}


@router.delete("/{sale_id}")
async def delete_sale(sale_id: str, db = Depends(get_db)):
    await db.sale.delete(where={'id': sale_id})
    return {"message": "Sale deleted"}
