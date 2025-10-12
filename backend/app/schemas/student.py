from pydantic import BaseModel, EmailStr, Field, validator
from datetime import date, datetime
from typing import Optional
from enum import Enum

class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"

class AcademicStatus(str, Enum):
    active = "active"
    promoted = "promoted"
    detained = "detained"
    graduated = "graduated"
    dropout = "dropout"

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
    # Student Progression Fields
    current_semester: Optional[int] = Field(1, ge=1, le=8, description="Current semester (1-8)")
    admission_year: Optional[int] = Field(2024, ge=2020, le=2030, description="Year student was admitted")
    academic_status: Optional[AcademicStatus] = AcademicStatus.active

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
    # Student Progression Fields
    current_semester: Optional[int] = Field(None, ge=1, le=8, description="Current semester (1-8)")
    admission_year: Optional[int] = Field(None, ge=2020, le=2030, description="Year student was admitted")
    academic_status: Optional[AcademicStatus] = None

class StudentInDBBase(StudentBase):
    id: int
    progression_updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Student(StudentInDBBase):
    pass

class StudentResponse(StudentInDBBase):
    """Enhanced response model with computed properties"""
    
    @property
    def academic_year_display(self) -> str:
        """Calculate academic year display based on current semester"""
        if not self.current_semester:
            return "Unknown"
        if self.current_semester <= 2:
            return "1st Year"
        elif self.current_semester <= 4:
            return "2nd Year"
        elif self.current_semester <= 6:
            return "3rd Year"
        elif self.current_semester <= 8:
            return "4th Year"
        else:
            return "Graduate"

class StudentInDB(StudentInDBBase):
    pass
