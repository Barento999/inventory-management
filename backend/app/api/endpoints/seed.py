from fastapi import APIRouter, HTTPException
from app.seeds.seed_data import CATEGORIES, WAREHOUSES, PRODUCTS, SUPPLIERS, CUSTOMERS

router = APIRouter()


@router.post("/load-seed-data")
async def load_seed_data():
    """Load seed data into the system"""
    return {
        "message": "Seed data loaded successfully",
        "data": {
            "categories": CATEGORIES,
            "warehouses": WAREHOUSES,
            "products": PRODUCTS,
            "suppliers": SUPPLIERS,
            "customers": CUSTOMERS,
        }
    }


@router.get("/seed-summary")
async def seed_summary():
    """Get a summary of available seed data"""
    return {
        "categories_count": len(CATEGORIES),
        "warehouses_count": len(WAREHOUSES),
        "products_count": len(PRODUCTS),
        "suppliers_count": len(SUPPLIERS),
        "customers_count": len(CUSTOMERS),
        "summary": {
            "categories": [cat["name"] for cat in CATEGORIES],
            "warehouses": [wh["name"] for wh in WAREHOUSES],
            "products": [f"{p['sku']}: {p['name']}" for p in PRODUCTS],
            "suppliers": [s["name"] for s in SUPPLIERS],
            "customers": [c["name"] for c in CUSTOMERS],
        }
    }
