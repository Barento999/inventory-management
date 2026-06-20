"""
Input validation utilities for API endpoints
"""

from typing import Any, Dict
import re
from fastapi import HTTPException, status


class ValidationError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail
        )


def validate_email(email: str) -> str:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValidationError("Invalid email format")
    return email


def validate_password(password: str) -> str:
    """Validate password strength"""
    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters")
    if not any(char.isupper() for char in password):
        raise ValidationError("Password must contain at least one uppercase letter")
    if not any(char.isdigit() for char in password):
        raise ValidationError("Password must contain at least one digit")
    return password


def validate_string(value: str, min_length: int = 1, max_length: int = 255, field_name: str = "field") -> str:
    """Validate string input"""
    if not value:
        raise ValidationError(f"{field_name} cannot be empty")
    if len(value) < min_length:
        raise ValidationError(f"{field_name} must be at least {min_length} characters")
    if len(value) > max_length:
        raise ValidationError(f"{field_name} must be at most {max_length} characters")
    # Remove potential XSS
    value = value.strip()
    return value


def validate_phone(phone: str) -> str:
    """Validate phone number"""
    pattern = r'^[\d\-\+\(\)\s]{10,}$'
    if not re.match(pattern, phone):
        raise ValidationError("Invalid phone number format")
    return phone


def validate_url(url: str) -> str:
    """Validate URL format"""
    pattern = r'^https?:\/\/.+'
    if not re.match(pattern, url):
        raise ValidationError("Invalid URL format")
    return url


def sanitize_input(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize all string inputs in dictionary"""
    sanitized = {}
    for key, value in data.items():
        if isinstance(value, str):
            sanitized[key] = value.strip()
        else:
            sanitized[key] = value
    return sanitized


def validate_pagination(page: int = 1, page_size: int = 10) -> tuple:
    """Validate pagination parameters"""
    if page < 1:
        raise ValidationError("Page must be >= 1")
    if page_size < 1 or page_size > 100:
        raise ValidationError("Page size must be between 1 and 100")
    return page, page_size
