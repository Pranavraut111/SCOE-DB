from sqlalchemy import Column, String, Integer, Date, Enum, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class ProgressionStatus(str, enum.Enum):
    PROMOTED = "promoted"
    DETAINED = "detained"
    REPEATED = "repeated"

class StudentProgressionHistory(Base):
    __tablename__ = "student_progression_history"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    from_semester = Column(Integer, nullable=False, comment="Previous semester")
    to_semester = Column(Integer, nullable=False, comment="Promoted to semester")
    academic_year = Column(String(10), nullable=False, comment="e.g., 2023-24")
    promotion_date = Column(Date, nullable=False)
    exam_event_id = Column(Integer, ForeignKey("exam_events.id"), nullable=True, comment="Exam that led to promotion")
    status = Column(Enum(ProgressionStatus), default=ProgressionStatus.PROMOTED)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    student = relationship("Student", back_populates="progression_history")
    exam_event = relationship("ExamEvent", back_populates="student_progressions")
    
    def __repr__(self):
        return f"<Progression {self.student_id}: Sem {self.from_semester} → {self.to_semester} ({self.status})>"
    
    @property
    def academic_year_display(self):
        """Format academic year for display"""
        return f"AY {self.academic_year}"
