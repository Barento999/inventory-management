from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_permission
from app.models import Product, Sale, Purchase, Customer, Supplier

router = APIRouter()


@router.get("/summary")
@require_permission("reports_view")
async def get_dashboard_summary(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
    current_user = None
):
    """Get dashboard summary statistics"""
    
    # Product statistics
    total_products = db.query(Product).count()
    total_value = db.query(Product).all()
    total_inventory_value = sum(p.stock * p.cost for p in total_value)
    low_stock_products = db.query(Product).filter(Product.stock <= Product.reorder_level).count()
    
    # Sales statistics
    total_sales = db.query(Sale).count()
    sales_revenue = db.query(Sale).all()
    total_revenue = sum(s.total for s in sales_revenue)
    
    # Recent sales
    recent_sales = db.query(Sale).order_by(Sale.created_at.desc()).limit(5).all()
    recent_sales_data = []
    for sale in recent_sales:
        customer = db.query(Customer).filter(Customer.id == sale.customer_id).first()
        recent_sales_data.append({
            "id": sale.id,
            "customerName": customer.name if customer else "Unknown",
            "total": sale.total,
            "status": sale.status,
        })
    
    # Purchase statistics
    total_purchases = db.query(Purchase).count()
    purchases_cost = db.query(Purchase).all()
    total_cost = sum(p.total for p in purchases_cost)
    
    # Customer and supplier counts
    total_customers = db.query(Customer).count()
    total_suppliers = db.query(Supplier).count()
    
    return {
        "totalProducts": total_products,
        "totalSales": total_sales,
        "totalRevenue": total_revenue,
        "lowStockItems": low_stock_products,
        "totalCustomers": total_customers,
        "totalSuppliers": total_suppliers,
        "inventoryValue": total_inventory_value,
        "chartData": [
            {"name": "Jan", "sales": 1200, "revenue": 1200},
            {"name": "Feb", "sales": 1900, "revenue": 1900},
            {"name": "Mar", "sales": 1500, "revenue": 1500},
        ],
        "recentSales": recent_sales_data,
        "recentMovements": []
    }


@router.get("/top-products")
@require_permission("reports_view")
async def get_top_products(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
    current_user = None
):
    """Get top selling products"""
    # For now, return top products by stock value
    products = db.query(Product).order_by((Product.stock * Product.price).desc()).limit(10).all()
    
    top_products_data = [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "stock": p.stock,
            "price": p.price,
            "value": p.stock * p.price
        }
        for p in products
    ]
    
    return top_products_data
