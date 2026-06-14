from fastapi import APIRouter
from app.api.endpoints import products, customers, suppliers, sales, purchases, quotes

api_router = APIRouter()

api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["suppliers"])
api_router.include_router(sales.router, prefix="/sales", tags=["sales"])
api_router.include_router(purchases.router, prefix="/purchases", tags=["purchases"])
api_router.include_router(quotes.router, prefix="/quotes", tags=["quotes"])
