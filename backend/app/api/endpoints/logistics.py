from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List, Optional

from app.core.database import get_db
from app.core.rbac import check_permission
from app.models import User, Shipment, ShipmentStatus, Sale
from app.core.audit import record_audit_log

router = APIRouter()


class CarrierRateSchema(BaseModel):
    carrier: str
    service_type: str  # Standard, Express, Overnight
    weight_kg: float
    estimated_cost: float
    estimated_days: int


class ShipmentTrackingUpdateSchema(BaseModel):
    status: str
    location: Optional[str] = None
    timestamp: Optional[datetime] = None
    notes: Optional[str] = None


class ShippingAnalyticsSchema(BaseModel):
    total_shipments: int
    on_time_delivery_rate: float
    average_shipping_cost: float
    total_shipping_volume_kg: float
    carrier_breakdown: dict


@router.post("/rates/quote")
async def quote_shipping_rates(
    weight_kg: float = Query(...),
    origin_zip: str = Query(...),
    destination_zip: str = Query(...),
    current_user: User = Depends(check_permission("sales_view")),
):
    """
    Get shipping rate quotes from different carriers
    
    Returns quotes from multiple carriers
    """
    quotes = []
    
    # Mock carrier rates (in production, integrate with actual carrier APIs)
    carriers = [
        {
            "carrier": "FedEx",
            "rates": [
                {"service": "Ground", "base": 5.00, "per_kg": 0.50, "days": 3},
                {"service": "Express", "base": 15.00, "per_kg": 1.00, "days": 1},
                {"service": "Overnight", "base": 25.00, "per_kg": 2.00, "days": 0},
            ]
        },
        {
            "carrier": "UPS",
            "rates": [
                {"service": "Ground", "base": 4.50, "per_kg": 0.45, "days": 3},
                {"service": "Express", "base": 14.00, "per_kg": 0.95, "days": 1},
                {"service": "Overnight", "base": 24.00, "per_kg": 1.95, "days": 0},
            ]
        },
        {
            "carrier": "DHL",
            "rates": [
                {"service": "Standard", "base": 6.00, "per_kg": 0.55, "days": 4},
                {"service": "Express", "base": 16.00, "per_kg": 1.05, "days": 2},
            ]
        },
    ]
    
    for carrier_info in carriers:
        for rate in carrier_info["rates"]:
            cost = rate["base"] + (weight_kg * rate["per_kg"])
            quotes.append({
                "carrier": carrier_info["carrier"],
                "service_type": rate["service"],
                "weight_kg": weight_kg,
                "estimated_cost": round(cost, 2),
                "estimated_days": rate["days"],
            })
    
    return {"quotes": quotes}


@router.get("/analytics")
async def get_logistics_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(check_permission("sales_view")),
    db: Session = Depends(get_db),
):
    """Get comprehensive logistics analytics"""
    
    query = db.query(Shipment)
    
    # Date filtering
    if start_date:
        start = datetime.fromisoformat(start_date)
        query = query.filter(Shipment.created_at >= start)
    
    if end_date:
        end = datetime.fromisoformat(end_date)
        query = query.filter(Shipment.created_at <= end)
    
    shipments = query.all()
    
    # Calculate metrics
    total_shipments = len(shipments)
    delivered = len([s for s in shipments if s.status == ShipmentStatus.DELIVERED])
    on_time = sum(1 for s in shipments if s.delivery_date and s.expected_delivery and s.delivery_date <= s.expected_delivery)
    
    on_time_rate = (on_time / delivered * 100) if delivered > 0 else 0
    
    total_cost = sum(s.shipping_cost + s.insurance_cost for s in shipments)
    avg_cost = total_cost / total_shipments if total_shipments > 0 else 0
    
    total_weight = sum(s.weight_kg for s in shipments)
    
    # Carrier breakdown
    carrier_breakdown = {}
    for shipment in shipments:
        if shipment.carrier not in carrier_breakdown:
            carrier_breakdown[shipment.carrier] = {"count": 0, "cost": 0}
        carrier_breakdown[shipment.carrier]["count"] += 1
        carrier_breakdown[shipment.carrier]["cost"] += shipment.shipping_cost + shipment.insurance_cost
    
    return {
        "total_shipments": total_shipments,
        "on_time_delivery_rate": round(on_time_rate, 2),
        "average_shipping_cost": round(avg_cost, 2),
        "total_shipping_volume_kg": round(total_weight, 2),
        "carrier_breakdown": carrier_breakdown,
        "period": {
            "start": start_date,
            "end": end_date,
        }
    }


@router.post("/{shipment_id}/update-tracking")
async def update_shipment_tracking(
    shipment_id: int,
    update: ShipmentTrackingUpdateSchema,
    current_user: User = Depends(check_permission("sales_update")),
    db: Session = Depends(get_db),
):
    """Update shipment tracking status"""
    
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    shipment.status = update.status
    
    if update.status == ShipmentStatus.DELIVERED:
        shipment.delivery_date = update.timestamp or datetime.utcnow()
    
    if update.notes:
        shipment.notes = (shipment.notes or "") + f"\n[{datetime.utcnow().isoformat()}] {update.notes}"
    
    db.commit()
    db.refresh(shipment)
    
    # Record audit log
    record_audit_log(
        db, current_user.id, "update_tracking",
        f"Updated shipment {shipment_id} status to {update.status}",
        "shipment", shipment_id
    )
    
    return shipment


