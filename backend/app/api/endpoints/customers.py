from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_permission, check_permission
from app.models import Customer, User

router = APIRouter()


class CustomerBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class CustomerSchema(CustomerBase):
    id: int

    class Config:
        from_attributes = True


@router.get("/")
@require_permission("customers_view")
async def list_customers(
    search: Optional[str] = None,
    page: int = 1,
    pageSize: int = 10,
    current_user: User = Depends(check_permission("customers_view")),
    db: Session = Depends(get_db)
):
    """List all customers with pagination wrapper"""
    query = db.query(Customer)
    
    if search:
        query = query.filter(
            (Customer.name.ilike(f"%{search}%")) | 
            (Customer.email.ilike(f"%{search}%"))
        )
    
    total = query.count()
    offset = (page - 1) * pageSize
    customers = query.offset(offset).limit(pageSize).all()
    
    # Convert to dict manually
    customers_data = [
        {"id": c.id, "name": c.name, "email": c.email, "phone": c.phone, "address": c.address}
        for c in customers
    ]
    
    return {
        "data": customers_data,
        "pagination": {
            "page": page,
            "pageSize": pageSize,
            "total": total,
            "totalPages": (total + pageSize - 1) // pageSize
        }
    }


@router.get("/{customer_id}", response_model=CustomerSchema)
@require_permission("customers_view")
async def get_customer(
    customer_id: int,
    current_user: User = Depends(check_permission("customers_view")),
    db: Session = Depends(get_db)
):
    """Get a specific customer"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("/", response_model=CustomerSchema)
@require_permission("customers_create")
async def create_customer(
    customer: CustomerCreate,
    current_user: User = Depends(check_permission("customers_create")),
    db: Session = Depends(get_db)
):
    """Create a new customer"""
    db_customer = Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


@router.put("/{customer_id}", response_model=CustomerSchema)
@require_permission("customers_update")
async def update_customer(
    customer_id: int,
    customer: CustomerUpdate,
    current_user: User = Depends(check_permission("customers_update")),
    db: Session = Depends(get_db)
):
    """Update a customer"""
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    update_data = customer.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_customer, key, value)
    
    db.commit()
    db.refresh(db_customer)
    return db_customer


@router.delete("/{customer_id}")
@require_permission("customers_delete")
async def delete_customer(
    customer_id: int,
    current_user: User = Depends(check_permission("customers_delete")),
    db: Session = Depends(get_db)
):
    """Delete a customer"""
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db.delete(db_customer)
    db.commit()
    return {"message": "Customer deleted successfully"}
