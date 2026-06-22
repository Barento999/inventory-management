from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.sale import Sale
from app.models.purchase import Purchase
from app.models.category import Category
from app.models.stock_movement import StockMovement

router = APIRouter()


class ReportFilterSchema(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    entity_type: Optional[str] = None  # "product", "category", "supplier"
    entity_id: Optional[int] = None


@router.post("/custom")
async def create_custom_report(
    filters: ReportFilterSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a custom report based on filters"""
    start_date = filters.start_date or datetime.utcnow() - timedelta(days=30)
    end_date = filters.end_date or datetime.utcnow()
    
    report = {
        "generated_at": datetime.utcnow(),
        "filters": {
            "start_date": start_date,
            "end_date": end_date,
            "entity_type": filters.entity_type,
            "entity_id": filters.entity_id,
        },
    }
    
    # Sales data
    sales_query = db.query(Sale).filter(
        Sale.created_at >= start_date,
        Sale.created_at <= end_date,
    )
    
    if filters.entity_id:
        sales_query = sales_query.filter(Sale.customer_id == filters.entity_id)
    
    sales = sales_query.all()
    report["sales"] = {
        "total_orders": len(sales),
        "total_amount": sum(s.total_amount or 0 for s in sales),
        "average_order_value": (sum(s.total_amount or 0 for s in sales) / len(sales)) if sales else 0,
    }
    
    # Purchase data
    purchases_query = db.query(Purchase).filter(
        Purchase.created_at >= start_date,
        Purchase.created_at <= end_date,
    )
    
    if filters.entity_id:
        purchases_query = purchases_query.filter(Purchase.supplier_id == filters.entity_id)
    
    purchases = purchases_query.all()
    report["purchases"] = {
        "total_orders": len(purchases),
        "total_amount": sum(p.total_amount or 0 for p in purchases),
        "average_order_value": (sum(p.total_amount or 0 for p in purchases) / len(purchases)) if purchases else 0,
    }
    
    # Inventory data
    products = db.query(Product).all()
    report["inventory"] = {
        "total_products": len(products),
        "low_stock_items": len([p for p in products if (p.stock or 0) < (p.reorder_level or 0)]),
        "total_value": sum((p.stock or 0) * (p.cost or 0) for p in products),
    }
    
    # Profit analysis
    total_sales = report["sales"]["total_amount"]
    total_purchases = report["purchases"]["total_amount"]
    report["profit"] = {
        "gross_revenue": total_sales,
        "total_cost": total_purchases,
        "gross_profit": total_sales - total_purchases,
        "margin_percentage": ((total_sales - total_purchases) / total_sales * 100) if total_sales > 0 else 0,
    }
    
    return report


@router.get("/sales-trend")
async def get_sales_trend(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = Query(30, ge=1, le=365),
):
    """Get sales trend data"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    sales = db.query(Sale).filter(Sale.created_at >= start_date).all()
    
    # Group by date
    trend_data = {}
    for sale in sales:
        date_key = sale.created_at.strftime("%Y-%m-%d")
        if date_key not in trend_data:
            trend_data[date_key] = {"sales": 0, "revenue": 0}
        trend_data[date_key]["sales"] += 1
        trend_data[date_key]["revenue"] += sale.total_amount or 0
    
    return [
        {
            "date": date,
            "sales": data["sales"],
            "revenue": data["revenue"],
        }
        for date, data in sorted(trend_data.items())
    ]


@router.get("/product-performance")
async def get_product_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(10, le=50),
):
    """Get top performing products"""
    products = db.query(Product).order_by(
        desc(Product.stock)
    ).limit(limit).all()
    
    return [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "stock": p.stock,
            "price": p.price,
            "cost": p.cost,
            "revenue_per_unit": (p.price or 0) - (p.cost or 0),
        }
        for p in products
    ]


