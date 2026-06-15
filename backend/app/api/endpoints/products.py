from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_permission
from app.models import Product

router = APIRouter()


class ProductBase(BaseModel):
    name: str
    sku: str
    price: float
    cost: float


class ProductCreate(ProductBase):
    barcode: Optional[str] = None
    category_id: Optional[int] = None
    stock: int = 0
    reorder_level: int = 0
    status: str = "Active"
    description: Optional[str] = None
    warehouse_id: Optional[int] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    cost: Optional[float] = None
    stock: Optional[int] = None
    status: Optional[str] = None


class ProductSchema(ProductBase):
    id: int
    barcode: Optional[str]
    category_id: Optional[int]
    stock: int
    reorder_level: int
    status: str
    description: Optional[str]
    warehouse_id: Optional[int]

    class Config:
        from_attributes = True


@router.get("")
@require_permission("products_view")
async def list_products_no_slash(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """List all products (no trailing slash)"""
    return await list_products(search, category_id, status, page, page_size, authorization, db)


@router.get("/")
@require_permission("products_view")
async def list_products(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """List all products with pagination wrapper"""
    query = db.query(Product)
    
    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) | 
            (Product.sku.ilike(f"%{search}%"))
        )
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if status:
        query = query.filter(Product.status == status)
    
    total = query.count()
    offset = (page - 1) * page_size
    products = query.offset(offset).limit(page_size).all()
    
    # Convert to dict manually
    products_data = [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "price": p.price,
            "cost": p.cost,
            "stock": p.stock,
            "reorder_level": p.reorder_level,
            "status": p.status,
            "description": p.description,
            "warehouse_id": p.warehouse_id,
            "category_id": p.category_id,
            "barcode": p.barcode
        }
        for p in products
    ]
    
    return {
        "data": products_data,
        "pagination": {
            "page": page,
            "pageSize": page_size,
            "total": total,
            "totalPages": (total + page_size - 1) // page_size
        }
    }


@router.get("/{product_id}", response_model=ProductSchema)
@require_permission("products_view")
async def get_product(
    product_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get a specific product"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductSchema)
@require_permission("products_create")
async def create_product(
    product: ProductCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Create a new product"""
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.put("/{product_id}", response_model=ProductSchema)
@require_permission("products_update")
async def update_product(
    product_id: int, 
    product: ProductUpdate, 
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Update a product"""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product


@router.delete("/{product_id}")
@require_permission("products_delete")
async def delete_product(
    product_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Delete a product"""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}
