from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db
from app.schemas.enrollment_application import (
    EnrollmentApplicationCreate,
    EnrollmentApplicationUpdate,
    EnrollmentApplicationResponse,
    ExamEventNotification
)
from app.crud import crud_enrollment_application
from app.models.student import Student
from app.models.exam import ExamEvent
from datetime import datetime
import json

router = APIRouter()

@router.get("/student/{student_id}/notifications")
def get_student_exam_notifications(student_id: int, db: Session = Depends(get_db)):
    """
    Get exam event notifications for a specific student
    Only shows events matching student's semester and department
    """
    try:
        # Get student details
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        print(f"Student found: {student.first_name}, Sem: {student.current_semester}, Dept: {student.department}")
        
        # Get eligible exam events
        exam_events = crud_enrollment_application.get_eligible_exam_events_for_student(
            db, student.current_semester, student.department
        )
        
        print(f"Found {len(exam_events)} exam events")
        
        # Check if student has already applied for each event
        notifications = []
        for event in exam_events:
            print(f"Processing event {event.id}: {event.name}")
            try:
                application = crud_enrollment_application.get_student_application(db, event.id, student_id)
                
                # Safely get enum values
                exam_type_value = event.exam_type.value if hasattr(event.exam_type, 'value') else str(event.exam_type)
                status_value = event.status.value if hasattr(event.status, 'value') else str(event.status)
                app_status_value = application.application_status.value if (application and hasattr(application.application_status, 'value')) else None
                
                notifications.append({
                    "id": event.id,
                    "name": event.name or "",
                    "description": event.description or "",
                    "exam_type": exam_type_value,
                    "status": status_value,
                    "department": event.department,
                    "semester": event.semester,
                    "academic_year": event.academic_year,
                    "start_date": event.start_date.isoformat() if event.start_date else "",
                    "end_date": event.end_date.isoformat() if event.end_date else "",
                    "instructions": event.instructions or "",
                    "has_applied": application is not None,
                    "application_status": app_status_value
                })
            except Exception as e:
                print(f"Error processing event {event.id}: {e}")
                continue
        
        return notifications
    except Exception as e:
        print(f"Error in get_student_exam_notifications: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/apply", response_model=EnrollmentApplicationResponse)
def submit_enrollment_application(
    application: EnrollmentApplicationCreate,
    student_id: int,
    db: Session = Depends(get_db)
):
    """
    Submit an enrollment application for an exam event
    """
    try:
        db_application = crud_enrollment_application.create_application(db, student_id, application)
        return db_application
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/exam-event/{exam_event_id}/applications", response_model=List[EnrollmentApplicationResponse])
def get_exam_event_applications(
    exam_event_id: int,
    status: str = None,
    db: Session = Depends(get_db)
):
    """
    Get all applications for an exam event (admin only)
    Optionally filter by status: pending, approved, rejected
    """
    applications = crud_enrollment_application.get_applications_by_exam_event(
        db, exam_event_id, status
    )
    return applications

@router.put("/application/{application_id}/review", response_model=EnrollmentApplicationResponse)
def review_application(
    application_id: int,
    update: EnrollmentApplicationUpdate,
    admin_email: str,
    db: Session = Depends(get_db)
):
    """
    Approve or reject an enrollment application (admin only)
    """
    try:
        application = crud_enrollment_application.update_application_status(
            db, application_id, update, admin_email
        )
        return application
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/application/{application_id}")
def delete_enrollment_application(application_id: int, db: Session = Depends(get_db)):
    """
    Delete an enrollment application (admin only)
    """
    try:
        crud_enrollment_application.delete_application(db, application_id)
        return {"message": "Application deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/student/{student_id}/application/{exam_event_id}", response_model=EnrollmentApplicationResponse)
def get_student_application_status(
    student_id: int,
    exam_event_id: int,
    db: Session = Depends(get_db)
):
    """
    Get student's application status for a specific exam event
    """
    application = crud_enrollment_application.get_student_application(db, exam_event_id, student_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application
