from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db

router = APIRouter()


class ProductBase(BaseModel):
    name: str
    sku: str
    price: float
    cost: float


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    cost: Optional[float] = None
    stock: Optional[int] = None
    status: Optional[str] = None


class Product(ProductBase):
    id: int
    sku: str
    barcode: Optional[str]
    category_id: Optional[int]
    stock: int
    reorder_level: int
    status: str
    description: Optional[str]
    warehouse_id: Optional[int]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[dict])
async def list_products(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    db = Depends(get_db)
):
    """List all products with optional filtering"""
    try:
        query = "SELECT * FROM products WHERE 1=1"
        params = []
        
        if search:
            query += " AND (name ILIKE %s OR sku ILIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])
        
        if category_id:
            query += " AND category_id = %s"
            params.append(category_id)
        
        if status:
            query += " AND status = %s"
            params.append(status)
        
        offset = (page - 1) * page_size
        query += f" LIMIT {page_size} OFFSET {offset}"
        
        products = db.fetch_all(query, params if params else None)
        return products or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{product_id}", response_model=dict)
async def get_product(product_id: int, db = Depends(get_db)):
    """Get a specific product by ID"""
    try:
        product = db.fetch_one("SELECT * FROM products WHERE id = %s", (product_id,))
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict)
async def create_product(product: ProductCreate, db = Depends(get_db)):
    """Create a new product"""
    try:
        query = """
        INSERT INTO products (name, sku, price, cost, stock, status)
        VALUES (%s, %s, %s, %s, 0, 'Active')
        RETURNING id, name, sku, price, cost
        """
        result = db.fetch_one(query, (product.name, product.sku, product.price, product.cost))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{product_id}", response_model=dict)
async def update_product(product_id: int, product: ProductUpdate, db = Depends(get_db)):
    """Update a product"""
    try:
        # Check if product exists
        existing = db.fetch_one("SELECT id FROM products WHERE id = %s", (product_id,))
        if not existing:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Build update query dynamically
        updates = []
        params = []
        
        if product.name:
            updates.append("name = %s")
            params.append(product.name)
        if product.sku:
            updates.append("sku = %s")
            params.append(product.sku)
        if product.price is not None:
            updates.append("price = %s")
            params.append(product.price)
        if product.cost is not None:
            updates.append("cost = %s")
            params.append(product.cost)
        if product.stock is not None:
            updates.append("stock = %s")
            params.append(product.stock)
        if product.status:
            updates.append("status = %s")
            params.append(product.status)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        params.append(product_id)
        query = f"UPDATE products SET {', '.join(updates)} WHERE id = %s RETURNING *"
        result = db.fetch_one(query, params)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{product_id}")
async def delete_product(product_id: int, db = Depends(get_db)):
    """Delete a product"""
    try:
        # Check if product exists
        existing = db.fetch_one("SELECT id FROM products WHERE id = %s", (product_id,))
        if not existing:
            raise HTTPException(status_code=404, detail="Product not found")
        
        db.execute("DELETE FROM products WHERE id = %s", (product_id,))
        return {"message": "Product deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
