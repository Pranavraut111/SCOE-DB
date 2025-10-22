from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class EnrollmentApplicationCreate(BaseModel):
    """Schema for creating a new enrollment application"""
    exam_event_id: int
    student_name: str
    roll_number: str
    department: str
    semester: int
    selected_subjects: List[int]  # List of subject IDs
    is_backlog_student: bool = False
    special_requirements: Optional[str] = None
    student_remarks: Optional[str] = None

class EnrollmentApplicationUpdate(BaseModel):
    """Schema for updating application status (admin)"""
    application_status: str  # 'approved' or 'rejected'
    admin_remarks: Optional[str] = None
    rejection_reason: Optional[str] = None

class EnrollmentApplicationResponse(BaseModel):
    """Schema for enrollment application response"""
    id: int
    exam_event_id: int
    student_id: int
    application_status: str
    applied_at: datetime
    
    student_name: str
    roll_number: str
    department: str
    semester: int
    selected_subjects: Optional[str] = None
    
    is_backlog_student: bool
    special_requirements: Optional[str] = None
    student_remarks: Optional[str] = None
    
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    admin_remarks: Optional[str] = None
    rejection_reason: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ExamEventNotification(BaseModel):
    """Schema for exam event notifications to students"""
    id: int
    name: str
    description: Optional[str] = None
    exam_type: str
    status: str
    department: str
    semester: int
    academic_year: str
    start_date: str
    end_date: str
    instructions: Optional[str] = None
    has_applied: bool = False  # Whether student has already applied
    application_status: Optional[str] = None  # If applied, what's the status
    
    class Config:
        from_attributes = True
