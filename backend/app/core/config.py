from pydantic_settings import BaseSettings
from typing import Optional
from urllib.parse import quote_plus

class Settings(BaseSettings):
    PROJECT_NAME: str = "Student Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    MYSQL_SERVER: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = "Pranav@2137"
    MYSQL_DB: str = "student_management"
    DATABASE_URI: Optional[str] = None

    # SMTP for email export
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_NAME: str = "SCOE Admin"
    SMTP_FROM_EMAIL: Optional[str] = None
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
encoded_password = quote_plus(settings.MYSQL_PASSWORD)
settings.DATABASE_URI = (
    f"mysql+pymysql://{settings.MYSQL_USER}:{encoded_password}"
    f"@{settings.MYSQL_SERVER}:{settings.MYSQL_PORT}/{settings.MYSQL_DB}?charset=utf8mb4"
)
