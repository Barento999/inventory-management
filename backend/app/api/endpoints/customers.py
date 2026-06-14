from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel

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
    pageSize: int = 10
):
    # TODO: Implement with Prisma
    return []


@router.get("/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str):
    # TODO: Implement with Prisma
    raise HTTPException(status_code=404, detail="Customer not found")


@router.post("/", response_model=Customer)
async def create_customer(customer: CustomerCreate):
    # TODO: Implement with Prisma
    return customer


@router.put("/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer: CustomerUpdate):
    # TODO: Implement with Prisma
    raise HTTPException(status_code=404, detail="Customer not found")


@router.delete("/{customer_id}")
async def delete_customer(customer_id: str):
    # TODO: Implement with Prisma
    return {"message": "Customer deleted"}
