from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from app.models.student_progression import ProgressionStatus

class StudentProgressionBase(BaseModel):
    student_id: int
    from_semester: int
    to_semester: int
    academic_year: str
    promotion_date: date
    exam_event_id: Optional[int] = None
    status: ProgressionStatus = ProgressionStatus.PROMOTED
    remarks: Optional[str] = None

class StudentProgressionCreate(StudentProgressionBase):
    pass

class StudentProgressionResponse(StudentProgressionBase):
    id: int
    created_at: date
    
    class Config:
        from_attributes = True

class StudentPromotionItem(BaseModel):
    student_id: int
    to_semester: int
    status: ProgressionStatus
    remarks: Optional[str] = None

class BulkPromotionRequest(BaseModel):
    students: List[StudentPromotionItem]
    academic_year: str
    promotion_date: date
    exam_event_id: Optional[int] = None

class StudentProgressionSummary(BaseModel):
    student_id: int
    student_name: str
    roll_number: str
    current_semester: int
    admission_year: int
    academic_status: str
    total_progressions: int
    last_promotion_date: Optional[date] = None
