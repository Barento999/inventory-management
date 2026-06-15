from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_permission
from app.models import Warehouse

router = APIRouter()


class WarehouseBase(BaseModel):
    name: str
    location: Optional[str] = None


class WarehouseCreate(WarehouseBase):
    is_default: Optional[bool] = False


class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    is_default: Optional[bool] = None


class WarehouseSchema(WarehouseBase):
    id: int
    is_default: bool

    class Config:
        from_attributes = True


@router.get("/", response_model=List[WarehouseSchema])
@require_permission("warehouses_view")
async def list_warehouses(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """List all warehouses"""
    warehouses = db.query(Warehouse).all()
    return warehouses


@router.get("", response_model=List[WarehouseSchema])
@require_permission("warehouses_view")
async def list_warehouses_no_slash(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """List all warehouses (no trailing slash)"""
    return await list_warehouses(authorization, db)


@router.get("/")
@require_permission("warehouses_view")
async def list_warehouses_paginated(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """List all warehouses with pagination wrapper"""
    warehouses = db.query(Warehouse).all()
    
    # Convert to dict manually
    warehouses_data = [
        {"id": w.id, "name": w.name, "location": w.location, "is_default": w.is_default}
        for w in warehouses
    ]
    
    return {
        "data": warehouses_data,
        "pagination": {
            "page": 1,
            "pageSize": len(warehouses),
            "total": len(warehouses),
            "totalPages": 1
        }
    }


@router.get("/{warehouse_id}", response_model=WarehouseSchema)
@require_permission("warehouses_view")
async def get_warehouse(
    warehouse_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get a specific warehouse"""
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse


@router.post("/", response_model=WarehouseSchema)
@require_permission("warehouses_create")
async def create_warehouse(
    warehouse: WarehouseCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Create a new warehouse"""
    db_warehouse = Warehouse(**warehouse.dict())
    
    # If setting as default, unset other defaults
    if db_warehouse.is_default:
        db.query(Warehouse).filter(Warehouse.is_default == True).update({"is_default": False})
    
    db.add(db_warehouse)
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse


@router.put("/{warehouse_id}", response_model=WarehouseSchema)
@require_permission("warehouses_update")
async def update_warehouse(
    warehouse_id: int,
    warehouse: WarehouseUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Update a warehouse"""
    db_warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not db_warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    update_data = warehouse.dict(exclude_unset=True)
    
    # If setting as default, unset other defaults
    if update_data.get("is_default"):
        db.query(Warehouse).filter(Warehouse.id != warehouse_id).filter(Warehouse.is_default == True).update({"is_default": False})
    
    for key, value in update_data.items():
        setattr(db_warehouse, key, value)
    
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse


@router.delete("/{warehouse_id}")
@require_permission("warehouses_delete")
async def delete_warehouse(
    warehouse_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Delete a warehouse"""
    db_warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not db_warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    if db_warehouse.is_default:
        raise HTTPException(status_code=400, detail="Cannot delete default warehouse")
    
    db.delete(db_warehouse)
    db.commit()
    return {"message": "Warehouse deleted successfully"}
