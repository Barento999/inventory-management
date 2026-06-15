from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Quote

router = APIRouter()


class QuoteBase(BaseModel):
    customer_id: int
    total: float
    status: str = "draft"
    valid_until: Optional[str] = None
    notes: Optional[str] = None


class QuoteCreate(QuoteBase):
    pass


class QuoteUpdate(BaseModel):
    total: Optional[float] = None
    status: Optional[str] = None
    valid_until: Optional[str] = None
    notes: Optional[str] = None


class QuoteSchema(QuoteBase):
    id: int

    class Config:
        from_attributes = True


@router.get("")
async def list_quotes_no_slash(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db)
):
    """List all quotes (no trailing slash)"""
    return await list_quotes(search, status, page, page_size, db)


@router.get("/")
async def list_quotes(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db)
):
    """List all quotes with pagination wrapper"""
    query = db.query(Quote)
    
    if status:
        query = query.filter(Quote.status == status)
    
    total = query.count()
    offset = (page - 1) * page_size
    quotes = query.order_by(Quote.created_at.desc()).offset(offset).limit(page_size).all()
    
    # Convert to dict manually
    quotes_data = [
        {
            "id": q.id,
            "customer_id": q.customer_id,
            "total": q.total,
            "status": q.status,
            "valid_until": q.valid_until.isoformat() if q.valid_until else None,
            "notes": q.notes
        }
        for q in quotes
    ]
    
    return {
        "data": quotes_data,
        "pagination": {
            "page": page,
            "pageSize": page_size,
            "total": total,
            "totalPages": (total + page_size - 1) // page_size
        }
    }


@router.get("/{quote_id}", response_model=QuoteSchema)
async def get_quote(quote_id: int, db: Session = Depends(get_db)):
    """Get a specific quote"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return quote


@router.post("/", response_model=QuoteSchema)
async def create_quote(quote: QuoteCreate, db: Session = Depends(get_db)):
    """Create a new quote"""
    db_quote = Quote(**quote.dict())
    db.add(db_quote)
    db.commit()
    db.refresh(db_quote)
    return db_quote


@router.put("/{quote_id}", response_model=QuoteSchema)
async def update_quote(quote_id: int, quote: QuoteUpdate, db: Session = Depends(get_db)):
    """Update a quote"""
    db_quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not db_quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    update_data = quote.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_quote, key, value)
    
    db.commit()
    db.refresh(db_quote)
    return db_quote


@router.delete("/{quote_id}")
async def delete_quote(quote_id: int, db: Session = Depends(get_db)):
    """Delete a quote"""
    db_quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not db_quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    db.delete(db_quote)
    db.commit()
    return {"message": "Quote deleted successfully"}
