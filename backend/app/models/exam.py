from sqlalchemy import Column, String, Integer, Date, DateTime, Text, ForeignKey, Boolean, Float, Enum
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum
from datetime import datetime

class ExamType(str, enum.Enum):
    MID_TERM = "Mid-Term Examination"
    END_TERM = "End-Term Examination"
    INTERNAL = "Internal Assessment"
    PRACTICAL = "Practical Examination"
    VIVA = "Viva Voce"
    PROJECT = "Project Evaluation"

class ExamStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class EnrollmentStatus(str, enum.Enum):
    ENROLLED = "enrolled"
    ABSENT = "absent"
    EXEMPTED = "exempted"
    DISQUALIFIED = "disqualified"

class ApplicationStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class ExamEvent(Base):
    """
    Main exam event (e.g., "Second Year Mid-Term Exams, Winter 2025")
    Acts as a container for multiple exam sessions
    """
    __tablename__ = "exam_events"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)  # "Second Year Mid-Term Exams, Winter 2025"
    description = Column(Text)
    exam_type = Column(Enum(ExamType), nullable=False)
    status = Column(Enum(ExamStatus), default=ExamStatus.DRAFT)
    
    # Academic details
    department = Column(String(100), nullable=False)  # "Computer Science Engineering"
    semester = Column(Integer, nullable=False)  # 3
    academic_year = Column(String(20), nullable=False)  # "2024-25"
    
    # Date range
    start_date = Column(Date, nullable=False)  # October 20th
    end_date = Column(Date, nullable=False)    # October 28th
    
    # Metadata
    created_by = Column(String(100))  # Admin who created
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Instructions and rules
    instructions = Column(Text)  # General exam instructions
    passing_marks_percentage = Column(Float, default=40.0)  # 40% to pass
    
    # Relationships
    exam_schedules = relationship("ExamSchedule", back_populates="exam_event", cascade="all, delete-orphan")
    student_enrollments = relationship("StudentExamEnrollment", back_populates="exam_event", cascade="all, delete-orphan")

class ExamSchedule(Base):
    """
    Individual exam sessions within an event
    (e.g., "Data Structures exam on Oct 20, 10 AM - 1 PM")
    """
    __tablename__ = "exam_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    exam_event_id = Column(Integer, ForeignKey("exam_events.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    
    # Exam details
    exam_date = Column(Date, nullable=False)
    start_time = Column(String(10), nullable=False)  # "10:00"
    end_time = Column(String(10), nullable=False)    # "13:00"
    duration_minutes = Column(Integer, nullable=False)  # 180
    
    # Venue and logistics
    venue = Column(String(100))  # "Room A-101"
    max_students = Column(Integer, default=60)
    supervisor = Column(String(100))  # Exam supervisor name
    
    # Marks configuration
    total_marks = Column(Integer, nullable=False, default=100)
    theory_marks = Column(Integer, default=80)
    practical_marks = Column(Integer, default=20)
    
    # Instructions specific to this exam
    special_instructions = Column(Text)
    materials_allowed = Column(Text)  # "Calculator, Drawing instruments"
    
    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    exam_event = relationship("ExamEvent", back_populates="exam_schedules")
    subject = relationship("Subject")
    student_exams = relationship("StudentExam", back_populates="exam_schedule", cascade="all, delete-orphan")

class StudentExamEnrollment(Base):
    """
    Links students to exam events (bulk enrollment)
    """
    __tablename__ = "student_exam_enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    exam_event_id = Column(Integer, ForeignKey("exam_events.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    
    # Enrollment details
    enrollment_status = Column(Enum(EnrollmentStatus), default=EnrollmentStatus.ENROLLED)
    enrollment_date = Column(DateTime, default=datetime.utcnow)
    
    # Special cases
    is_backlog_student = Column(Boolean, default=False)
    exempted_subjects = Column(Text)  # JSON array of subject IDs
    special_requirements = Column(Text)  # Extra time, scribe, etc.
    
    # Metadata
    enrolled_by = Column(String(100))  # Admin who enrolled
    notes = Column(Text)
    
    # Relationships
    exam_event = relationship("ExamEvent", back_populates="student_enrollments")
    student = relationship("Student")

