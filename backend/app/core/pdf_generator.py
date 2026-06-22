from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from io import BytesIO
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class PDFGenerator:
    """Generate PDF documents for invoices, quotes, and reports"""
    
    def __init__(self, company_name="Inventory Management", company_address=""):
        self.company_name = company_name
        self.company_address = company_address
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
    
    def setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='Title',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='Header',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#374151'),
            spaceAfter=6
        ))
        
        self.styles.add(ParagraphStyle(
            name='Label',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#6b7280'),
            fontName='Helvetica-Bold'
        ))
    
    def generate_invoice_pdf(self, invoice_data: dict) -> bytes:
        """
        Generate PDF for an invoice
        
        invoice_data format:
        {
            "id": 1,
            "invoice_number": "INV-001",
            "created_at": "2024-06-23",
            "customer": {"name": "...", "email": "...", "address": "..."},
            "items": [{"product": "...", "qty": 1, "price": 100, "amount": 100}],
            "subtotal": 100,
            "tax": 10,
            "total": 110,
            "status": "paid"
        }
        """
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=0.5*inch,
                leftMargin=0.5*inch,
                topMargin=0.5*inch,
                bottomMargin=0.5*inch,
            )
            
            elements = []
            
            # Header
            elements.append(Paragraph(self.company_name, self.styles['Title']))
            elements.append(Paragraph(self.company_address, self.styles['Header']))
            elements.append(Spacer(1, 0.3*inch))
            
            # Invoice Title and Details
            invoice_header = [
                ['INVOICE', f"Invoice #: {invoice_data.get('invoice_number', 'N/A')}"],
                ['', f"Date: {invoice_data.get('created_at', '')}"],
                ['', f"Status: {invoice_data.get('status', 'PENDING').upper()}"],
            ]
            
            invoice_header_table = Table(invoice_header, colWidths=[3*inch, 3*inch])
            invoice_header_table.setStyle(TableStyle([
                ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 14),
                ('FONT', (1, 0), (1, -1), 'Helvetica', 10),
                ('TEXTCOLOR', (0, 0), (0, 0), colors.HexColor('#1e40af')),
                ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                ('ALIGN', (1, 0), (1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            
            elements.append(invoice_header_table)
            elements.append(Spacer(1, 0.2*inch))
            
            # Customer Info
            customer = invoice_data.get('customer', {})
            customer_info = [
                ['Bill To:', 'Ship To:'],
                [
                    f"{customer.get('name', 'N/A')}\n{customer.get('email', '')}\n{customer.get('address', '')}",
                    f"{customer.get('name', 'N/A')}\n{customer.get('address', '')}"
                ]
            ]
            
            customer_table = Table(customer_info, colWidths=[3.25*inch, 3.25*inch])
            customer_table.setStyle(TableStyle([
                ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 10),
                ('FONT', (0, 1), (-1, -1), 'Helvetica', 9),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ]))
            
            elements.append(customer_table)
            elements.append(Spacer(1, 0.3*inch))
            
            # Line Items Table
            items_data = [['Product', 'Qty', 'Unit Price', 'Amount']]
            
            for item in invoice_data.get('items', []):
                items_data.append([
                    item.get('product', 'N/A'),
                    str(item.get('qty', 0)),
                    f"${item.get('price', 0):.2f}",
                    f"${item.get('amount', 0):.2f}",
                ])
            
            items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1.25*inch, 1.25*inch])
            items_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 10),
                ('FONT', (0, 1), (-1, -1), 'Helvetica', 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
                ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
                ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ]))
            
            elements.append(items_table)
            elements.append(Spacer(1, 0.2*inch))
            
            # Totals
            subtotal = invoice_data.get('subtotal', 0)
            tax = invoice_data.get('tax', 0)
            total = invoice_data.get('total', 0)
            
            totals_data = [
                ['', 'Subtotal:', f"${subtotal:.2f}"],
                ['', 'Tax:', f"${tax:.2f}"],
                ['', 'Total:', f"${total:.2f}"],
            ]
            
            totals_table = Table(totals_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
            totals_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
                ('FONT', (1, 0), (1, -1), 'Helvetica-Bold', 9),
                ('FONT', (2, 0), (2, -2), 'Helvetica', 9),
                ('FONT', (2, -1), (2, -1), 'Helvetica-Bold', 11),
                ('TEXTCOLOR', (2, -1), (2, -1), colors.HexColor('#1e40af')),
                ('BACKGROUND', (1, -1), (-1, -1), colors.HexColor('#f3f4f6')),
                ('GRID', (1, -1), (-1, -1), 1, colors.HexColor('#d1d5db')),
                ('TOPPADDING', (1, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (1, 0), (-1, -1), 6),
            ]))
            
            elements.append(totals_table)
            elements.append(Spacer(1, 0.3*inch))
            
            # Footer
            elements.append(Paragraph(
                f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                self.styles['Header']
            ))
            
            # Build PDF
            doc.build(elements)
            buffer.seek(0)
            return buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error generating invoice PDF: {e}")
            raise
    
    def generate_quote_pdf(self, quote_data: dict) -> bytes:
        """Generate PDF for a quote"""
        quote_data['status'] = 'QUOTE'
        return self.generate_invoice_pdf(quote_data)
    
    def generate_report_pdf(self, report_title: str, report_data: list) -> bytes:
        """Generate PDF for a report"""
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=0.5*inch,
                leftMargin=0.5*inch,
                topMargin=0.5*inch,
                bottomMargin=0.5*inch,
            )
            
            elements = []
            
            # Title
            elements.append(Paragraph(report_title, self.styles['Title']))
            elements.append(Paragraph(
                f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                self.styles['Header']
            ))
            elements.append(Spacer(1, 0.3*inch))
            
            # Data Table
            if report_data and len(report_data) > 0:
                # Get column headers from first row
                headers = list(report_data[0].keys())
                table_data = [headers]
                
                for row in report_data:
                    table_data.append([str(row.get(col, '')) for col in headers])
                
                # Create table with dynamic column widths
                col_width = (7.5*inch) / len(headers)
                table = Table(table_data, colWidths=[col_width] * len(headers))
                
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 9),
                    ('FONT', (0, 1), (-1, -1), 'Helvetica', 8),
                    ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
                ]))
                
                elements.append(table)
            
            # Build PDF
            doc.build(elements)
            buffer.seek(0)
            return buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error generating report PDF: {e}")
            raise


# Global instance
pdf_generator = PDFGenerator()
