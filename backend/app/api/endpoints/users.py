from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User

router = APIRouter()


class UserBase(BaseModel):
    email: str
    name: str
    role: str = "user"


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None


class UserSchema(UserBase):
    id: int

    class Config:
        from_attributes = True


@router.get("/", response_model=List[UserSchema])
async def list_users(
    db: Session = Depends(get_db)
):
    """List all users (excluding password)"""
    users = db.query(User).all()
    return users


@router.get("", response_model=List[UserSchema])
async def list_users_no_slash(
    db: Session = Depends(get_db)
):
    """List all users (no trailing slash)"""
    return await list_users(db)


@router.get("/")
async def list_users_paginated(
    db: Session = Depends(get_db)
):
    """List all users with pagination wrapper"""
    users = db.query(User).all()
    
    # Convert to dict manually
    users_data = [
        {"id": u.id, "email": u.email, "name": u.name, "role": u.role}
        for u in users
    ]
    
    return {
        "data": users_data,
        "pagination": {
            "page": 1,
            "pageSize": len(users),
            "total": len(users),
            "totalPages": 1
        }
    }


@router.get("/{user_id}", response_model=UserSchema)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/", response_model=UserSchema)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    from app.core.security import hash_password
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = User(
        email=user.email,
        name=user.name,
        role=user.role,
        password_hash=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: int, 
    user: UserUpdate, 
    db: Session = Depends(get_db)
):
    """Update a user"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user.dict(exclude_unset=True)
    
    # Hash password if provided
    if "password" in update_data:
        from app.core.security import hash_password
        update_data["password_hash"] = hash_password(update_data.pop("password"))
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete("/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete a user"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting the last admin
    if db_user.role == "admin":
        admin_count = db.query(User).filter(User.role == "admin").count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot delete the last admin user")
    
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}
