from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Product, Sale, Purchase, Customer, Supplier

router = APIRouter()


@router.get("/summary")
async def get_dashboard_summary(db: Session = Depends(get_db)):
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
    
    # Purchase statistics
    total_purchases = db.query(Purchase).count()
    purchases_cost = db.query(Purchase).all()
    total_cost = sum(p.total for p in purchases_cost)
    
    # Customer and supplier counts
    total_customers = db.query(Customer).count()
    total_suppliers = db.query(Supplier).count()
    
    return {
        "totalProducts": total_products,
        "totalValue": total_inventory_value,
        "lowStockProducts": low_stock_products,
        "totalSales": total_sales,
        "totalPurchases": total_purchases,
        "salesRevenue": total_revenue,
        "purchasesCost": total_cost,
        "totalCustomers": total_customers,
        "totalSuppliers": total_suppliers,
        "chartData": [
            {"month": "Jan", "sales": 1200, "purchases": 800},
            {"month": "Feb", "sales": 1900, "purchases": 1200},
            {"month": "Mar", "sales": 1500, "purchases": 900},
        ]
    }
