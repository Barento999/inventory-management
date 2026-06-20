from fastapi import APIRouter, HTTPException, Depends, Header, Request
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.core.security import hash_password, verify_password, create_access_token, verify_token
from app.core.database import get_db
from app.core.security_middleware import limiter
from app.core.validation import validate_email, validate_password, sanitize_input
from app.core.audit import log_authentication_failure, log_action
from app.models import User

router = APIRouter()


class UserLogin(BaseModel):
    email: str
    password: str


class UserRegister(BaseModel):
    email: str
    password: str
    name: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    """Login endpoint - authenticate user with email and password"""
    # Validate input
    email = validate_email(credentials.email)
    ip = request.client.host if request.client else "unknown"
    
    # Find user by email
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        log_authentication_failure(db, email, "User not found", ip)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        log_authentication_failure(db, email, "Invalid password", ip)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create JWT token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role}
    )
    
    log_action(db, user, "LOGIN", "authentication", ip_address=ip)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    }


@router.post("/register", response_model=TokenResponse)
@limiter.limit("5/minute")
async def register(request: Request, data: UserRegister, db: Session = Depends(get_db)):
    """Register endpoint - create new user account"""
    
    # Validate input
    email = validate_email(data.email)
    password = validate_password(data.password)
    name = sanitize_input({"name": data.name})["name"]
    ip = request.client.host if request.client else "unknown"
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        log_authentication_failure(db, email, "Email already registered", ip)
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = User(
        email=email,
        password_hash=hash_password(password),
        name=name,
        role="user"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create JWT token
    access_token = create_access_token(
        data={"sub": new_user.email, "user_id": new_user.id, "role": "user"}
    )
    
    log_action(db, new_user, "REGISTER", "authentication", ip_address=ip)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "name": new_user.name,
            "role": "user"
        }
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Get current logged-in user (requires valid token in header)"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@router.post("/logout")
async def logout():
    """Logout endpoint - client should discard token"""
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send password reset email (placeholder implementation)"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Don't reveal if email exists or not for security
        return {"message": "If the email exists, a reset link will be sent"}
    
    # In a real implementation, you would:
    # 1. Generate a reset token
    # 2. Send an email with the reset link
    # For now, return a success message
    return {"message": "Password reset link sent to email"}


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using token (placeholder implementation)"""
    payload = verify_token(request.token)
    if not payload:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.password_hash = hash_password(request.password)
    db.commit()
    
    return {"message": "Password reset successfully"}
