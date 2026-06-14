from fastapi import APIRouter
from app.api.endpoints import auth, seed, products, customers, suppliers, sales, purchases, quotes, categories, warehouses, users, dashboard

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(seed.router, prefix="/seed", tags=["seed"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(warehouses.router, prefix="/warehouses", tags=["warehouses"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["suppliers"])
api_router.include_router(sales.router, prefix="/sales", tags=["sales"])
api_router.include_router(purchases.router, prefix="/purchases", tags=["purchases"])
api_router.include_router(quotes.router, prefix="/quotes", tags=["quotes"])
