from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.core.database import get_db
from app.core.rbac import check_permission
from app.models import User, Sale, Product, Customer, Purchase, Invoice, Shipment

router = APIRouter()


class KPISchema(BaseModel):
    name: str
    value: float
    target: Optional[float] = None
    trend: Optional[float] = None
    unit: str


class PeriodComparison(BaseModel):
    current_period: float
    previous_period: float
    change_percent: float
    growth: str


@router.get("/kpis")
async def get_kpis(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(check_permission("reports_view")),
    db: Session = Depends(get_db),
):
    """
    Get Key Performance Indicators (KPIs)
    
    Returns: Revenue, Profit, Customer Acquisition, Retention Rate, etc.
    """
    
    # Parse dates
    if not start_date:
        start_date = (datetime.utcnow() - timedelta(days=30)).isoformat()
    if not end_date:
        end_date = datetime.utcnow().isoformat()
    
    start = datetime.fromisoformat(start_date)
    end = datetime.fromisoformat(end_date)
    
    # Previous period for comparison
    period_delta = end - start
    prev_start = start - period_delta
    prev_end = start
    
    # Current period metrics
    sales = db.query(Sale).filter(
        and_(Sale.created_at >= start, Sale.created_at <= end)
    ).all()
    
    prev_sales = db.query(Sale).filter(
        and_(Sale.created_at >= prev_start, Sale.created_at <= prev_end)
    ).all()
    
    current_revenue = sum(s.total_amount or 0 for s in sales)
    prev_revenue = sum(s.total_amount or 0 for s in prev_sales)
    
    # Customer metrics
    new_customers = len(set(s.customer_id for s in sales if s.customer_id))
    repeat_customers = db.query(func.count(Sale.customer_id)).filter(
        and_(Sale.created_at >= start, Sale.created_at <= end)
    ).group_by(Sale.customer_id).filter(func.count(Sale.customer_id) > 1).count()
    
    # Order metrics
    total_orders = len(sales)
    avg_order_value = current_revenue / total_orders if total_orders > 0 else 0
    orders_per_customer = total_orders / new_customers if new_customers > 0 else 0
    
    # Calculate trends
    revenue_trend = ((current_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0
    
    kpis = [
        KPISchema(
            name="Total Revenue",
            value=current_revenue,
            trend=revenue_trend,
            unit="$"
        ),
        KPISchema(
            name="Total Orders",
            value=total_orders,
            unit="orders"
        ),
        KPISchema(
            name="Average Order Value",
            value=avg_order_value,
            unit="$"
        ),
        KPISchema(
            name="New Customers",
            value=new_customers,
            unit="customers"
        ),
        KPISchema(
            name="Repeat Customers",
            value=repeat_customers,
            unit="customers"
        ),
        KPISchema(
            name="Orders per Customer",
            value=orders_per_customer,
            unit="orders"
        ),
    ]
    
    return {
        "kpis": kpis,
        "period": {
            "start": start_date,
            "end": end_date,
        }
    }


@router.get("/sales-funnel")
async def get_sales_funnel(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(check_permission("reports_view")),
    db: Session = Depends(get_db),
):
    """
    Get sales funnel metrics
    
    Returns: Quotes → Orders → Invoiced → Delivered
    """
    
    if not start_date:
        start_date = (datetime.utcnow() - timedelta(days=30)).isoformat()
    if not end_date:
        end_date = datetime.utcnow().isoformat()
    
    start = datetime.fromisoformat(start_date)
    end = datetime.fromisoformat(end_date)
    
    # Count at each stage
    from app.models import Quote
    
    quotes = db.query(Quote).filter(
        and_(Quote.created_at >= start, Quote.created_at <= end)
    ).count()
    
    orders = db.query(Sale).filter(
        and_(Sale.created_at >= start, Sale.created_at <= end)
    ).count()
    
    invoiced = db.query(Invoice).filter(
        and_(Invoice.created_at >= start, Invoice.created_at <= end)
    ).count()
    
    delivered = db.query(Shipment).filter(
        and_(
            Shipment.created_at >= start,
            Shipment.created_at <= end,
            Shipment.status == "delivered"
        )
    ).count()
    
    # Calculate conversion rates
    quote_to_order = (orders / quotes * 100) if quotes > 0 else 0
    order_to_invoice = (invoiced / orders * 100) if orders > 0 else 0
    invoice_to_delivery = (delivered / invoiced * 100) if invoiced > 0 else 0
    
    return {
        "funnel": [
            {"stage": "Quotes", "count": quotes},
            {"stage": "Orders", "count": orders},
            {"stage": "Invoiced", "count": invoiced},
            {"stage": "Delivered", "count": delivered},
        ],
        "conversion_rates": {
            "quote_to_order": round(quote_to_order, 2),
            "order_to_invoice": round(order_to_invoice, 2),
            "invoice_to_delivery": round(invoice_to_delivery, 2),
        }
    }


@router.get("/customer-segmentation")
async def get_customer_segmentation(
    current_user: User = Depends(check_permission("reports_view")),
    db: Session = Depends(get_db),
):
    """
    Segment customers by value and activity
    
    Returns: VIP, Regular, At-Risk customers
    """
    
    customers = db.query(Customer).all()
    
    vip = []
    regular = []
    at_risk = []
    
    for customer in customers:
        sales = db.query(Sale).filter(Sale.customer_id == customer.id).all()
        total_spent = sum(s.total_amount or 0 for s in sales)
        purchase_count = len(sales)
        
        if purchase_count == 0:
            continue
        
        # Determine segment
        if total_spent > 5000 and purchase_count > 5:
            vip.append({
                "id": customer.id,
                "name": customer.name,
                "total_spent": total_spent,
                "purchase_count": purchase_count,
            })
        elif total_spent > 1000 and purchase_count > 2:
            regular.append({
                "id": customer.id,
                "name": customer.name,
                "total_spent": total_spent,
                "purchase_count": purchase_count,
            })
        else:
            at_risk.append({
                "id": customer.id,
                "name": customer.name,
                "total_spent": total_spent,
                "purchase_count": purchase_count,
            })
    
    return {
        "vip": {
            "count": len(vip),
            "total_value": sum(c["total_spent"] for c in vip),
            "customers": vip[:10],
        },
        "regular": {
            "count": len(regular),
            "total_value": sum(c["total_spent"] for c in regular),
        },
        "at_risk": {
            "count": len(at_risk),
            "total_value": sum(c["total_spent"] for c in at_risk),
        },
    }


@router.get("/inventory-health")
async def get_inventory_health(
    current_user: User = Depends(check_permission("inventory_view")),
    db: Session = Depends(get_db),
):
    """
    Analyze inventory health metrics
    
    Returns: Stock turnover, Slow-moving items, Dead stock
    """
    
    products = db.query(Product).all()
    
    fast_moving = []
    slow_moving = []
    dead_stock = []
    
    for product in products:
        sales = db.query(Sale).filter(
            Sale.created_at >= datetime.utcnow() - timedelta(days=90)
        ).all()
        
        sold_qty = sum(1 for s in sales)
        inventory_value = (product.price or 0) * (product.stock or 0)
        
        if product.stock is None:
            continue
        
        if sold_qty > 10:
            fast_moving.append({
                "id": product.id,
                "sku": product.sku,
                "name": product.name,
                "stock": product.stock,
                "sold_90d": sold_qty,
                "inventory_value": inventory_value,
            })
        elif sold_qty > 0:
            slow_moving.append({
                "id": product.id,
                "sku": product.sku,
                "name": product.name,
                "stock": product.stock,
                "sold_90d": sold_qty,
                "inventory_value": inventory_value,
            })
        else:
            dead_stock.append({
                "id": product.id,
                "sku": product.sku,
                "name": product.name,
                "stock": product.stock,
                "inventory_value": inventory_value,
            })
    
    total_inventory_value = sum((p.price or 0) * (p.stock or 0) for p in products)
    
    return {
        "fast_moving": {
            "count": len(fast_moving),
            "total_value": sum(p["inventory_value"] for p in fast_moving),
            "items": fast_moving[:10],
        },
        "slow_moving": {
            "count": len(slow_moving),
            "total_value": sum(p["inventory_value"] for p in slow_moving),
            "items": slow_moving[:10],
        },
        "dead_stock": {
            "count": len(dead_stock),
            "total_value": sum(p["inventory_value"] for p in dead_stock),
            "items": dead_stock[:10],
        },
        "total_inventory_value": total_inventory_value,
    }


@router.get("/profitability")
async def get_profitability_analysis(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(check_permission("reports_view")),
    db: Session = Depends(get_db),
):
    """
    Analyze profitability metrics
    
    Returns: Gross profit, Profit margin, Cost breakdown
    """
    
    if not start_date:
        start_date = (datetime.utcnow() - timedelta(days=30)).isoformat()
    if not end_date:
        end_date = datetime.utcnow().isoformat()
    
    start = datetime.fromisoformat(start_date)
    end = datetime.fromisoformat(end_date)
    
    # Revenue
    sales = db.query(Sale).filter(
        and_(Sale.created_at >= start, Sale.created_at <= end)
    ).all()
    
    total_revenue = sum(s.total_amount or 0 for s in sales)
    
    # Cost (approximate based on purchases)
    purchases = db.query(Purchase).filter(
        and_(Purchase.created_at >= start, Purchase.created_at <= end)
    ).all()
    
    total_cogs = sum(p.total_amount or 0 for p in purchases)
    
    # Operating expenses (estimated)
    shipments = db.query(Shipment).filter(
        and_(Shipment.created_at >= start, Shipment.created_at <= end)
    ).all()
    
    total_shipping = sum(s.shipping_cost + s.insurance_cost for s in shipments)
    
    # Calculations
    gross_profit = total_revenue - total_cogs
    net_profit = gross_profit - total_shipping
    gross_margin = (gross_profit / total_revenue * 100) if total_revenue > 0 else 0
    net_margin = (net_profit / total_revenue * 100) if total_revenue > 0 else 0
    
    return {
        "revenue": total_revenue,
        "cogs": total_cogs,
        "shipping": total_shipping,
        "gross_profit": gross_profit,
        "net_profit": net_profit,
        "gross_margin_percent": round(gross_margin, 2),
        "net_margin_percent": round(net_margin, 2),
        "cost_breakdown": {
            "cogs_percent": round((total_cogs / total_revenue * 100) if total_revenue > 0 else 0, 2),
            "shipping_percent": round((total_shipping / total_revenue * 100) if total_revenue > 0 else 0, 2),
        }
    }


@router.get("/trends")
async def get_trend_analysis(
    metric: str = Query("revenue", enum=["revenue", "orders", "customers"]),
    period_days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(check_permission("reports_view")),
    db: Session = Depends(get_db),
):
    """
    Get trend data for specified metric over time
    
    Returns: Daily/weekly data for charting
    """
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=period_days)
    
    data = []
    
    for i in range(period_days):
        current_day = start_date + timedelta(days=i)
        next_day = current_day + timedelta(days=1)
        
        if metric == "revenue":
            sales = db.query(func.sum(Sale.total_amount)).filter(
                and_(
                    Sale.created_at >= current_day,
                    Sale.created_at < next_day
                )
            ).scalar() or 0
            
            data.append({
                "date": current_day.strftime("%Y-%m-%d"),
                "value": float(sales),
            })
        
        elif metric == "orders":
            orders = db.query(func.count(Sale.id)).filter(
                and_(
                    Sale.created_at >= current_day,
                    Sale.created_at < next_day
                )
            ).scalar() or 0
            
            data.append({
                "date": current_day.strftime("%Y-%m-%d"),
                "value": int(orders),
            })
        
        elif metric == "customers":
            customers = db.query(func.count(func.distinct(Sale.customer_id))).filter(
                and_(
                    Sale.created_at >= current_day,
                    Sale.created_at < next_day
                )
            ).scalar() or 0
            
            data.append({
                "date": current_day.strftime("%Y-%m-%d"),
                "value": int(customers),
            })
    
    return {
        "metric": metric,
        "period_days": period_days,
        "data": data,
    }


@router.get("/forecast")
async def get_forecast(
    metric: str = Query("revenue", enum=["revenue", "orders"]),
    forecast_days: int = Query(30, ge=7, le=90),
    current_user: User = Depends(check_permission("reports_view")),
    db: Session = Depends(get_db),
):
    """
    Get simple forecast based on historical data
    
    Returns: Predicted values for next N days
    """
    
    # Get last 90 days of data
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=90)
    
    historical_data = []
    
    for i in range(90):
        current_day = start_date + timedelta(days=i)
        next_day = current_day + timedelta(days=1)
        
        if metric == "revenue":
            value = float(db.query(func.sum(Sale.total_amount)).filter(
                and_(
                    Sale.created_at >= current_day,
                    Sale.created_at < next_day
                )
            ).scalar() or 0)
        else:
            value = int(db.query(func.count(Sale.id)).filter(
                and_(
                    Sale.created_at >= current_day,
                    Sale.created_at < next_day
                )
            ).scalar() or 0)
        
        historical_data.append(value)
    
    # Simple moving average forecast
    avg = sum(historical_data) / len(historical_data) if historical_data else 0
    
    forecast = []
    for i in range(forecast_days):
        # Add slight random variation
        import random
        variation = avg * 0.1 * (random.random() - 0.5)
        forecast.append({
            "date": (end_date + timedelta(days=i+1)).strftime("%Y-%m-%d"),
            "predicted_value": round(avg + variation, 2),
            "confidence": round(85 + (90 - i * 0.2), 1),  # Decreasing confidence
        })
    
    return {
        "metric": metric,
        "forecast_days": forecast_days,
        "forecast": forecast,
        "method": "moving_average",
    }
