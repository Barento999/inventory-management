from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db

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


class Customer(CustomerBase):
    id: int

    class Config:
        from_attributes = True


@router.get("/", response_model=List[dict])
async def list_customers(
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    db = Depends(get_db)
):
    """List all customers"""
    try:
        query = "SELECT * FROM customers WHERE 1=1"
        params = []
        
        if search:
            query += " AND (name ILIKE %s OR email ILIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])
        
        offset = (page - 1) * page_size
        query += f" LIMIT {page_size} OFFSET {offset}"
        
        customers = db.fetch_all(query, params if params else None)
        return customers or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{customer_id}", response_model=dict)
async def get_customer(customer_id: int, db = Depends(get_db)):
    """Get a specific customer"""
    try:
        customer = db.fetch_one("SELECT * FROM customers WHERE id = %s", (customer_id,))
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict)
async def create_customer(customer: CustomerCreate, db = Depends(get_db)):
    """Create a new customer"""
    try:
        query = """
        INSERT INTO customers (name, email, phone, address)
        VALUES (%s, %s, %s, %s)
        RETURNING *
        """
        result = db.fetch_one(query, (customer.name, customer.email, customer.phone, customer.address))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{customer_id}", response_model=dict)
async def update_customer(customer_id: int, customer: CustomerUpdate, db = Depends(get_db)):
    """Update a customer"""
    try:
        # Check if customer exists
        existing = db.fetch_one("SELECT id FROM customers WHERE id = %s", (customer_id,))
        if not existing:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Build update query
        updates = []
        params = []
        
        if customer.name:
            updates.append("name = %s")
            params.append(customer.name)
        if customer.email:
            updates.append("email = %s")
            params.append(customer.email)
        if customer.phone:
            updates.append("phone = %s")
            params.append(customer.phone)
        if customer.address:
            updates.append("address = %s")
            params.append(customer.address)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        params.append(customer_id)
        query = f"UPDATE customers SET {', '.join(updates)} WHERE id = %s RETURNING *"
        result = db.fetch_one(query, params)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{customer_id}")
async def delete_customer(customer_id: int, db = Depends(get_db)):
    """Delete a customer"""
    try:
        existing = db.fetch_one("SELECT id FROM customers WHERE id = %s", (customer_id,))
        if not existing:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        db.execute("DELETE FROM customers WHERE id = %s", (customer_id,))
        return {"message": "Customer deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
