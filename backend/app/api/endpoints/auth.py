from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.core.security import hash_password, verify_password, create_access_token
from app.core.database import get_db
import uuid

router = APIRouter()


class UserLogin(BaseModel):
    email: str
    password: str


class UserRegister(BaseModel):
    email: str
    password: str
    name: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# In-memory user store for demo (replace with database later)
users_db = {
    "admin@demo.com": {
        "id": "1",
        "email": "admin@demo.com",
        "password_hash": hash_password("admin123"),
        "name": "Admin User",
        "role": "admin"
    },
    "manager@demo.com": {
        "id": "2",
        "email": "manager@demo.com",
        "password_hash": hash_password("manager123"),
        "name": "Manager User",
        "role": "manager"
    },
    "staff@demo.com": {
        "id": "3",
        "email": "staff@demo.com",
        "password_hash": hash_password("staff123"),
        "name": "Staff User",
        "role": "staff"
    }
}


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db = Depends(get_db)):
    """Login endpoint"""
    user = users_db.get(credentials.email)
    
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(
        data={"sub": user["email"], "user_id": user["id"], "role": user["role"]}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"]
        }
    }


@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, db = Depends(get_db)):
    """Register endpoint"""
    
    if data.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_data = {
        "id": user_id,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "name": data.name,
        "role": "user"
    }
    
    users_db[data.email] = user_data
    
    access_token = create_access_token(
        data={"sub": data.email, "user_id": user_id, "role": "user"}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": data.email,
            "name": data.name,
            "role": "user"
        }
    }


@router.post("/forgot-password")
async def forgot_password(email: str):
    """Forgot password endpoint"""
    user = users_db.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # In a real app, send reset email here
    return {"message": "Password reset email sent"}


@router.post("/reset-password")
async def reset_password(token: str, password: str):
    """Reset password endpoint"""
    # In a real app, verify the token and update password
    return {"message": "Password reset successfully"}
