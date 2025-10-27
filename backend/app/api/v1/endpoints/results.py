"""
API endpoints for component-based result generation system
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api import deps
from app.models.exam import StudentExamComponentMarks, SubjectFinalResult, SemesterResult
from app.models.subject import Subject, SubjectComponent, ComponentType
from app.models.student import Student
from app.schemas.results import *
from app.services.result_calculator import result_calculator
from typing import List
from datetime import datetime

router = APIRouter()


# ============= Component Marks Entry =============

@router.post("/marks/component/bulk")
def bulk_create_component_marks(
    *,
    db: Session = Depends(deps.get_db),
    bulk_in: BulkComponentMarksCreate
):
    """
    Bulk enter component marks for multiple students
    Use this after IA1, IA2, Oral, or ESE exam
    
    Example:
    {
        "subject_id": 5,
        "subject_component_id": 12,
        "exam_event_id": 1,
        "marks_entries": [
            {"student_id": 10, "marks_obtained": 20, "is_absent": false},
            {"student_id": 11, "marks_obtained": 22, "is_absent": false}
        ],
        "marks_entered_by": "admin"
    }
    """
    created_count = 0
    updated_count = 0
    
    # Get component details for max_marks
    component = db.query(SubjectComponent).filter(
        SubjectComponent.id == bulk_in.subject_component_id
    ).first()
    
    if not component:
        raise HTTPException(status_code=404, detail="Subject component not found")
    
    for entry in bulk_in.marks_entries:
        # Check if already exists
        existing = db.query(StudentExamComponentMarks).filter(
            StudentExamComponentMarks.student_id == entry.student_id,
            StudentExamComponentMarks.subject_component_id == bulk_in.subject_component_id,
            StudentExamComponentMarks.exam_event_id == bulk_in.exam_event_id
        ).first()
        
        if existing:
            # Update existing
            existing.marks_obtained = entry.marks_obtained
            existing.is_absent = entry.is_absent
            existing.marks_entered_by = bulk_in.marks_entered_by
            existing.marks_entered_at = datetime.utcnow()
            if entry.remarks:
                existing.remarks = entry.remarks
            db.add(existing)
            updated_count += 1
        else:
            # Create new
            mark = StudentExamComponentMarks(
                student_id=entry.student_id,
                subject_id=bulk_in.subject_id,
                subject_component_id=bulk_in.subject_component_id,
                exam_event_id=bulk_in.exam_event_id,
                marks_obtained=entry.marks_obtained,
                max_marks=component.out_of_marks,
                is_absent=entry.is_absent,
                marks_entered_by=bulk_in.marks_entered_by,
                remarks=entry.remarks
            )
            db.add(mark)
            created_count += 1
    
    db.commit()
    
    return {
        "message": "Component marks saved successfully",
        "created": created_count,
        "updated": updated_count,
        "total": len(bulk_in.marks_entries)
    }


@router.get("/marks/component/student/{student_id}/subject/{subject_id}")
def get_student_component_marks(
    student_id: int,
    subject_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Get all component marks for a student's subject
    Shows IA1, IA2, Oral, ESE marks separately
    """
    marks = db.query(StudentExamComponentMarks).filter(
        StudentExamComponentMarks.student_id == student_id,
        StudentExamComponentMarks.subject_id == subject_id
    ).all()
    
    if not marks:
        raise HTTPException(status_code=404, detail="No marks found for this student-subject combination")
    
    # Group by component type
    result = []
    for mark in marks:
        component = db.query(SubjectComponent).filter(SubjectComponent.id == mark.subject_component_id).first()
        result.append({
            "id": mark.id,
            "component_type": component.component_type.value if component else "Unknown",
            "component_name": component.resolution if component else "Unknown",
            "marks_obtained": mark.marks_obtained,
            "max_marks": mark.max_marks,
            "percentage": round((mark.marks_obtained / mark.max_marks * 100), 2) if mark.max_marks > 0 else 0,
            "is_absent": mark.is_absent,
            "exam_event_id": mark.exam_event_id,
            "marks_entered_at": mark.marks_entered_at
        })
    
    return {
        "student_id": student_id,
        "subject_id": subject_id,
        "component_marks": result,
        "total_components": len(result)
    }


