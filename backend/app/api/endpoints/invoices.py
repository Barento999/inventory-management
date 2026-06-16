from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_permission
from app.models import Invoice

router = APIRouter()


class InvoiceBase(BaseModel):
    sale_id: int
    invoice_number: str
    total: float
    status: str = "pending"
    due_date: Optional[str] = None
    paid_date: Optional[str] = None


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    due_date: Optional[str] = None
    paid_date: Optional[str] = None


class InvoiceSchema(InvoiceBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True


@require_permission("invoices_view")
async def list_invoices(
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get all invoices"""
    query = db.query(Invoice)
    
    if status:
        query = query.filter(Invoice.status == status)
    
    total = query.count()
    offset = (page - 1) * page_size
    invoices = query.order_by(Invoice.created_at.desc()).offset(offset).limit(page_size).all()
    
    # Convert to dict manually
    invoices_data = [
        {
            "id": inv.id,
            "saleId": inv.sale_id,
            "invoiceNumber": inv.invoice_number,
            "total": inv.total,
            "status": inv.status,
            "dueDate": inv.due_date.isoformat() if inv.due_date else None,
            "paidDate": inv.paid_date.isoformat() if inv.paid_date else None,
            "createdAt": inv.created_at.isoformat() if inv.created_at else None
        }
        for inv in invoices
    ]
    
    return {
        "data": invoices_data,
        "pagination": {
            "page": page,
            "pageSize": page_size,
            "total": total,
            "totalPages": (total + page_size - 1) // page_size
        }
    }


@router.post("")
@require_permission("invoices_create")
async def create_invoice(
    invoice: InvoiceCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Create a new invoice"""
    db_invoice = Invoice(**invoice.dict())
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    
    return {
        "id": db_invoice.id,
        "saleId": db_invoice.sale_id,
        "invoiceNumber": db_invoice.invoice_number,
        "total": db_invoice.total,
        "status": db_invoice.status,
        "dueDate": db_invoice.due_date.isoformat() if db_invoice.due_date else None,
        "paidDate": db_invoice.paid_date.isoformat() if db_invoice.paid_date else None,
        "createdAt": db_invoice.created_at.isoformat() if db_invoice.created_at else None
    }


@router.put("/{invoice_id}")
@require_permission("invoices_update")
async def update_invoice(
    invoice_id: int,
    invoice: InvoiceUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Update an invoice"""
    db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    update_data = invoice.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_invoice, key, value)
    
    db.commit()
    db.refresh(db_invoice)
    
    return {
        "id": db_invoice.id,
        "saleId": db_invoice.sale_id,
        "invoiceNumber": db_invoice.invoice_number,
        "total": db_invoice.total,
        "status": db_invoice.status,
        "dueDate": db_invoice.due_date.isoformat() if db_invoice.due_date else None,
        "paidDate": db_invoice.paid_date.isoformat() if db_invoice.paid_date else None,
        "createdAt": db_invoice.created_at.isoformat() if db_invoice.created_at else None
    }


@router.put("/{invoice_id}/mark-paid")
@require_permission("invoices_update")
async def mark_invoice_paid(
    invoice_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Mark invoice as paid"""
    db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    db_invoice.status = "paid"
    from datetime import datetime
    db_invoice.paid_date = datetime.now()
    db.commit()
    db.refresh(db_invoice)
    
    return {
        "id": db_invoice.id,
        "saleId": db_invoice.sale_id,
        "invoiceNumber": db_invoice.invoice_number,
        "total": db_invoice.total,
        "status": db_invoice.status,
        "dueDate": db_invoice.due_date.isoformat() if db_invoice.due_date else None,
        "paidDate": db_invoice.paid_date.isoformat() if db_invoice.paid_date else None,
        "createdAt": db_invoice.created_at.isoformat() if db_invoice.created_at else None
    }


@router.delete("/{invoice_id}")
@require_permission("invoices_delete")
async def delete_invoice(
    invoice_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Delete an invoice"""
    db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    db.delete(db_invoice)
    db.commit()
    
    return {"message": "Invoice deleted successfully"}
