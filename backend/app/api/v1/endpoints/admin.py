from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.core.config import settings
from app.core.security import verify_password, get_password_hash

router = APIRouter()

# Admin credentials from settings (loaded from .env file)
ADMIN_EMAIL = settings.ADMIN_EMAIL
ADMIN_PASSWORD = settings.ADMIN_PASSWORD

# Cache for password hash (computed once on first login)
_password_hash_cache = None

def get_admin_password_hash():
    """Get or compute the admin password hash (cached)"""
    global _password_hash_cache
    if _password_hash_cache is None:
        _password_hash_cache = get_password_hash(ADMIN_PASSWORD)
    return _password_hash_cache

class AdminLogin(BaseModel):
    """Schema for admin login"""
    email: EmailStr
    password: str

class AdminLoginResponse(BaseModel):
    """Response after successful admin login"""
    email: str
    role: str = "admin"
    message: str = "Login successful"

@router.post("/auth/login", response_model=AdminLoginResponse)
def admin_login(credentials: AdminLogin):
    """
    Admin login with environment-configured credentials.
    Credentials are stored in .env file or environment variables.
    Password is hashed using bcrypt for security.
    """
    # Verify email
    if credentials.email != ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password using bcrypt
    if not verify_password(credentials.password, get_admin_password_hash()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    return {
        "email": ADMIN_EMAIL,
        "role": "admin",
        "message": "Login successful"
    }

@router.post("/auth/verify")
def verify_admin(email: str):
    """
    Verify if the provided email is the admin email
    """
    if email != ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )
    
    return {
        "email": email,
        "role": "admin",
        "verified": True
    }
