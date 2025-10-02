from sqlalchemy import Column, String, Integer, Date, Enum, Text
from app.db.base_class import Base
import enum

class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    middle_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(Enum(Gender), nullable=False)
    address = Column(Text)
    state = Column(String(50))
    country = Column(String(50))
    postal_code = Column(String(20))
    admission_number = Column(String(20), unique=True, index=True)
    roll_number = Column(String(32), unique=True, index=True)
    institutional_email = Column(String(150), unique=True, index=True)
    department = Column(String(100))
    category = Column(String(20))
    mother_name = Column(String(100), nullable=False)
    
    def __repr__(self):
        return f"<Student {self.first_name} {self.last_name} ({self.admission_number})>"
