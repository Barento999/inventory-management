from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_permission, check_permission
from app.models import Category, User

router = APIRouter()


class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CategorySchema(CategoryBase):
    id: int

    class Config:
        from_attributes = True


@router.get("/")
@require_permission("categories_view")
async def list_categories(
    search: Optional[str] = None,
    page: int = 1,
    pageSize: int = 10,
    current_user: User = Depends(check_permission("categories_view")),
    db: Session = Depends(get_db)
):
    """List all categories with pagination wrapper"""
    query = db.query(Category)
    
    if search:
        query = query.filter(Category.name.ilike(f"%{search}%"))
    
    total = query.count()
    offset = (page - 1) * pageSize
    categories = query.offset(offset).limit(pageSize).all()
    
    # Convert to dict manually
    categories_data = [
        {"id": c.id, "name": c.name, "description": c.description}
        for c in categories
    ]
    
    return {
        "data": categories_data,
        "pagination": {
            "page": page,
            "pageSize": pageSize,
            "total": total,
            "totalPages": (total + pageSize - 1) // pageSize
        }
    }


@router.get("/{category_id}", response_model=CategorySchema)
@require_permission("categories_view")
async def get_category(
    category_id: int,
    current_user: User = Depends(check_permission("categories_view")),
    db: Session = Depends(get_db)
):
    """Get a specific category"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("/", response_model=CategorySchema)
@require_permission("categories_create")
async def create_category(
    category: CategoryCreate,
    current_user: User = Depends(check_permission("categories_create")),
    db: Session = Depends(get_db)
):
    """Create a new category"""
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.put("/{category_id}", response_model=CategorySchema)
@require_permission("categories_update")
async def update_category(
    category_id: int,
    category: CategoryUpdate,
    current_user: User = Depends(check_permission("categories_update")),
    db: Session = Depends(get_db)
):
    """Update a category"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category


@router.delete("/{category_id}")
@require_permission("categories_delete")
async def delete_category(
    category_id: int,
    current_user: User = Depends(check_permission("categories_delete")),
    db: Session = Depends(get_db)
):
    """Delete a category"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}
