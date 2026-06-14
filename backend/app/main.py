from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import db
from app.api import api_router

app = FastAPI(title="Inventory Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    try:
        db.connect()
        db.create_tables()
        print("✅ Database initialized")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    db.disconnect()

app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Inventory Management API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