@router.get("/marks/component/all")
def get_all_component_marks(
    department: str = Query(None),
    semester: int = Query(None),
    db: Session = Depends(deps.get_db)
):
    """
    Get all component marks, optionally filtered by department and semester
    """
    query = db.query(StudentExamComponentMarks)
    
    # Join with Student to filter by department and semester
    if department or semester:
        query = query.join(Student, StudentExamComponentMarks.student_id == Student.id)
        
        if department:
            query = query.filter(Student.department == department)
        if semester:
            query = query.filter(Student.current_semester == semester)
    
    marks = query.all()
    
    return [
        {
            "id": mark.id,
            "student_id": mark.student_id,
            "subject_id": mark.subject_id,
            "subject_component_id": mark.subject_component_id,
            "exam_event_id": mark.exam_event_id,
            "marks_obtained": mark.marks_obtained,
            "max_marks": mark.max_marks
        }
        for mark in marks
    ]


# ============= Subject Result Calculation =============

@router.post("/subject/calculate")
def calculate_subject_result(
    student_id: int = Query(...),
    subject_id: int = Query(...),
    academic_year: str = Query(...),
    semester: int = Query(...),
    db: Session = Depends(deps.get_db)
):
    """
    Calculate final result for a subject
    Aggregates all component marks (IA1, IA2, Oral, ESE)
    
    Example: /results/subject/calculate?student_id=10&subject_id=5&academic_year=2024-25&semester=1
    """
    # Get all component marks for this student-subject
    component_marks = db.query(StudentExamComponentMarks).filter(
        StudentExamComponentMarks.student_id == student_id,
        StudentExamComponentMarks.subject_id == subject_id
    ).all()
    
    if not component_marks:
        raise HTTPException(status_code=404, detail="No component marks found for this subject")
    
    # Get subject details
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Aggregate marks by component type
    ia_marks = sum(m.marks_obtained for m in component_marks 
                   if m.subject_component and m.subject_component.component_type == ComponentType.IA)
    ese_marks = sum(m.marks_obtained for m in component_marks 
                    if m.subject_component and m.subject_component.component_type == ComponentType.ESE)
    oral_marks = sum(m.marks_obtained for m in component_marks 
                     if m.subject_component and m.subject_component.component_type == ComponentType.OR)
    practical_marks = sum(m.marks_obtained for m in component_marks 
                          if m.subject_component and m.subject_component.component_type == ComponentType.PR)
    tw_marks = sum(m.marks_obtained for m in component_marks 
                   if m.subject_component and m.subject_component.component_type == ComponentType.TW)
    
    total_marks = ia_marks + ese_marks + oral_marks + practical_marks + tw_marks
    max_marks = sum(m.max_marks for m in component_marks)
    percentage = round((total_marks / max_marks * 100), 2) if max_marks > 0 else 0
    
    # Calculate grade
    grade, grade_points = result_calculator.calculate_grade(percentage)
    
    # Determine if passed
    is_pass = percentage >= 40
    credits_earned = subject.credits if is_pass else 0
    
    # Create or update subject final result
    result = db.query(SubjectFinalResult).filter(
        SubjectFinalResult.student_id == student_id,
        SubjectFinalResult.subject_id == subject_id,
        SubjectFinalResult.academic_year == academic_year,
        SubjectFinalResult.attempt_number == 1
    ).first()
    
    if not result:
        result = SubjectFinalResult(
            student_id=student_id,
            subject_id=subject_id,
            academic_year=academic_year,
            semester=semester,
            total_max_marks=max_marks
        )
    
    result.ia_marks = ia_marks
    result.ese_marks = ese_marks
    result.oral_marks = oral_marks
    result.practical_marks = practical_marks
    result.tw_marks = tw_marks
    result.total_marks_obtained = total_marks
    result.percentage = percentage
    result.grade = grade
    result.grade_points = grade_points
    result.is_pass = is_pass
    result.credits_earned = credits_earned
    result.calculated_at = datetime.utcnow()
    
    db.add(result)
    db.commit()
    db.refresh(result)
    
    return {
        "message": "Subject result calculated successfully",
        "result": {
            "subject_id": subject_id,
            "subject_name": subject.subject_name,
            "ia_marks": ia_marks,
            "ese_marks": ese_marks,
            "oral_marks": oral_marks,
            "total_marks": total_marks,
            "max_marks": max_marks,
            "percentage": percentage,
            "grade": grade,
            "grade_points": grade_points,
            "is_pass": is_pass,
            "credits_earned": credits_earned
        }
    }


