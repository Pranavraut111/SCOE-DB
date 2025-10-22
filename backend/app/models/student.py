from sqlalchemy import Column, String, Integer, Date, Enum, Text, DateTime
from sqlalchemy.sql import func
from app.db.base_class import Base
import enum

class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class AcademicStatus(str, enum.Enum):
    ACTIVE = "active"
    PROMOTED = "promoted"
    DETAINED = "detained"
    GRADUATED = "graduated"
    DROPOUT = "dropout"

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
    
    # Authentication
    password_hash = Column(String(255), nullable=True, comment="Hashed password for student login")
    
    # Student Progression Tracking Fields
    current_semester = Column(Integer, default=1, comment="Current semester (1-8)")
    admission_year = Column(Integer, default=2024, comment="Year student was admitted")
    # academic_status = Column(Enum(AcademicStatus), default=AcademicStatus.ACTIVE, comment="Current academic status")
    progression_updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), comment="Last progression update")
    
    def __repr__(self):
        return f"<Student {self.first_name} {self.last_name} ({self.admission_number}) - Sem {self.current_semester}>"
    
    @property
    def academic_year_display(self):
        """Calculate academic year display based on current semester"""
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
    
    @property
    def can_promote_to_next_semester(self):
        """Check if student can be promoted to next semester"""
        return self.current_semester < 8 and self.academic_status == AcademicStatus.ACTIVE
