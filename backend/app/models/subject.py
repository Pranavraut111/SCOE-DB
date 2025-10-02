from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class Department(str, enum.Enum):
    COMPUTER_SCIENCE_ENGINEERING = "Computer Science Engineering"
    INFORMATION_TECHNOLOGY = "Information Technology"
    ELECTRONICS_COMMUNICATION = "Electronics and Communication Engineering"
    ELECTRICAL = "Electrical Engineering"
    MECHANICAL = "Mechanical Engineering"
    CIVIL = "Civil Engineering"

class Semester(str, enum.Enum):
    I = "I"
    II = "II"
    III = "III"
    IV = "IV"
    V = "V"
    VI = "VI"
    VII = "VII"
    VIII = "VIII"

class ComponentType(str, enum.Enum):
    ESE = "ESE"  # End Semester Exam
    IA = "IA"    # Internal Assessment
    TW = "TW"    # Term Work
    PR = "PR"    # Practical
    OR = "OR"    # Oral
    TH = "TH"    # Theory

class SubjectCatalog(Base):
    """Predefined subject catalog for Mumbai University"""
    __tablename__ = "subject_catalog"
    
    id = Column(Integer, primary_key=True, index=True)
    department = Column(Enum(Department), nullable=False)
    semester = Column(Enum(Semester), nullable=False)
    subject_code = Column(String(20), nullable=False)
    subject_name = Column(String(200), nullable=False)
    default_credits = Column(Integer, default=3)
    
    def __repr__(self):
        return f"<SubjectCatalog {self.subject_code}: {self.subject_name}>"

class Subject(Base):
    """Subject master for specific academic year"""
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    year = Column(String(10), nullable=False)  # e.g., "2024-25"
    scheme = Column(String(20), nullable=False)  # e.g., "2019", "2015"
    department = Column(Enum(Department), nullable=False)
    semester = Column(Enum(Semester), nullable=False)
    subject_code = Column(String(20), nullable=False)
    subject_name = Column(String(200), nullable=False)
    credits = Column(Integer, nullable=False)
    overall_passing_criteria = Column(Float, default=40.0)  # Percentage
    
    # Relationships
    components = relationship("SubjectComponent", back_populates="subject", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Subject {self.subject_code}: {self.subject_name} ({self.year})>"

class SubjectComponent(Base):
    """Marks breakdown components for subjects"""
    __tablename__ = "subject_components"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    component_type = Column(Enum(ComponentType), nullable=False)
    is_enabled = Column(Boolean, default=True)
    out_of_marks = Column(Integer, nullable=False)
    passing_marks = Column(Integer, nullable=False)
    resolution = Column(String(100))  # e.g., "Practical resolution", "Viva voce"
    
    # Relationships
    subject = relationship("Subject", back_populates="components")
    
    def __repr__(self):
        return f"<SubjectComponent {self.component_type}: {self.out_of_marks} marks>"
