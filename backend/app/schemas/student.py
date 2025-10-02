from pydantic import BaseModel, EmailStr, Field, validator
from datetime import date
from typing import Optional
from enum import Enum

class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"

class StudentBase(BaseModel):
    first_name: str = Field(..., max_length=50)
    middle_name: str = Field(..., max_length=50)
    last_name: str = Field(..., max_length=50)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    date_of_birth: date
    gender: Gender
    address: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = Field(None, max_length=20)
    admission_number: Optional[str] = Field(None, max_length=20)
    # Extended
    roll_number: Optional[str] = Field(None, max_length=32)
    institutional_email: Optional[EmailStr] = None
    department: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=20)
    mother_name: str = Field(..., max_length=100)

    @validator('phone')
    def validate_phone(cls, v):
        if v and not v.isdigit():
            raise ValueError('Phone number must contain only digits')
        return v

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=50)
    middle_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = Field(None, max_length=20)
    admission_number: Optional[str] = Field(None, max_length=20)
    roll_number: Optional[str] = Field(None, max_length=32)
    institutional_email: Optional[EmailStr] = None
    department: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=20)
    mother_name: Optional[str] = Field(None, max_length=100)

class StudentInDBBase(StudentBase):
    id: int

    class Config:
        from_attributes = True

class Student(StudentInDBBase):
    pass

class StudentInDB(StudentInDBBase):
    pass
