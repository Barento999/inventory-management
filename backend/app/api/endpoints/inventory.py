from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Product, StockMovement

router = APIRouter()


class StockAdjustment(BaseModel):
    productId: int
    type: str  # 'in', 'out', 'adjustment'
    quantity: int
    reason: Optional[str] = None
    reference: Optional[str] = None


@router.get("/stock-levels")
async def get_stock_levels(
    search: Optional[str] = None,
    low_stock: bool = False,
    db: Session = Depends(get_db)
):
    """Get stock levels for all products"""
    query = db.query(Product)
    
    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) | 
            (Product.sku.ilike(f"%{search}%"))
        )
    
    if low_stock:
        query = query.filter(Product.stock <= Product.reorder_level)
    
    products = query.all()
    
    result = []
    for product in products:
        result.append({
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "stock": product.stock,
            "cost": product.cost,
            "reorderLevel": product.reorder_level,
            "isLowStock": product.stock <= product.reorder_level,
            "value": product.stock * product.cost,
        })
    
    return result


@router.get("/movements")
async def get_stock_movements(
    search: Optional[str] = None,
    type: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db)
):
    """Get stock movements"""
    query = db.query(StockMovement)
    
    if type:
        query = query.filter(StockMovement.type == type)
    
    total = query.count()
    offset = (page - 1) * page_size
    movements = query.order_by(StockMovement.created_at.desc()).offset(offset).limit(page_size).all()
    
    # Convert to dict manually
    movements_data = [
        {
            "id": m.id,
            "productId": m.product_id,
            "type": m.type,
            "quantity": m.quantity,
            "reason": m.reason,
            "reference": m.reference,
            "createdAt": m.created_at.isoformat() if m.created_at else None
        }
        for m in movements
    ]
    
    return {
        "items": movements_data,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": (total + page_size - 1) // page_size,
    }


@router.post("/adjust")
async def adjust_stock(
    adjustment: StockAdjustment,
    db: Session = Depends(get_db)
):
    """Adjust stock for a product"""
    product = db.query(Product).filter(Product.id == adjustment.productId).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if adjustment.type == 'out':
        if product.stock < adjustment.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        product.stock -= adjustment.quantity
    elif adjustment.type == 'in':
        product.stock += adjustment.quantity
    elif adjustment.type == 'adjustment':
        product.stock = adjustment.quantity
    
    # Create stock movement record
    movement = StockMovement(
        product_id=adjustment.productId,
        type=adjustment.type,
        quantity=adjustment.quantity,
        reason=adjustment.reason,
        reference=adjustment.reference
    )
    db.add(movement)
    
    db.commit()
    db.refresh(product)
    
    return {
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "stock": product.stock,
    }
