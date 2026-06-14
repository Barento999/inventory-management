from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db

router = APIRouter()


class SupplierBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None


class Supplier(SupplierBase):
    id: int

    class Config:
        from_attributes = True


@router.get("/", response_model=List[dict])
async def list_suppliers(
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    db = Depends(get_db)
):
    """List all suppliers"""
    try:
        query = "SELECT * FROM suppliers WHERE 1=1"
        params = []
        
        if search:
            query += " AND (name ILIKE %s OR email ILIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])
        
        offset = (page - 1) * page_size
        query += f" LIMIT {page_size} OFFSET {offset}"
        
        suppliers = db.fetch_all(query, params if params else None)
        return suppliers or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{supplier_id}", response_model=dict)
async def get_supplier(supplier_id: int, db = Depends(get_db)):
    """Get a specific supplier"""
    try:
        supplier = db.fetch_one("SELECT * FROM suppliers WHERE id = %s", (supplier_id,))
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
        return supplier
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict)
async def create_supplier(supplier: SupplierCreate, db = Depends(get_db)):
    """Create a new supplier"""
    try:
        query = """
        INSERT INTO suppliers (name, email, phone, address, contact_person)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING *
        """
        result = db.fetch_one(
            query, 
            (supplier.name, supplier.email, supplier.phone, supplier.address, supplier.contact_person)
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{supplier_id}", response_model=dict)
async def update_supplier(supplier_id: int, supplier: SupplierUpdate, db = Depends(get_db)):
    """Update a supplier"""
    try:
        existing = db.fetch_one("SELECT id FROM suppliers WHERE id = %s", (supplier_id,))
        if not existing:
            raise HTTPException(status_code=404, detail="Supplier not found")
        
        # Build update query
        updates = []
        params = []
        
        if supplier.name:
            updates.append("name = %s")
            params.append(supplier.name)
        if supplier.email:
            updates.append("email = %s")
            params.append(supplier.email)
        if supplier.phone:
            updates.append("phone = %s")
            params.append(supplier.phone)
        if supplier.address:
            updates.append("address = %s")
            params.append(supplier.address)
        if supplier.contact_person:
            updates.append("contact_person = %s")
            params.append(supplier.contact_person)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        params.append(supplier_id)
        query = f"UPDATE suppliers SET {', '.join(updates)} WHERE id = %s RETURNING *"
        result = db.fetch_one(query, params)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{supplier_id}")
async def delete_supplier(supplier_id: int, db = Depends(get_db)):
    """Delete a supplier"""
    try:
        existing = db.fetch_one("SELECT id FROM suppliers WHERE id = %s", (supplier_id,))
        if not existing:
            raise HTTPException(status_code=404, detail="Supplier not found")
        
        db.execute("DELETE FROM suppliers WHERE id = %s", (supplier_id,))
        return {"message": "Supplier deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
