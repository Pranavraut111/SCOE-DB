"""
Pydantic schemas for component-based result generation system
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============= Component Marks Schemas =============

class ComponentMarksBase(BaseModel):
    student_id: int
    subject_id: int
    subject_component_id: int
    exam_event_id: int
    marks_obtained: float = Field(ge=0, description="Marks obtained by student")
    max_marks: float = Field(gt=0, description="Maximum marks for this component")
    is_absent: bool = False


class ComponentMarksCreate(ComponentMarksBase):
    marks_entered_by: Optional[str] = None


class ComponentMarksResponse(ComponentMarksBase):
    id: int
    is_pass: bool
    grade: Optional[str] = None
    marks_entered_by: Optional[str] = None
    marks_entered_at: Optional[datetime] = None
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============= Bulk Component Marks Entry =============

class BulkComponentMarksEntry(BaseModel):
    student_id: int
    marks_obtained: float
    is_absent: bool = False
    remarks: Optional[str] = None


class BulkComponentMarksCreate(BaseModel):
    subject_id: int
    subject_component_id: int
    exam_event_id: int
    marks_entries: List[BulkComponentMarksEntry]
    marks_entered_by: Optional[str] = None


# ============= Subject Final Result Schemas =============

class SubjectFinalResultResponse(BaseModel):
    id: int
    student_id: int
    subject_id: int
    academic_year: str
    semester: int
    ia_marks: float
    ese_marks: float
    oral_marks: float
    practical_marks: float
    tw_marks: float
    total_marks_obtained: float
    total_max_marks: float
    percentage: float
    grade: Optional[str] = None
    grade_points: float
    is_pass: bool
    credits_earned: int
    is_backlog: bool
    attempt_number: int
    calculated_at: datetime
    
    class Config:
        from_attributes = True


# ============= Semester Result Schemas =============

class SemesterResultResponse(BaseModel):
    id: int
    student_id: int
    semester: int
    academic_year: str
    total_credits_attempted: int
    total_credits_earned: int
    sgpa: float
    cgpa: float
    total_subjects: int
    subjects_passed: int
    subjects_failed: int
    overall_percentage: float
    result_status: str
    result_class: Optional[str] = None
    has_backlogs: bool
    result_declared: bool
    
    class Config:
        from_attributes = True


# ============= Mark Sheet Schemas (For Display) =============

class ComponentMarkDetail(BaseModel):
    component_name: str
    component_type: str
    marks_obtained: float
    max_marks: float
    percentage: float


class SubjectMarkSheet(BaseModel):
    subject_code: str
    subject_name: str
    credits: int
    components: List[ComponentMarkDetail]
    total_marks: float
    max_marks: float
    percentage: float
    grade: str
    grade_points: float
    is_pass: bool


class StudentMarkSheet(BaseModel):
    student_name: str
    roll_number: str
    department: str
    semester: int
    academic_year: str
    subjects: List[SubjectMarkSheet]
    total_credits_attempted: int
    total_credits_earned: int
    sgpa: float
    cgpa: float
    overall_percentage: float
    result_status: str
    result_class: Optional[str] = None
    backlogs: List[str] = []