# ============= Semester Result Calculation =============

@router.post("/semester/calculate")
def calculate_semester_result(
    student_id: int = Query(...),
    semester: int = Query(...),
    academic_year: str = Query(...),
    db: Session = Depends(deps.get_db)
):
    """
    Calculate overall semester result with SGPA/CGPA
    
    Example: /results/semester/calculate?student_id=10&semester=1&academic_year=2024-25
    """
    # Get all subject results for this semester
    subject_results = db.query(SubjectFinalResult).filter(
        SubjectFinalResult.student_id == student_id,
        SubjectFinalResult.semester == semester,
        SubjectFinalResult.academic_year == academic_year
    ).all()
    
    if not subject_results:
        raise HTTPException(status_code=404, detail="No subject results found. Please calculate subject results first.")
    
    # Get student details
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Calculate totals
    total_subjects = len(subject_results)
    subjects_passed = sum(1 for r in subject_results if r.is_pass)
    subjects_failed = total_subjects - subjects_passed
    
    # Calculate SGPA
    total_credits_attempted = sum(
        db.query(Subject).filter(Subject.id == r.subject_id).first().credits 
        for r in subject_results
    )
    total_credits_earned = sum(r.credits_earned for r in subject_results)
    total_credit_points = sum(r.credits_earned * r.grade_points for r in subject_results)
    
    sgpa = round(total_credit_points / total_credits_attempted, 2) if total_credits_attempted > 0 else 0.0
    
    # For CGPA, we need all previous semesters (for now, same as SGPA)
    cgpa = sgpa
    
    # Calculate overall percentage
    total_marks_obtained = sum(r.total_marks_obtained for r in subject_results)
    total_max_marks = sum(r.total_max_marks for r in subject_results)
    overall_percentage = round((total_marks_obtained / total_max_marks * 100), 2) if total_max_marks > 0 else 0
    
    # Determine result status and class
    result_status = "PASS" if subjects_failed == 0 else "FAIL"
    result_class = result_calculator.determine_result_class(cgpa)
    
    # Create or update semester result
    sem_result = db.query(SemesterResult).filter(
        SemesterResult.student_id == student_id,
        SemesterResult.semester == semester,
        SemesterResult.academic_year == academic_year
    ).first()
    
    if not sem_result:
        sem_result = SemesterResult(
            student_id=student_id,
            semester=semester,
            academic_year=academic_year
        )
    
    sem_result.total_subjects = total_subjects
    sem_result.subjects_passed = subjects_passed
    sem_result.subjects_failed = subjects_failed
    sem_result.total_credits_attempted = total_credits_attempted
    sem_result.total_credits_earned = total_credits_earned
    sem_result.total_credit_points = total_credit_points
    sem_result.sgpa = sgpa
    sem_result.cgpa = cgpa
    sem_result.overall_percentage = overall_percentage
    sem_result.total_marks_obtained = total_marks_obtained
    sem_result.total_max_marks = total_max_marks
    sem_result.result_status = result_status
    sem_result.result_class = result_class
    sem_result.has_backlogs = subjects_failed > 0
    
    db.add(sem_result)
    db.commit()
    db.refresh(sem_result)
    
    return {
        "message": "Semester result calculated successfully",
        "result": {
            "student_name": f"{student.first_name} {student.last_name}",
            "roll_number": student.roll_number,
            "semester": semester,
            "academic_year": academic_year,
            "total_subjects": total_subjects,
            "subjects_passed": subjects_passed,
            "subjects_failed": subjects_failed,
            "total_credits_attempted": total_credits_attempted,
            "total_credits_earned": total_credits_earned,
            "sgpa": sgpa,
            "cgpa": cgpa,
            "overall_percentage": overall_percentage,
            "result_status": result_status,
            "result_class": result_class
        }
    }


