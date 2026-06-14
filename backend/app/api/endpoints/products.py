from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel

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
    pageSize: int = 10
):
    # TODO: Implement with Prisma
    return []


@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    # TODO: Implement with Prisma
    raise HTTPException(status_code=404, detail="Product not found")


@router.post("/", response_model=Product)
async def create_product(product: ProductCreate):
    # TODO: Implement with Prisma
    return product


@router.put("/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductUpdate):
    # TODO: Implement with Prisma
    raise HTTPException(status_code=404, detail="Product not found")


@router.delete("/{product_id}")
async def delete_product(product_id: str):
    # TODO: Implement with Prisma
    return {"message": "Product deleted"}