@router.get("/routes/optimize")
async def optimize_delivery_route(
    shipment_ids: List[int] = Query(...),
    current_user: User = Depends(check_permission("sales_view")),
    db: Session = Depends(get_db),
):
    """Optimize delivery route for multiple shipments"""
    
    shipments = db.query(Shipment).filter(Shipment.id.in_(shipment_ids)).all()
    
    if not shipments:
        raise HTTPException(status_code=404, detail="No shipments found")
    
    # Simple optimization: sort by distance (mock)
    optimized = sorted(shipments, key=lambda s: s.ship_to_address)
    
    return {
        "optimized_route": [
            {
                "shipment_id": s.id,
                "tracking_number": s.tracking_number,
                "destination": s.ship_to_address,
                "weight_kg": s.weight_kg,
            }
            for s in optimized
        ],
        "total_shipments": len(optimized),
        "estimated_route_time_hours": len(optimized) * 0.5,  # Mock calculation
    }


@router.get("/returns/pending")
async def get_pending_returns(
    current_user: User = Depends(check_permission("sales_view")),
    db: Session = Depends(get_db),
    limit: int = Query(50, le=100),
):
    """Get pending return shipments"""
    
    returns = db.query(Shipment).filter(
        and_(
            Shipment.is_return == True,
            Shipment.status.in_([ShipmentStatus.PENDING, ShipmentStatus.PROCESSING])
        )
    ).order_by(desc(Shipment.created_at)).limit(limit).all()
    
    return {
        "pending_returns": len(returns),
        "returns": [
            {
                "shipment_id": r.id,
                "tracking_number": r.tracking_number,
                "carrier": r.carrier,
                "from_address": r.ship_from_address,
                "to_address": r.ship_to_address,
                "status": r.status,
                "created_at": r.created_at,
            }
            for r in returns
        ]
    }


@router.post("/batch-create")
async def create_batch_shipments(
    sale_ids: List[int] = Query(...),
    carrier: str = Query(...),
    current_user: User = Depends(check_permission("sales_update")),
    db: Session = Depends(get_db),
):
    """Create shipments in batch for multiple sales"""
    
    created = 0
    failed = 0
    
    for sale_id in sale_ids:
        try:
            sale = db.query(Sale).filter(Sale.id == sale_id).first()
            
            if not sale or not sale.customer:
                failed += 1
                continue
            
            shipment = Shipment(
                sale_id=sale_id,
                carrier=carrier,
                ship_from_address="Warehouse Address",
                ship_to_address=sale.customer.address or "Address not provided",
                weight_kg=0.5,  # Default weight
                status=ShipmentStatus.PENDING,
            )
            
            db.add(shipment)
            created += 1
        except Exception as e:
            failed += 1
    
    db.commit()
    
    # Record audit log
    record_audit_log(
        db, current_user.id, "batch_create_shipments",
        f"Created {created} batch shipments",
        "shipment", 0
    )
    
    return {
        "created": created,
        "failed": failed,
        "total": len(sale_ids),
    }


@router.get("/cost-analysis")
async def get_shipping_cost_analysis(
    current_user: User = Depends(check_permission("sales_view")),
    db: Session = Depends(get_db),
):
    """Analyze shipping costs"""
    
    shipments = db.query(Shipment).all()
    
    by_carrier = {}
    by_status = {}
    
    for shipment in shipments:
        # By carrier
        if shipment.carrier not in by_carrier:
            by_carrier[shipment.carrier] = {"count": 0, "total_cost": 0, "avg_cost": 0}
        
        by_carrier[shipment.carrier]["count"] += 1
        by_carrier[shipment.carrier]["total_cost"] += shipment.shipping_cost + shipment.insurance_cost
        
        # By status
        if shipment.status not in by_status:
            by_status[shipment.status] = {"count": 0, "total_cost": 0}
        
        by_status[shipment.status]["count"] += 1
        by_status[shipment.status]["total_cost"] += shipment.shipping_cost + shipment.insurance_cost
    
    # Calculate averages
    for carrier in by_carrier:
        by_carrier[carrier]["avg_cost"] = (
            by_carrier[carrier]["total_cost"] / by_carrier[carrier]["count"]
            if by_carrier[carrier]["count"] > 0 else 0
        )
    
    total_spent = sum(s.shipping_cost + s.insurance_cost for s in shipments)
    
    return {
        "total_spent": round(total_spent, 2),
        "by_carrier": by_carrier,
        "by_status": by_status,
        "recommendations": [
            "Consider consolidating shipments with the same carrier",
            "Negotiate volume discounts with top carriers",
            "Review return shipment costs",
        ]
    }
