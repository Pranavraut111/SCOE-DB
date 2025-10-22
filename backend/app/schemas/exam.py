from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

class ExamTypeEnum(str, Enum):
    MID_TERM = "Mid-Term Examination"
    END_TERM = "End-Term Examination"
    INTERNAL = "Internal Assessment"
    PRACTICAL = "Practical Examination"
    VIVA = "Viva Voce"
    PROJECT = "Project Evaluation"

class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    EXEMPTED = "exempted"
    DISQUALIFIED = "disqualified"

class ExamStatusEnum(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class EnrollmentStatusEnum(str, Enum):
    ENROLLED = "enrolled"
    ABSENT = "absent"
    EXEMPTED = "exempted"
    DISQUALIFIED = "disqualified"

# Exam Event Schemas
class ExamEventBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    exam_type: ExamTypeEnum
    department: str = Field(..., min_length=1, max_length=100)
    semester: int = Field(..., ge=1, le=8)
    academic_year: str = Field(..., pattern=r"^\d{4}-\d{2}$")
    start_date: date
    end_date: date
    instructions: Optional[str] = None
    passing_marks_percentage: float = Field(default=40.0, ge=0, le=100)

    @validator('end_date')
    def end_date_must_be_after_start_date(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('End date must be after start date')
        return v

class ExamEventCreate(ExamEventBase):
    created_by: Optional[str] = None

class ExamEventUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    exam_type: Optional[ExamTypeEnum] = None
    status: Optional[ExamStatusEnum] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    instructions: Optional[str] = None
    passing_marks_percentage: Optional[float] = Field(None, ge=0, le=100)

class ExamEvent(ExamEventBase):
    id: int
    status: ExamStatusEnum
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Exam Schedule Schemas
class ExamScheduleBase(BaseModel):
    subject_id: int
    exam_date: date
    start_time: str = Field(..., pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    end_time: str = Field(..., pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    duration_minutes: int = Field(..., ge=30, le=480)
    venue: Optional[str] = Field(None, max_length=100)
    max_students: int = Field(default=60, ge=1, le=500)
    supervisor: Optional[str] = Field(None, max_length=100)
    total_marks: int = Field(default=100, ge=1, le=1000)
    theory_marks: Optional[int] = Field(default=None, ge=0)
    practical_marks: Optional[int] = Field(default=None, ge=0)
    special_instructions: Optional[str] = None
    materials_allowed: Optional[str] = None

class ExamScheduleCreate(ExamScheduleBase):
    exam_event_id: int

class ExamScheduleUpdate(BaseModel):
    exam_date: Optional[date] = None
    start_time: Optional[str] = Field(None, pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    end_time: Optional[str] = Field(None, pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    duration_minutes: Optional[int] = Field(None, ge=30, le=480)
    venue: Optional[str] = Field(None, max_length=100)
    max_students: Optional[int] = Field(None, ge=1, le=500)
    supervisor: Optional[str] = Field(None, max_length=100)
    total_marks: Optional[int] = Field(None, ge=1, le=1000)
    theory_marks: Optional[int] = Field(None, ge=0)
    practical_marks: Optional[int] = Field(None, ge=0)
    special_instructions: Optional[str] = None
    materials_allowed: Optional[str] = None
    is_active: Optional[bool] = None

class ExamSchedule(ExamScheduleBase):
    id: int
    exam_event_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    subject: Optional[Dict[str, Any]] = None  # Include subject details

    class Config:
        from_attributes = True

# Student Enrollment Schemas
class StudentExamEnrollmentBase(BaseModel):
    enrollment_status: EnrollmentStatusEnum = EnrollmentStatusEnum.ENROLLED
    is_backlog_student: bool = False
    exempted_subjects: Optional[str] = None  # JSON string
    special_requirements: Optional[str] = None
    notes: Optional[str] = None

class StudentExamEnrollmentCreate(StudentExamEnrollmentBase):
    exam_event_id: int
    student_id: int
    enrolled_by: Optional[str] = None

class StudentExamEnrollmentUpdate(BaseModel):
    enrollment_status: Optional[EnrollmentStatusEnum] = None
    is_backlog_student: Optional[bool] = None
    exempted_subjects: Optional[str] = None
    special_requirements: Optional[str] = None
    notes: Optional[str] = None

class StudentExamEnrollment(StudentExamEnrollmentBase):
    id: int
    exam_event_id: int
    student_id: int
    enrollment_date: datetime
    enrolled_by: Optional[str]

    class Config:
        from_attributes = True

# Student Exam Schemas
class StudentExamBase(BaseModel):
    attendance_status: EnrollmentStatusEnum = EnrollmentStatusEnum.ENROLLED
    seat_number: Optional[str] = Field(None, max_length=20)
    theory_marks_obtained: float = Field(default=0.0, ge=0)
    practical_marks_obtained: float = Field(default=0.0, ge=0)
    total_marks_obtained: float = Field(default=0.0, ge=0)
    grade: Optional[str] = Field(None, max_length=5)
    is_pass: bool = False
    extra_time_given: int = Field(default=0, ge=0)
    malpractice_reported: bool = False
    malpractice_details: Optional[str] = None
    examiner_remarks: Optional[str] = None
    answer_sheet_number: Optional[str] = Field(None, max_length=50)
    answer_sheet_received: bool = False

class StudentExamCreate(StudentExamBase):
    exam_schedule_id: int
    student_id: int

class StudentExamUpdate(BaseModel):
    attendance_status: Optional[EnrollmentStatusEnum] = None
    seat_number: Optional[str] = Field(None, max_length=20)
    theory_marks_obtained: Optional[float] = Field(None, ge=0)
    practical_marks_obtained: Optional[float] = Field(None, ge=0)
    total_marks_obtained: Optional[float] = Field(None, ge=0)
    grade: Optional[str] = Field(None, max_length=5)
    is_pass: Optional[bool] = None
    start_time_actual: Optional[datetime] = None
    end_time_actual: Optional[datetime] = None
    extra_time_given: Optional[int] = Field(None, ge=0)
    malpractice_reported: Optional[bool] = None
    malpractice_details: Optional[str] = None
    examiner_remarks: Optional[str] = None
    answer_sheet_number: Optional[str] = Field(None, max_length=50)
    answer_sheet_received: Optional[bool] = None
    marks_entered_by: Optional[str] = None
    verified_by: Optional[str] = None

class StudentExam(StudentExamBase):
    id: int
    exam_schedule_id: int
    student_id: int
    start_time_actual: Optional[datetime]
    end_time_actual: Optional[datetime]
    marks_entered_by: Optional[str]
    marks_entered_at: Optional[datetime]
    verified_by: Optional[str]
    verified_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Exam Result Schemas
class ExamResultBase(BaseModel):
    total_subjects: int = Field(..., ge=0)
    subjects_appeared: int = Field(default=0, ge=0)
    subjects_passed: int = Field(default=0, ge=0)
    subjects_failed: int = Field(default=0, ge=0)
    total_marks_possible: float = Field(default=0.0, ge=0)
    total_marks_obtained: float = Field(default=0.0, ge=0)
    percentage: float = Field(default=0.0, ge=0, le=100)
    overall_grade: Optional[str] = Field(None, max_length=5)
    is_promoted: bool = False
    has_backlogs: bool = False
    backlog_subjects: Optional[str] = None  # JSON string
    result_declared: bool = False
    remarks: Optional[str] = None

class ExamResultCreate(ExamResultBase):
    exam_event_id: int
    student_id: int

class ExamResultUpdate(BaseModel):
    marks_obtained: Optional[float] = Field(None, ge=0)
    attendance: Optional[AttendanceStatus] = None
    grade: Optional[str] = Field(None, max_length=5)
    percentage: Optional[float] = Field(None, ge=0, le=100)
    remarks: Optional[str] = None
    is_passed: Optional[bool] = None

class ExamResult(ExamResultBase):
    id: int
    exam_event_id: int
    student_id: int
    result_declared_at: Optional[datetime]
    result_declared_by: Optional[str]
    calculated_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Bulk Operations Schemas
class BulkEnrollmentRequest(BaseModel):
    exam_event_id: int
    department: Optional[str] = None
    semester: Optional[int] = None
    student_ids: Optional[List[int]] = None
    exclude_student_ids: Optional[List[int]] = None
    enrolled_by: Optional[str] = None

class BulkEnrollmentResponse(BaseModel):
    total_eligible: int
    enrolled_count: int
    skipped_count: int
    errors: List[str]
    enrolled_students: List[Dict[str, Any]]

class ExamTimetableResponse(BaseModel):
    exam_event: ExamEvent
    schedules: List[ExamSchedule]
    total_students_enrolled: int
    venue_conflicts: List[Dict[str, Any]]
    supervisor_conflicts: List[Dict[str, Any]]

class MarksEntryBulk(BaseModel):
    exam_schedule_id: int
    marks_data: List[Dict[str, Any]]  # [{"student_id": 1, "theory_marks": 85, "practical_marks": 18}]
    entered_by: str

class ExamStatistics(BaseModel):
    exam_event_id: int
    total_students: int
    students_appeared: int
    students_absent: int
    pass_percentage: float
    average_marks: float
    highest_marks: float
    lowest_marks: float
    grade_distribution: Dict[str, int]
    subject_wise_performance: List[Dict[str, Any]]

# Dashboard Schemas
class ExamDashboard(BaseModel):
    upcoming_exams: List[ExamEvent]
    ongoing_exams: List[ExamEvent]
    recent_results: List[ExamResult]
    pending_marks_entry: int
    total_students_enrolled: int
    exam_statistics: Dict[str, Any]

# Missing schemas for CRUD operations
class BulkEnrollmentCreate(BaseModel):
    exam_event_id: int
    student_ids: List[int]
    
class BulkMarksEntry(BaseModel):
    exam_schedule_id: int
    marks_data: List[dict]  # List of {student_id, marks_obtained, attendance}
