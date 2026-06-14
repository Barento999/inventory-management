from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from prisma import Prisma

router = APIRouter()


class CustomerBase(BaseModel):
    name: str
    email: str
    phone: str
    address: str
    status: str


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None


class Customer(CustomerBase):
    id: str
    orderCount: int

    class Config:
        from_attributes = True


@router.get("/", response_model=List[Customer])
async def list_customers(
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
            {'phone': {'contains': search}},
        ]
    
    skip = (page - 1) * pageSize
    customers = await db.customer.find_many(
        where=where,
        skip=skip,
        take=pageSize,
        order={'createdAt': 'desc'},
        include={'sales': True}
    )
    
    result = []
    for customer in customers:
        result.append({
            **customer.model_dump(),
            'orderCount': len(customer.sales)
        })
    return result


@router.get("/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str, db: Prisma = Depends(get_db)):
    customer = await db.customer.find_unique(
        where={'id': customer_id},
        include={'sales': True}
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {
        **customer.model_dump(),
        'orderCount': len(customer.sales)
    }


@router.post("/", response_model=Customer)
async def create_customer(customer: CustomerCreate, db: Prisma = Depends(get_db)):
    new_customer = await db.customer.create(
        data={
            'name': customer.name,
            'email': customer.email,
            'phone': customer.phone,
            'address': customer.address,
            'status': customer.status,
        }
    )
    return {**new_customer.model_dump(), 'orderCount': 0}


@router.put("/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer: CustomerUpdate, db: Prisma = Depends(get_db)):
    existing = await db.customer.find_unique(
        where={'id': customer_id},
        include={'sales': True}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    update_data = {k: v for k, v in customer.model_dump().items() if v is not None}
    updated = await db.customer.update(
        where={'id': customer_id},
        data=update_data
    )
    
    return {
        **updated.model_dump(),
        'orderCount': len(existing.sales)
    }


@router.delete("/{customer_id}")
async def delete_customer(customer_id: str, db: Prisma = Depends(get_db)):
    await db.customer.delete(where={'id': customer_id})
    return {"message": "Customer deleted"}
