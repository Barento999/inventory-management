from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db

router = APIRouter()


class SaleBase(BaseModel):
    customer_id: int
    total: float
    status: str
    notes: Optional[str] = None


class Sale(SaleBase):
    id: int

    class Config:
        from_attributes = True


@router.get("/", response_model=List[dict])
async def list_sales(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    db = Depends(get_db)
):
    """List all sales"""
    try:
        query = """
        SELECT s.*, c.name as customer_name 
        FROM sales s 
        LEFT JOIN customers c ON s.customer_id = c.id
        WHERE 1=1
        """
        params = []
        
        if status:
            query += " AND s.status = %s"
            params.append(status)
        
        if search:
            query += " AND (c.name ILIKE %s OR s.notes ILIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])
        
        offset = (page - 1) * page_size
        query += f" ORDER BY s.created_at DESC LIMIT {page_size} OFFSET {offset}"
        
        sales = db.fetch_all(query, params if params else None)
        return sales or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{sale_id}", response_model=dict)
async def get_sale(sale_id: int, db = Depends(get_db)):
    """Get a specific sale"""
    try:
        sale = db.fetch_one("SELECT * FROM sales WHERE id = %s", (sale_id,))
        if not sale:
            raise HTTPException(status_code=404, detail="Sale not found")
        return sale
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict)
async def create_sale(sale: SaleBase, db = Depends(get_db)):
    """Create a new sale"""
    try:
        query = """
        INSERT INTO sales (customer_id, total, status, notes, user_id)
        VALUES (%s, %s, %s, %s, (SELECT id FROM users LIMIT 1))
        RETURNING *
        """
        result = db.fetch_one(query, (sale.customer_id, sale.total, sale.status, sale.notes))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{sale_id}", response_model=dict)
async def update_sale(sale_id: int, sale: SaleBase, db = Depends(get_db)):
    """Update a sale"""
    try:
        existing = db.fetch_one("SELECT id FROM sales WHERE id = %s", (sale_id,))
        if not existing:
            raise HTTPException(status_code=404, detail="Sale not found")
        
        query = """
        UPDATE sales 
        SET customer_id = %s, total = %s, status = %s, notes = %s
        WHERE id = %s 
        RETURNING *
        """
        result = db.fetch_one(query, (sale.customer_id, sale.total, sale.status, sale.notes, sale_id))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{sale_id}")
async def delete_sale(sale_id: int, db = Depends(get_db)):
    """Delete a sale"""
    try:
        existing = db.fetch_one("SELECT id FROM sales WHERE id = %s", (sale_id,))
        if not existing:
            raise HTTPException(status_code=404, detail="Sale not found")
        
        db.execute("DELETE FROM sales WHERE id = %s", (sale_id,))
        return {"message": "Sale deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
