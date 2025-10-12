from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.models.student import Student, AcademicStatus
from app.models.student_progression import StudentProgressionHistory, ProgressionStatus
from app.schemas.student import StudentResponse
from app.schemas.student_progression import (
    StudentProgressionCreate, 
    StudentProgressionResponse,
    BulkPromotionRequest
)

router = APIRouter()

@router.get("/students/by-semester/{semester}", response_model=List[StudentResponse])
def get_students_by_semester(
    semester: int,
    department: Optional[str] = Query(None),
    academic_status: Optional[str] = Query("active"),
    db: Session = Depends(deps.get_db)
):
    """Get students by current semester for exam enrollment"""
    query = db.query(Student).filter(Student.current_semester == semester)
    
    if department:
        query = query.filter(Student.department == department)
    
    if academic_status:
        query = query.filter(Student.academic_status == academic_status)
    
    students = query.all()
    return students

@router.get("/students/eligible-for-exam")
def get_eligible_students_for_exam(
    exam_semester: int,
    department: str,
    include_backlogs: bool = Query(False),
    db: Session = Depends(deps.get_db)
):
    """Get students eligible for a specific exam"""
    # Students in current semester or backlogs from previous semesters
    if include_backlogs:
        # Include students from current semester and those with backlogs
        query = db.query(Student).filter(
            Student.department == department,
            Student.current_semester <= exam_semester,
            Student.academic_status.in_([AcademicStatus.ACTIVE, AcademicStatus.DETAINED])
        )
    else:
        # Only current semester students
        query = db.query(Student).filter(
            Student.department == department,
            Student.current_semester == exam_semester,
            Student.academic_status == AcademicStatus.ACTIVE
        )
    
    students = query.all()
    
    return {
        "eligible_students": students,
        "count": len(students),
        "exam_semester": exam_semester,
        "department": department,
        "includes_backlogs": include_backlogs
    }

@router.post("/students/promote-bulk")
def promote_students_bulk(
    promotion_data: BulkPromotionRequest,
    db: Session = Depends(deps.get_db)
):
    """Promote multiple students to next semester based on exam results"""
    promoted_count = 0
    detained_count = 0
    
    for student_promotion in promotion_data.students:
        student = db.query(Student).filter(Student.id == student_promotion.student_id).first()
        if not student:
            continue
            
        # Create progression history record
        progression = StudentProgressionHistory(
            student_id=student.id,
            from_semester=student.current_semester,
            to_semester=student_promotion.to_semester,
            academic_year=promotion_data.academic_year,
            promotion_date=promotion_data.promotion_date,
            exam_event_id=promotion_data.exam_event_id,
            status=student_promotion.status,
            remarks=student_promotion.remarks
        )
        db.add(progression)
        
        # Update student's current semester and status
        if student_promotion.status == ProgressionStatus.PROMOTED:
            student.current_semester = student_promotion.to_semester
            student.academic_status = AcademicStatus.ACTIVE
            promoted_count += 1
        elif student_promotion.status == ProgressionStatus.DETAINED:
            student.academic_status = AcademicStatus.DETAINED
            detained_count += 1
        
        db.add(student)
    
    db.commit()
    
    return {
        "message": "Bulk promotion completed",
        "promoted_count": promoted_count,
        "detained_count": detained_count,
        "total_processed": len(promotion_data.students)
    }

@router.get("/progression-history/{student_id}")
def get_student_progression_history(
    student_id: int,
    db: Session = Depends(deps.get_db)
):
    """Get progression history for a specific student"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    history = db.query(StudentProgressionHistory).filter(
        StudentProgressionHistory.student_id == student_id
    ).order_by(StudentProgressionHistory.promotion_date.desc()).all()
    
    return {
        "student": student,
        "progression_history": history,
        "current_semester": student.current_semester,
        "academic_status": student.academic_status
    }
