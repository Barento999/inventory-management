from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from prisma import Prisma

router = APIRouter()


class ProductBase(BaseModel):
    name: str
    sku: str
    categoryId: str
    price: float
    cost: float
    quantity: int
    reorderLevel: int
    warehouseId: str
    status: str


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    categoryId: Optional[str] = None
    price: Optional[float] = None
    cost: Optional[float] = None
    quantity: Optional[int] = None
    reorderLevel: Optional[int] = None
    warehouseId: Optional[str] = None
    status: Optional[str] = None


class Product(ProductBase):
    id: str

    class Config:
        from_attributes = True


@router.get("/", response_model=List[Product])
async def list_products(
    search: Optional[str] = None,
    categoryId: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    pageSize: int = 10,
    db: Prisma = Depends(get_db)
):
    where = {}
    if categoryId:
        where['categoryId'] = categoryId
    if status:
        where['status'] = status
    if search:
        where['OR'] = [
            {'name': {'contains': search}},
            {'sku': {'contains': search}},
        ]
    
    skip = (page - 1) * pageSize
    products = await db.product.find_many(
        where=where,
        skip=skip,
        take=pageSize,
        order={'createdAt': 'desc'}
    )
    return products


@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str, db: Prisma = Depends(get_db)):
    product = await db.product.find_unique(where={'id': product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=Product)
async def create_product(product: ProductCreate, db: Prisma = Depends(get_db)):
    new_product = await db.product.create(
        data={
            'name': product.name,
            'sku': product.sku,
            'categoryId': product.categoryId,
            'price': product.price,
            'cost': product.cost,
            'quantity': product.quantity,
            'reorderLevel': product.reorderLevel,
            'warehouseId': product.warehouseId,
            'status': product.status,
        }
    )
    return new_product


@router.put("/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductUpdate, db: Prisma = Depends(get_db)):
    existing = await db.product.find_unique(where={'id': product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in product.model_dump().items() if v is not None}
    updated = await db.product.update(
        where={'id': product_id},
        data=update_data
    )
    return updated


@router.delete("/{product_id}")
async def delete_product(product_id: str, db: Prisma = Depends(get_db)):
    await db.product.delete(where={'id': product_id})
    return {"message": "Product deleted"}
