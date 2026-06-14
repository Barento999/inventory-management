from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db

router = APIRouter()


class PurchaseBase(BaseModel):
    supplier_id: int
    total: float
    status: str
    expected_date: Optional[str] = None
    notes: Optional[str] = None


class Purchase(PurchaseBase):
    id: int

    class Config:
        from_attributes = True


@router.get("/", response_model=List[dict])
async def list_purchases(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    db = Depends(get_db)
):
    """List all purchases"""
    try:
        query = """
        SELECT p.*, s.name as supplier_name 
        FROM purchases p 
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE 1=1
        """
        params = []
        
        if status:
            query += " AND p.status = %s"
            params.append(status)
        
        if search:
            query += " AND (s.name ILIKE %s OR p.notes ILIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])
        
        offset = (page - 1) * page_size
        query += f" ORDER BY p.created_at DESC LIMIT {page_size} OFFSET {offset}"
        
        purchases = db.fetch_all(query, params if params else None)
        return purchases or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{purchase_id}", response_model=dict)
async def get_purchase(purchase_id: int, db = Depends(get_db)):
    """Get a specific purchase"""
    try:
        purchase = db.fetch_one("SELECT * FROM purchases WHERE id = %s", (purchase_id,))
        if not purchase:
            raise HTTPException(status_code=404, detail="Purchase not found")
        return purchase
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict)
async def create_purchase(purchase: PurchaseBase, db = Depends(get_db)):
    """Create a new purchase"""
    try:
        query = """
        INSERT INTO purchases (supplier_id, total, status, expected_date, notes, user_id)
        VALUES (%s, %s, %s, %s, %s, (SELECT id FROM users LIMIT 1))
        RETURNING *
        """
        result = db.fetch_one(
            query, 
            (purchase.supplier_id, purchase.total, purchase.status, purchase.expected_date, purchase.notes)
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{purchase_id}", response_model=dict)
async def update_purchase(purchase_id: int, purchase: PurchaseBase, db = Depends(get_db)):
    """Update a purchase"""
    try:
        existing = db.fetch_one("SELECT id FROM purchases WHERE id = %s", (purchase_id,))
        if not existing:
            raise HTTPException(status_code=404, detail="Purchase not found")
        
        query = """
        UPDATE purchases 
        SET supplier_id = %s, total = %s, status = %s, expected_date = %s, notes = %s
        WHERE id = %s 
        RETURNING *
        """
        result = db.fetch_one(
            query, 
            (purchase.supplier_id, purchase.total, purchase.status, purchase.expected_date, purchase.notes, purchase_id)
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{purchase_id}")
async def delete_purchase(purchase_id: int, db = Depends(get_db)):
    """Delete a purchase"""
    try:
        existing = db.fetch_one("SELECT id FROM purchases WHERE id = %s", (purchase_id,))
        if not existing:
            raise HTTPException(status_code=404, detail="Purchase not found")
        
        db.execute("DELETE FROM purchases WHERE id = %s", (purchase_id,))
        return {"message": "Purchase deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
