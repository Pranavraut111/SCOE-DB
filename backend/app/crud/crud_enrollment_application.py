from sqlalchemy.orm import Session
from app.models.exam import StudentEnrollmentApplication, ExamEvent, ApplicationStatus
from app.schemas.enrollment_application import EnrollmentApplicationCreate, EnrollmentApplicationUpdate
from datetime import datetime
import json

def create_application(db: Session, student_id: int, application: EnrollmentApplicationCreate):
    """Create a new enrollment application"""
    # Check if student already applied for this exam event
    existing = db.query(StudentEnrollmentApplication).filter(
        StudentEnrollmentApplication.exam_event_id == application.exam_event_id,
        StudentEnrollmentApplication.student_id == student_id
    ).first()
    
    if existing:
        raise ValueError("You have already applied for this exam event")
    
    db_application = StudentEnrollmentApplication(
        exam_event_id=application.exam_event_id,
        student_id=student_id,
        student_name=application.student_name,
        roll_number=application.roll_number,
        department=application.department,
        semester=application.semester,
        selected_subjects=json.dumps(application.selected_subjects),
        is_backlog_student=application.is_backlog_student,
        special_requirements=application.special_requirements,
        student_remarks=application.student_remarks,
        application_status=ApplicationStatus.PENDING
    )
    
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

def get_applications_by_exam_event(db: Session, exam_event_id: int, status: str = None):
    """Get all applications for an exam event, optionally filtered by status"""
    query = db.query(StudentEnrollmentApplication).filter(
        StudentEnrollmentApplication.exam_event_id == exam_event_id
    )
    
    if status:
        query = query.filter(StudentEnrollmentApplication.application_status == status)
    
    return query.order_by(StudentEnrollmentApplication.applied_at.desc()).all()

def get_student_application(db: Session, exam_event_id: int, student_id: int):
    """Get student's application for a specific exam event"""
    return db.query(StudentEnrollmentApplication).filter(
        StudentEnrollmentApplication.exam_event_id == exam_event_id,
        StudentEnrollmentApplication.student_id == student_id
    ).first()

def update_application_status(
    db: Session, 
    application_id: int, 
    update: EnrollmentApplicationUpdate,
    admin_email: str
):
    """Update application status (approve/reject)"""
    application = db.query(StudentEnrollmentApplication).filter(
        StudentEnrollmentApplication.id == application_id
    ).first()
    
    if not application:
        raise ValueError("Application not found")
    
    application.application_status = update.application_status
    application.reviewed_by = admin_email
    application.reviewed_at = datetime.utcnow()
    application.admin_remarks = update.admin_remarks
    application.rejection_reason = update.rejection_reason
    
    db.commit()
    db.refresh(application)
    return application

def delete_application(db: Session, application_id: int):
    """Delete an application (admin only)"""
    application = db.query(StudentEnrollmentApplication).filter(
        StudentEnrollmentApplication.id == application_id
    ).first()
    
    if not application:
        raise ValueError("Application not found")
    
    db.delete(application)
    db.commit()
    return True

def get_eligible_exam_events_for_student(db: Session, student_semester: int, student_department: str):
    """Get exam events that match student's semester and department"""
    return db.query(ExamEvent).filter(
        ExamEvent.semester == student_semester,
        ExamEvent.department == student_department
    ).order_by(ExamEvent.start_date.desc()).all()
