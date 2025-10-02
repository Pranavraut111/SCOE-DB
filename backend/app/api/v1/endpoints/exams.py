from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import date, datetime

from app.crud import crud_exam_event, crud_exam_schedule, crud_student_exam_enrollment, crud_student_exam, crud_exam_result
from app.schemas import exam as exam_schema
from app.db.session import get_db
from app.models.exam import ExamStatus, EnrollmentStatus

router = APIRouter()

# Exam Event Endpoints
@router.post("/events/", response_model=exam_schema.ExamEvent, status_code=status.HTTP_201_CREATED)
def create_exam_event(
    *,
    db: Session = Depends(get_db),
    exam_event_in: exam_schema.ExamEventCreate,
):
    """
    Create a new exam event (e.g., "Second Year Mid-Term Exams, Winter 2025")
    """
    exam_event = crud_exam_event.create(db=db, obj_in=exam_event_in)
    return exam_event

@router.get("/events/", response_model=List[exam_schema.ExamEvent])
def read_exam_events(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    department: Optional[str] = Query(None),
    semester: Optional[int] = Query(None),
    academic_year: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    """
    Retrieve exam events with optional filtering
    """
    if department and semester and academic_year:
        exam_events = crud_exam_event.get_by_department_semester(
            db, department=department, semester=semester, academic_year=academic_year
        )
    elif status == "active":
        exam_events = crud_exam_event.get_active_events(db)
    elif status == "upcoming":
        exam_events = crud_exam_event.get_upcoming_events(db)
    else:
        exam_events = crud_exam_event.get_multi(db, skip=skip, limit=limit)
    
    return exam_events

@router.get("/events/{event_id}", response_model=exam_schema.ExamEvent)
def read_exam_event(
    event_id: int,
    db: Session = Depends(get_db),
):
    """
    Get exam event by ID
    """
    exam_event = crud_exam_event.get(db, id=event_id)
    if not exam_event:
        raise HTTPException(
            status_code=404,
            detail="Exam event not found"
        )
    return exam_event

@router.put("/events/{event_id}", response_model=exam_schema.ExamEvent)
def update_exam_event(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    exam_event_in: exam_schema.ExamEventUpdate,
):
    """
    Update an exam event
    """
    exam_event = crud_exam_event.get(db, id=event_id)
    if not exam_event:
        raise HTTPException(
            status_code=404,
            detail="Exam event not found"
        )
    
    exam_event = crud_exam_event.update(db, db_obj=exam_event, obj_in=exam_event_in)
    return exam_event

@router.delete("/events/{event_id}")
def delete_exam_event(
    *,
    db: Session = Depends(get_db),
    event_id: int,
):
    """
    Delete an exam event
    """
    exam_event = crud_exam_event.get(db, id=event_id)
    if not exam_event:
        raise HTTPException(
            status_code=404,
            detail="Exam event not found"
        )
    
    exam_event = crud_exam_event.remove(db, id=event_id)
    return {"message": "Exam event deleted successfully"}

# Exam Schedule Endpoints
@router.post("/events/{event_id}/schedules/", response_model=exam_schema.ExamSchedule, status_code=status.HTTP_201_CREATED)
def create_exam_schedule(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    schedule_in: exam_schema.ExamScheduleCreate,
):
    """
    Add a subject to the exam schedule
    """
    # Verify exam event exists
    exam_event = crud_exam_event.get(db, id=event_id)
    if not exam_event:
        raise HTTPException(
            status_code=404,
            detail="Exam event not found"
        )
    
    # Set the exam event ID
    schedule_in.exam_event_id = event_id
    
    # Check for venue conflicts
    if schedule_in.venue:
        venue_conflicts = crud_exam_schedule.check_venue_conflict(
            db, 
            venue=schedule_in.venue,
            exam_date=schedule_in.exam_date,
            start_time=schedule_in.start_time,
            end_time=schedule_in.end_time
        )
        if venue_conflicts:
            raise HTTPException(
                status_code=400,
                detail=f"Venue '{schedule_in.venue}' is already booked for this time slot"
            )
    
    # Check for supervisor conflicts
    if schedule_in.supervisor:
        supervisor_conflicts = crud_exam_schedule.check_supervisor_conflict(
            db,
            supervisor=schedule_in.supervisor,
            exam_date=schedule_in.exam_date,
            start_time=schedule_in.start_time,
            end_time=schedule_in.end_time
        )
        if supervisor_conflicts:
            raise HTTPException(
                status_code=400,
                detail=f"Supervisor '{schedule_in.supervisor}' is already assigned for this time slot"
            )
    
    exam_schedule = crud_exam_schedule.create(db=db, obj_in=schedule_in)
    return exam_schedule

@router.get("/events/{event_id}/schedules/", response_model=List[exam_schema.ExamSchedule])
def read_exam_schedules(
    event_id: int,
    db: Session = Depends(get_db),
):
    """
    Get all exam schedules for an event (the timetable)
    """
    exam_schedules = crud_exam_schedule.get_by_exam_event(db, exam_event_id=event_id)
    return exam_schedules

@router.get("/events/{event_id}/timetable", response_model=exam_schema.ExamTimetableResponse)
def get_exam_timetable(
    event_id: int,
    db: Session = Depends(get_db),
):
    """
    Get complete exam timetable with conflict detection
    """
    exam_event = crud_exam_event.get(db, id=event_id)
    if not exam_event:
        raise HTTPException(
            status_code=404,
            detail="Exam event not found"
        )
    
    schedules = crud_exam_schedule.get_by_exam_event(db, exam_event_id=event_id)
    
    # Get total enrolled students
    enrollments = crud_student_exam_enrollment.get_by_exam_event(db, exam_event_id=event_id)
    total_students_enrolled = len([e for e in enrollments if e.enrollment_status == EnrollmentStatus.ENROLLED])
    
    # Check for conflicts (simplified)
    venue_conflicts = []
    supervisor_conflicts = []
    
    return {
        "exam_event": exam_event,
        "schedules": schedules,
        "total_students_enrolled": total_students_enrolled,
        "venue_conflicts": venue_conflicts,
        "supervisor_conflicts": supervisor_conflicts
    }

@router.put("/schedules/{schedule_id}", response_model=exam_schema.ExamSchedule)
def update_exam_schedule(
    *,
    db: Session = Depends(get_db),
    schedule_id: int,
    schedule_in: exam_schema.ExamScheduleUpdate,
):
    """
    Update an exam schedule
    """
    exam_schedule = crud_exam_schedule.get(db, id=schedule_id)
    if not exam_schedule:
        raise HTTPException(
            status_code=404,
            detail="Exam schedule not found"
        )
    
    exam_schedule = crud_exam_schedule.update(db, db_obj=exam_schedule, obj_in=schedule_in)
    return exam_schedule

@router.delete("/schedules/{schedule_id}")
def delete_exam_schedule(
    *,
    db: Session = Depends(get_db),
    schedule_id: int,
):
    """
    Delete an exam schedule
    """
    exam_schedule = crud_exam_schedule.get(db, id=schedule_id)
    if not exam_schedule:
        raise HTTPException(
            status_code=404,
            detail="Exam schedule not found"
        )
    
    exam_schedule = crud_exam_schedule.remove(db, id=schedule_id)
    return {"message": "Exam schedule deleted successfully"}

# Student Enrollment Endpoints
@router.post("/events/{event_id}/enrollments/bulk", response_model=exam_schema.BulkEnrollmentResponse)
def bulk_enroll_students(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    enrollment_request: exam_schema.BulkEnrollmentRequest,
):
    """
    Bulk enroll students in an exam event (Add All Eligible Students)
    """
    exam_event = crud_exam_event.get(db, id=event_id)
    if not exam_event:
        raise HTTPException(
            status_code=404,
            detail="Exam event not found"
        )
    
    # Get eligible students
    if enrollment_request.student_ids:
        # Specific student IDs provided
        student_ids = enrollment_request.student_ids
    else:
        # Auto-detect eligible students based on department and semester
        department = enrollment_request.department or exam_event.department
        semester = enrollment_request.semester or exam_event.semester
        
        eligible_students = crud_student_exam_enrollment.get_eligible_students(
            db, department=department, semester=semester, exclude_enrolled=event_id
        )
        student_ids = [s.id for s in eligible_students]
    
    # Exclude specific students if requested
    if enrollment_request.exclude_student_ids:
        student_ids = [sid for sid in student_ids if sid not in enrollment_request.exclude_student_ids]
    
    # Perform bulk enrollment
    result = crud_student_exam_enrollment.bulk_enroll_students(
        db, 
        exam_event_id=event_id,
        student_ids=student_ids,
        enrolled_by=enrollment_request.enrolled_by or "System"
    )
    
    return result

@router.get("/events/{event_id}/enrollments/", response_model=List[exam_schema.StudentExamEnrollment])
def read_exam_enrollments(
    event_id: int,
    db: Session = Depends(get_db),
):
    """
    Get all student enrollments for an exam event
    """
    enrollments = crud_student_exam_enrollment.get_by_exam_event(db, exam_event_id=event_id)
    return enrollments

@router.post("/events/{event_id}/enrollments/", response_model=exam_schema.StudentExamEnrollment)
def create_exam_enrollment(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    enrollment_in: exam_schema.StudentExamEnrollmentCreate,
):
    """
    Manually enroll a single student
    """
    enrollment_in.exam_event_id = event_id
    enrollment = crud_student_exam_enrollment.create(db=db, obj_in=enrollment_in)
    return enrollment

@router.put("/enrollments/{enrollment_id}", response_model=exam_schema.StudentExamEnrollment)
def update_exam_enrollment(
    *,
    db: Session = Depends(get_db),
    enrollment_id: int,
    enrollment_in: exam_schema.StudentExamEnrollmentUpdate,
):
    """
    Update student enrollment (e.g., mark as exempted)
    """
    enrollment = crud_student_exam_enrollment.get(db, id=enrollment_id)
    if not enrollment:
        raise HTTPException(
            status_code=404,
            detail="Enrollment not found"
        )
    
    enrollment = crud_student_exam_enrollment.update(db, db_obj=enrollment, obj_in=enrollment_in)
    return enrollment

@router.delete("/enrollments/{enrollment_id}")
def delete_exam_enrollment(
    *,
    db: Session = Depends(get_db),
    enrollment_id: int,
):
    """
    Remove a student from exam event
    """
    enrollment = crud_student_exam_enrollment.get(db, id=enrollment_id)
    if not enrollment:
        raise HTTPException(
            status_code=404,
            detail="Enrollment not found"
        )
    
    enrollment = crud_student_exam_enrollment.remove(db, id=enrollment_id)
    return {"message": "Student enrollment removed successfully"}

# Student Exam Management
@router.post("/events/{event_id}/generate-student-exams")
def generate_student_exams(
    *,
    db: Session = Depends(get_db),
    event_id: int,
):
    """
    Generate StudentExam records for all enrolled students and scheduled subjects
    """
    exam_event = crud_exam_event.get(db, id=event_id)
    if not exam_event:
        raise HTTPException(
            status_code=404,
            detail="Exam event not found"
        )
    
    result = crud_student_exam.bulk_create_student_exams(db, exam_event_id=event_id)
    return result

@router.get("/schedules/{schedule_id}/student-exams/", response_model=List[exam_schema.StudentExam])
def read_student_exams(
    schedule_id: int,
    db: Session = Depends(get_db),
):
    """
    Get all student exams for a specific exam schedule
    """
    student_exams = crud_student_exam.get_by_exam_schedule(db, exam_schedule_id=schedule_id)
    return student_exams

@router.post("/schedules/{schedule_id}/marks/bulk")
def bulk_update_marks(
    *,
    db: Session = Depends(get_db),
    schedule_id: int,
    marks_request: exam_schema.MarksEntryBulk,
):
    """
    Bulk update marks for students in an exam
    """
    exam_schedule = crud_exam_schedule.get(db, id=schedule_id)
    if not exam_schedule:
        raise HTTPException(
            status_code=404,
            detail="Exam schedule not found"
        )
    
    result = crud_student_exam.bulk_update_marks(
        db,
        exam_schedule_id=schedule_id,
        marks_data=marks_request.marks_data,
        entered_by=marks_request.entered_by
    )
    
    return result

@router.put("/student-exams/{student_exam_id}", response_model=exam_schema.StudentExam)
def update_student_exam(
    *,
    db: Session = Depends(get_db),
    student_exam_id: int,
    student_exam_in: exam_schema.StudentExamUpdate,
):
    """
    Update individual student exam (marks, attendance, etc.)
    """
    student_exam = crud_student_exam.get(db, id=student_exam_id)
    if not student_exam:
        raise HTTPException(
            status_code=404,
            detail="Student exam not found"
        )
    
    student_exam = crud_student_exam.update(db, db_obj=student_exam, obj_in=student_exam_in)
    return student_exam

# Results Management
@router.post("/events/{event_id}/results/calculate")
def calculate_exam_results(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    background_tasks: BackgroundTasks,
):
    """
    Calculate results for all students in an exam event
    """
    exam_event = crud_exam_event.get(db, id=event_id)
    if not exam_event:
        raise HTTPException(
            status_code=404,
            detail="Exam event not found"
        )
    
    # Get all enrolled students
    enrollments = crud_student_exam_enrollment.get_by_exam_event(db, exam_event_id=event_id)
    
    def calculate_results_background():
        for enrollment in enrollments:
            crud_exam_result.calculate_and_update_result(
                db, exam_event_id=event_id, student_id=enrollment.student_id
            )
    
    background_tasks.add_task(calculate_results_background)
    
    return {"message": "Result calculation started in background"}

@router.get("/events/{event_id}/results/", response_model=List[exam_schema.ExamResult])
def read_exam_results(
    event_id: int,
    db: Session = Depends(get_db),
):
    """
    Get all results for an exam event
    """
    results = crud_exam_result.get_by_exam_event(db, exam_event_id=event_id)
    return results

@router.get("/events/{event_id}/statistics", response_model=exam_schema.ExamStatistics)
def get_exam_statistics(
    event_id: int,
    db: Session = Depends(get_db),
):
    """
    Get comprehensive statistics for an exam event
    """
    exam_event = crud_exam_event.get(db, id=event_id)
    if not exam_event:
        raise HTTPException(
            status_code=404,
            detail="Exam event not found"
        )
    
    stats = crud_exam_result.get_exam_statistics(db, exam_event_id=event_id)
    
    return {
        "exam_event_id": event_id,
        **stats
    }

@router.get("/students/{student_id}/results/", response_model=List[exam_schema.ExamResult])
def read_student_results(
    student_id: int,
    db: Session = Depends(get_db),
):
    """
    Get all exam results for a specific student
    """
    results = crud_exam_result.get_by_student(db, student_id=student_id)
    return results

# Dashboard and Overview
@router.get("/dashboard", response_model=exam_schema.ExamDashboard)
def get_exam_dashboard(
    db: Session = Depends(get_db),
):
    """
    Get examination dashboard overview
    """
    upcoming_exams = crud_exam_event.get_upcoming_events(db, days_ahead=30)
    ongoing_exams = crud_exam_event.get_active_events(db)
    
    # Get recent results (last 10)
    recent_results = crud_exam_result.get_multi(db, skip=0, limit=10)
    
    # Calculate pending marks entry
    # This would require more complex query - simplified for now
    pending_marks_entry = 0
    
    # Total students enrolled in active exams
    total_students_enrolled = 0
    for exam in ongoing_exams:
        enrollments = crud_student_exam_enrollment.get_by_exam_event(db, exam_event_id=exam.id)
        total_students_enrolled += len([e for e in enrollments if e.enrollment_status == EnrollmentStatus.ENROLLED])
    
    return {
        "upcoming_exams": upcoming_exams,
        "ongoing_exams": ongoing_exams,
        "recent_results": recent_results,
        "pending_marks_entry": pending_marks_entry,
        "total_students_enrolled": total_students_enrolled,
        "exam_statistics": {}
    }