# ============= View Results =============

@router.get("/semester/{student_id}/{semester}")
def get_semester_result(
    student_id: int,
    semester: int,
    academic_year: str = Query(...),
    db: Session = Depends(deps.get_db)
):
    """
    Get semester result for a student
    """
    result = db.query(SemesterResult).filter(
        SemesterResult.student_id == student_id,
        SemesterResult.semester == semester,
        SemesterResult.academic_year == academic_year
    ).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Semester result not found")
    
    return result


@router.get("/subject/{student_id}/{subject_id}")
def get_subject_result(
    student_id: int,
    subject_id: int,
    academic_year: str = Query(...),
    db: Session = Depends(deps.get_db)
):
    """
    Get subject result for a student
    """
    result = db.query(SubjectFinalResult).filter(
        SubjectFinalResult.student_id == student_id,
        SubjectFinalResult.subject_id == subject_id,
        SubjectFinalResult.academic_year == academic_year
    ).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Subject result not found")
    
    return result


@router.get("/subject/student/{student_id}")
def get_student_all_subject_results(
    student_id: int,
    academic_year: str = Query(...),
    semester: int = Query(...),
    db: Session = Depends(deps.get_db)
):
    """
    Get all subject results for a student in a semester
    """
    results = db.query(SubjectFinalResult).filter(
        SubjectFinalResult.student_id == student_id,
        SubjectFinalResult.academic_year == academic_year,
        SubjectFinalResult.semester == semester
    ).all()
    
    # Enrich with subject details
    enriched_results = []
    for result in results:
        subject = db.query(Subject).filter(Subject.id == result.subject_id).first()
        if subject:
            enriched_results.append({
                "subject_code": subject.subject_code,
                "subject_name": subject.subject_name,
                "credits": subject.credits,
                "ia_marks": result.ia_marks or 0,
                "oral_marks": result.oral_marks or 0,
                "ese_marks": result.ese_marks or 0,
                "practical_marks": result.practical_marks or 0,
                "tw_marks": result.tw_marks or 0,
                "total_marks": result.total_marks_obtained,
                "max_marks": result.total_max_marks,
                "grade": result.grade,
                "grade_points": result.grade_points,
                "is_pass": result.is_pass
            })
    
    return enriched_results


@router.get("/semester/all")
def get_all_semester_results(
    department: str = Query(...),
    semester: int = Query(...),
    academic_year: str = Query(...),
    db: Session = Depends(deps.get_db)
):
    """
    Get all semester results for a department and semester
    """
    # Get all students in this department and semester
    students = db.query(Student).filter(
        Student.department == department,
        Student.current_semester == semester
    ).all()
    
    results = []
    for student in students:
        sem_result = db.query(SemesterResult).filter(
            SemesterResult.student_id == student.id,
            SemesterResult.semester == semester,
            SemesterResult.academic_year == academic_year
        ).first()
        
        if sem_result:
            results.append({
                "student_id": student.id,
                "student_name": f"{student.first_name} {student.middle_name} {student.last_name}".strip(),
                "roll_number": student.roll_number,
                "semester": sem_result.semester,
                "academic_year": sem_result.academic_year,
                "total_subjects": sem_result.total_subjects,
                "subjects_passed": sem_result.subjects_passed,
                "subjects_failed": sem_result.subjects_failed,
                "total_credits_attempted": sem_result.total_credits_attempted,
                "total_credits_earned": sem_result.total_credits_earned,
                "sgpa": sem_result.sgpa,
                "cgpa": sem_result.cgpa,
                "overall_percentage": sem_result.overall_percentage,
                "result_status": sem_result.result_status,
                "result_class": sem_result.result_class,
                "has_backlogs": sem_result.has_backlogs
            })
    
    return results