class StudentExam(Base):
    """
    Individual student's exam attempt for a specific subject
    """
    __tablename__ = "student_exams"
    
    id = Column(Integer, primary_key=True, index=True)
    exam_schedule_id = Column(Integer, ForeignKey("exam_schedules.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    
    # Attendance
    attendance_status = Column(Enum(EnrollmentStatus), default=EnrollmentStatus.ENROLLED)
    seat_number = Column(String(20))  # "A-15"
    
    # Marks
    theory_marks_obtained = Column(Float, default=0.0)
    practical_marks_obtained = Column(Float, default=0.0)
    total_marks_obtained = Column(Float, default=0.0)
    
    # Grading
    grade = Column(String(5))  # A+, A, B+, B, C, F
    is_pass = Column(Boolean, default=False)
    
    # Exam conduct
    start_time_actual = Column(DateTime)  # When student actually started
    end_time_actual = Column(DateTime)    # When student submitted
    extra_time_given = Column(Integer, default=0)  # Minutes of extra time
    
    # Issues and remarks
    malpractice_reported = Column(Boolean, default=False)
    malpractice_details = Column(Text)
    examiner_remarks = Column(Text)
    
    # Answer sheet tracking
    answer_sheet_number = Column(String(50))
    answer_sheet_received = Column(Boolean, default=False)
    
    # Metadata
    marks_entered_by = Column(String(100))  # Who entered the marks
    marks_entered_at = Column(DateTime)
    verified_by = Column(String(100))       # Who verified the marks
    verified_at = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    exam_schedule = relationship("ExamSchedule", back_populates="student_exams")
    student = relationship("Student")

class ExamResult(Base):
    """
    Consolidated results for a student in an exam event
    """
    __tablename__ = "exam_results"
    
    id = Column(Integer, primary_key=True, index=True)
    exam_event_id = Column(Integer, ForeignKey("exam_events.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    
    # Overall performance
    total_subjects = Column(Integer, nullable=False)
    subjects_appeared = Column(Integer, default=0)
    subjects_passed = Column(Integer, default=0)
    subjects_failed = Column(Integer, default=0)
    
    # Marks summary
    total_marks_possible = Column(Float, default=0.0)
    total_marks_obtained = Column(Float, default=0.0)
    percentage = Column(Float, default=0.0)
    
    # Overall result
    overall_grade = Column(String(5))  # A+, A, B+, B, C, F
    is_promoted = Column(Boolean, default=False)
    has_backlogs = Column(Boolean, default=False)
    backlog_subjects = Column(Text)  # JSON array of subject names
    
    # Result status
    result_declared = Column(Boolean, default=False)
    result_declared_at = Column(DateTime)
    result_declared_by = Column(String(100))
    
    # Remarks
    remarks = Column(Text)
    
    # Metadata
    calculated_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    exam_event = relationship("ExamEvent")
    student = relationship("Student")

class StudentEnrollmentApplication(Base):
    """
    Student-initiated enrollment applications for exam events
    Students apply, admin reviews and approves/rejects
    """
    __tablename__ = "student_enrollment_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    exam_event_id = Column(Integer, ForeignKey("exam_events.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    
    # Application details
    application_status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)
    applied_at = Column(DateTime, default=datetime.utcnow)
    
    # Student-provided information (for verification)
    student_name = Column(String(200), nullable=False)
    roll_number = Column(String(32), nullable=False)
    department = Column(String(100), nullable=False)
    semester = Column(Integer, nullable=False)
    
    # Subject selection (JSON array of subject IDs or names)
    selected_subjects = Column(Text)  # JSON array
    
    # Special requirements
    is_backlog_student = Column(Boolean, default=False)
    special_requirements = Column(Text)
    student_remarks = Column(Text)
    
    # Admin review
    reviewed_by = Column(String(100))  # Admin who reviewed
    reviewed_at = Column(DateTime)
    admin_remarks = Column(Text)
    rejection_reason = Column(Text)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    exam_event = relationship("ExamEvent")
    student = relationship("Student")
