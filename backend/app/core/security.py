"""
Security utilities for password hashing and verification
"""
import bcrypt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password
    """
    # Ensure password is bytes and truncate to 72 bytes if needed
    password_bytes = plain_password.encode('utf-8')[:72]
    
    # If hashed_password is a string, encode it
    if isinstance(hashed_password, str):
        hashed_bytes = hashed_password.encode('utf-8')
    else:
        hashed_bytes = hashed_password
    
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def get_password_hash(password: str) -> str:
    """
    Hash a password for storing
    """
    # Ensure password is bytes and truncate to 72 bytes if needed
    password_bytes = password.encode('utf-8')[:72]
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode('utf-8')
