from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from io import BytesIO
from app.core.database import get_db
from app.core.rbac import check_permission
from app.models import User, Invoice, Quote, Sale
from app.core.pdf_generator import pdf_generator
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/invoices/{invoice_id}/pdf")
async def export_invoice_pdf(
    invoice_id: int,
    current_user: User = Depends(check_permission("invoices_view")),
    db: Session = Depends(get_db),
):
    """Export invoice as PDF"""
    try:
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Prepare invoice data for PDF
        invoice_data = {
            "id": invoice.id,
            "invoice_number": f"INV-{invoice.id:05d}",
            "created_at": invoice.created_at.strftime("%Y-%m-%d") if invoice.created_at else "",
            "customer": {
                "name": invoice.sale.customer.name if invoice.sale and invoice.sale.customer else "N/A",
                "email": invoice.sale.customer.email if invoice.sale and invoice.sale.customer else "",
                "address": invoice.sale.customer.address if invoice.sale and invoice.sale.customer else "",
            },
            "items": [],
            "subtotal": invoice.subtotal or 0,
            "tax": invoice.tax or 0,
            "total": invoice.total or 0,
            "status": invoice.status or "PENDING",
        }
        
        # Add items from sale
        if invoice.sale and invoice.sale.items:
            for item in invoice.sale.items:
                invoice_data["items"].append({
                    "product": item.product.name if item.product else "N/A",
                    "qty": item.quantity or 0,
                    "price": item.unit_price or 0,
                    "amount": (item.quantity or 0) * (item.unit_price or 0),
                })
        
        # Generate PDF
        pdf_bytes = pdf_generator.generate_invoice_pdf(invoice_data)
        
        filename = f"Invoice-{invoice.id}-{datetime.now().strftime('%Y%m%d')}.pdf"
        
        return FileResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    except Exception as e:
        logger.error(f"Error exporting invoice PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")


@router.get("/quotes/{quote_id}/pdf")
async def export_quote_pdf(
    quote_id: int,
    current_user: User = Depends(check_permission("quotes_view")),
    db: Session = Depends(get_db),
):
    """Export quote as PDF"""
    try:
        quote = db.query(Quote).filter(Quote.id == quote_id).first()
        
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        
        # Prepare quote data for PDF
        quote_data = {
            "id": quote.id,
            "invoice_number": f"QT-{quote.id:05d}",
            "created_at": quote.created_at.strftime("%Y-%m-%d") if quote.created_at else "",
            "customer": {
                "name": quote.customer.name if quote.customer else "N/A",
                "email": quote.customer.email if quote.customer else "",
                "address": quote.customer.address if quote.customer else "",
            },
            "items": [],
            "subtotal": quote.subtotal or 0,
            "tax": quote.tax or 0,
            "total": quote.total or 0,
            "status": "QUOTE",
        }
        
        # Add items from quote
        if quote.items:
            for item in quote.items:
                quote_data["items"].append({
                    "product": item.product.name if item.product else "N/A",
                    "qty": item.quantity or 0,
                    "price": item.unit_price or 0,
                    "amount": (item.quantity or 0) * (item.unit_price or 0),
                })
        
        # Generate PDF
        pdf_bytes = pdf_generator.generate_quote_pdf(quote_data)
        
        filename = f"Quote-{quote.id}-{datetime.now().strftime('%Y%m%d')}.pdf"
        
        return FileResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    except Exception as e:
        logger.error(f"Error exporting quote PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")


@router.get("/reports/pdf")
async def export_report_pdf(
    report_type: str = Query("sales", enum=["sales", "inventory", "customers"]),
    current_user: User = Depends(check_permission("reports_view")),
    db: Session = Depends(get_db),
):
    """Export report as PDF"""
    try:
        report_title = f"{report_type.title()} Report"
        report_data = []
        
        if report_type == "sales":
            sales = db.query(Sale).limit(50).all()
            report_data = [
                {
                    "ID": sale.id,
                    "Customer": sale.customer.name if sale.customer else "N/A",
                    "Total": f"${sale.total_amount or 0:.2f}",
                    "Status": sale.status or "PENDING",
                    "Date": sale.created_at.strftime("%Y-%m-%d") if sale.created_at else "",
                }
                for sale in sales
            ]
        
        elif report_type == "inventory":
            from app.models import Product
            products = db.query(Product).limit(50).all()
            report_data = [
                {
                    "ID": product.id,
                    "SKU": product.sku or "N/A",
                    "Name": product.name or "N/A",
                    "Stock": product.stock or 0,
                    "Price": f"${product.price or 0:.2f}",
                }
                for product in products
            ]
        
        elif report_type == "customers":
            from app.models import Customer
            customers = db.query(Customer).limit(50).all()
            report_data = [
                {
                    "ID": customer.id,
                    "Name": customer.name or "N/A",
                    "Email": customer.email or "N/A",
                    "Phone": customer.phone or "N/A",
                    "City": customer.city or "N/A",
                }
                for customer in customers
            ]
        
        # Generate PDF
        pdf_bytes = pdf_generator.generate_report_pdf(report_title, report_data)
        
        filename = f"Report-{report_type}-{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        return FileResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    except Exception as e:
        logger.error(f"Error exporting report PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")
