from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.core.security_middleware import add_security_middleware
from app.core.logging_config import setup_logging
from app.api import api_router

# Setup logging
setup_logging()

app = FastAPI(title="Inventory Management API", version="1.0.0")

# Add security middleware
limiter = add_security_middleware(app)

# Add rate limiter to state
app.state.limiter = limiter

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
    """Initialize database on startup"""
    try:
        init_db()
        print("✅ Database initialized with SQLAlchemy")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")

app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Inventory Management API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
