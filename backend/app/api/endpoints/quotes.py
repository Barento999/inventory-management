from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db

router = APIRouter()


class QuoteBase(BaseModel):
    customer_id: int
    total: float
    status: str
    valid_until: Optional[str] = None
    notes: Optional[str] = None


class Quote(QuoteBase):
    id: int

    class Config:
        from_attributes = True


@router.get("/", response_model=List[dict])
async def list_quotes(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    db = Depends(get_db)
):
    """List all quotes"""
    try:
        query = """
        SELECT q.*, c.name as customer_name 
        FROM quotes q 
        LEFT JOIN customers c ON q.customer_id = c.id
        WHERE 1=1
        """
        params = []
        
        if status:
            query += " AND q.status = %s"
            params.append(status)
        
        if search:
            query += " AND (c.name ILIKE %s OR q.notes ILIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])
        
        offset = (page - 1) * page_size
        query += f" ORDER BY q.created_at DESC LIMIT {page_size} OFFSET {offset}"
        
        quotes = db.fetch_all(query, params if params else None)
        return quotes or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{quote_id}", response_model=dict)
async def get_quote(quote_id: int, db = Depends(get_db)):
    """Get a specific quote"""
    try:
        quote = db.fetch_one("SELECT * FROM quotes WHERE id = %s", (quote_id,))
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        return quote
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict)
async def create_quote(quote: QuoteBase, db = Depends(get_db)):
    """Create a new quote"""
    try:
        query = """
        INSERT INTO quotes (customer_id, total, status, valid_until, notes)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING *
        """
        result = db.fetch_one(
            query, 
            (quote.customer_id, quote.total, quote.status, quote.valid_until, quote.notes)
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{quote_id}", response_model=dict)
async def update_quote(quote_id: int, quote: QuoteBase, db = Depends(get_db)):
    """Update a quote"""
    try:
        existing = db.fetch_one("SELECT id FROM quotes WHERE id = %s", (quote_id,))
        if not existing:
            raise HTTPException(status_code=404, detail="Quote not found")
        
        query = """
        UPDATE quotes 
        SET customer_id = %s, total = %s, status = %s, valid_until = %s, notes = %s
        WHERE id = %s 
        RETURNING *
        """
        result = db.fetch_one(
            query, 
            (quote.customer_id, quote.total, quote.status, quote.valid_until, quote.notes, quote_id)
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{quote_id}")
async def delete_quote(quote_id: int, db = Depends(get_db)):
    """Delete a quote"""
    try:
        existing = db.fetch_one("SELECT id FROM quotes WHERE id = %s", (quote_id,))
        if not existing:
            raise HTTPException(status_code=404, detail="Quote not found")
        
        db.execute("DELETE FROM quotes WHERE id = %s", (quote_id,))
        return {"message": "Quote deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
