from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
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


@router.get("/", response_model=List[ProductSchema])
async def list_products(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db)
):
    """List all products"""
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
    
    offset = (page - 1) * page_size
    products = query.offset(offset).limit(page_size).all()
    return products


@router.get("/{product_id}", response_model=ProductSchema)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductSchema)
async def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product"""
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.put("/{product_id}", response_model=ProductSchema)
async def update_product(
    product_id: int, 
    product: ProductUpdate, 
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
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product"""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}