@router.get("/category-analysis")
async def get_category_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get category-wise analysis"""
    categories = db.query(Category).all()
    
    analysis = []
    for category in categories:
        products = db.query(Product).filter(Product.category_id == category.id).all()
        total_value = sum((p.stock or 0) * (p.price or 0) for p in products)
        
        analysis.append({
            "id": category.id,
            "name": category.name,
            "product_count": len(products),
            "total_value": total_value,
            "average_price": (sum(p.price or 0 for p in products) / len(products)) if products else 0,
        })
    
    return analysis


@router.get("/inventory-turnover")
async def get_inventory_turnover(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = Query(30, ge=1, le=365),
):
    """Calculate inventory turnover"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    products = db.query(Product).all()
    
    turnover_data = []
    for product in products:
        # Count sales in period
        sales_query = (
            db.query(func.sum(StockMovement.quantity))
            .filter(
                StockMovement.product_id == product.id,
                StockMovement.created_at >= start_date,
                StockMovement.movement_type == "sale",
            )
            .scalar()
        ) or 0
        
        avg_inventory = (product.stock or 0)
        turnover_ratio = sales_query / avg_inventory if avg_inventory > 0 else 0
        
        if sales_query > 0:  # Only include products with movements
            turnover_data.append({
                "product_id": product.id,
                "product_name": product.name,
                "units_sold": int(sales_query),
                "avg_inventory": avg_inventory,
                "turnover_ratio": round(turnover_ratio, 2),
            })
    
    return sorted(turnover_data, key=lambda x: x["turnover_ratio"], reverse=True)


@router.get("/cash-flow")
async def get_cash_flow(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = Query(30, ge=1, le=365),
):
    """Get cash flow analysis"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    sales = db.query(Sale).filter(Sale.created_at >= start_date).all()
    purchases = db.query(Purchase).filter(Purchase.created_at >= start_date).all()
    
    inflows = sum(s.total_amount or 0 for s in sales)
    outflows = sum(p.total_amount or 0 for p in purchases)
    
    return {
        "period_days": days,
        "inflows": inflows,
        "outflows": outflows,
        "net_cash_flow": inflows - outflows,
        "daily_average_inflow": inflows / days,
        "daily_average_outflow": outflows / days,
    }


@router.get("/top-customers")
async def get_top_customers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(10, le=50),
    days: int = Query(30, ge=1, le=365),
):
    """Get top customers by revenue"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    sales = db.query(Sale).filter(Sale.created_at >= start_date).all()
    
    # Group by customer
    customer_data = {}
    for sale in sales:
        cust_id = sale.customer_id
        if cust_id not in customer_data:
            customer_data[cust_id] = {
                "orders": 0,
                "total_amount": 0,
                "customer_name": sale.customer.name if sale.customer else "Unknown",
            }
        customer_data[cust_id]["orders"] += 1
        customer_data[cust_id]["total_amount"] += sale.total_amount or 0
    
    # Sort by total amount
    sorted_customers = sorted(
        customer_data.items(),
        key=lambda x: x[1]["total_amount"],
        reverse=True
    )[:limit]
    
    return [
        {
            "customer_id": cust_id,
            "customer_name": data["customer_name"],
            "orders": data["orders"],
            "total_amount": data["total_amount"],
            "average_order_value": data["total_amount"] / data["orders"],
        }
        for cust_id, data in sorted_customers
    ]


@router.get("/top-suppliers")
async def get_top_suppliers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(10, le=50),
    days: int = Query(30, ge=1, le=365),
):
    """Get top suppliers by purchases"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    purchases = db.query(Purchase).filter(Purchase.created_at >= start_date).all()
    
    # Group by supplier
    supplier_data = {}
    for purchase in purchases:
        supp_id = purchase.supplier_id
        if supp_id not in supplier_data:
            supplier_data[supp_id] = {
                "orders": 0,
                "total_amount": 0,
                "supplier_name": purchase.supplier.name if purchase.supplier else "Unknown",
            }
        supplier_data[supp_id]["orders"] += 1
        supplier_data[supp_id]["total_amount"] += purchase.total_amount or 0
    
    # Sort by total amount
    sorted_suppliers = sorted(
        supplier_data.items(),
        key=lambda x: x[1]["total_amount"],
        reverse=True
    )[:limit]
    
    return [
        {
            "supplier_id": supp_id,
            "supplier_name": data["supplier_name"],
            "orders": data["orders"],
            "total_amount": data["total_amount"],
            "average_order_value": data["total_amount"] / data["orders"],
        }
        for supp_id, data in sorted_suppliers
    ]
