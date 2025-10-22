from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from datetime import date, datetime
import logging

from app.crud.base import CRUDBase
from app.models.exam import (
    ExamEvent, ExamSchedule, StudentExamEnrollment, 
    StudentExam, ExamResult, ExamStatus, EnrollmentStatus
)
from app.models.student import Student
from app.models.subject import Subject
from app.schemas.exam import (
    ExamEventCreate, ExamEventUpdate,
    ExamScheduleCreate, ExamScheduleUpdate,
    StudentExamEnrollmentCreate, StudentExamEnrollmentUpdate,
    StudentExamCreate, StudentExamUpdate,
    ExamResultCreate, ExamResultUpdate,
    BulkEnrollmentCreate, BulkMarksEntry
)

logger = logging.getLogger(__name__)

# Utility function to map student year to semesters
def get_semesters_for_year(year: str) -> List[int]:
    """Map student year to corresponding semesters"""
    year_to_semester_map = {
        "1st Year": [1, 2],
        "2nd Year": [3, 4], 
        "3rd Year": [5, 6],
        "4th Year": [7, 8]
    }
    return year_to_semester_map.get(year, [])

class CRUDExamEvent(CRUDBase[ExamEvent, ExamEventCreate, ExamEventUpdate]):
    def get_by_department_semester(
        self, db: Session, *, department: str, semester: int, academic_year: str
    ) -> List[ExamEvent]:
        return db.query(ExamEvent).filter(
            and_(
                ExamEvent.department == department,
                ExamEvent.semester == semester,
                ExamEvent.academic_year == academic_year
            )
        ).all()

    def get_active_events(self, db: Session) -> List[ExamEvent]:
        return db.query(ExamEvent).filter(
            ExamEvent.status.in_([ExamStatus.SCHEDULED, ExamStatus.ONGOING])
        ).order_by(ExamEvent.start_date).all()

    def get_upcoming_events(self, db: Session, days_ahead: int = 30) -> List[ExamEvent]:
        from datetime import timedelta
        future_date = date.today() + timedelta(days=days_ahead)
        return db.query(ExamEvent).filter(
            and_(
                ExamEvent.start_date >= date.today(),
                ExamEvent.start_date <= future_date,
                ExamEvent.status == ExamStatus.SCHEDULED
            )
        ).order_by(ExamEvent.start_date).all()

class CRUDExamSchedule(CRUDBase[ExamSchedule, ExamScheduleCreate, ExamScheduleUpdate]):
    def get_by_exam_event(self, db: Session, *, exam_event_id: int) -> List[ExamSchedule]:
        return db.query(ExamSchedule).filter(
            and_(
                ExamSchedule.exam_event_id == exam_event_id,
                ExamSchedule.is_active == True
            )
        ).order_by(ExamSchedule.exam_date, ExamSchedule.start_time).all()

    def get_by_date_range(
        self, db: Session, *, start_date: date, end_date: date
    ) -> List[ExamSchedule]:
        return db.query(ExamSchedule).filter(
            and_(
                ExamSchedule.exam_date >= start_date,
                ExamSchedule.exam_date <= end_date,
                ExamSchedule.is_active == True
            )
        ).order_by(ExamSchedule.exam_date, ExamSchedule.start_time).all()

    def check_venue_conflict(
        self, db: Session, *, venue: str, exam_date: date, start_time: str, end_time: str, exclude_id: Optional[int] = None
    ) -> List[ExamSchedule]:
        query = db.query(ExamSchedule).filter(
            and_(
                ExamSchedule.venue == venue,
                ExamSchedule.exam_date == exam_date,
                ExamSchedule.is_active == True,
                or_(
                    and_(ExamSchedule.start_time <= start_time, ExamSchedule.end_time > start_time),
                    and_(ExamSchedule.start_time < end_time, ExamSchedule.end_time >= end_time),
                    and_(ExamSchedule.start_time >= start_time, ExamSchedule.end_time <= end_time)
                )
            )
        )
        if exclude_id:
            query = query.filter(ExamSchedule.id != exclude_id)
        return query.all()

    def check_supervisor_conflict(
        self, db: Session, *, supervisor: str, exam_date: date, start_time: str, end_time: str, exclude_id: Optional[int] = None
    ) -> List[ExamSchedule]:
        query = db.query(ExamSchedule).filter(
            and_(
                ExamSchedule.supervisor == supervisor,
                ExamSchedule.exam_date == exam_date,
                ExamSchedule.is_active == True,
                or_(
                    and_(ExamSchedule.start_time <= start_time, ExamSchedule.end_time > start_time),
                    and_(ExamSchedule.start_time < end_time, ExamSchedule.end_time >= end_time),
                    and_(ExamSchedule.start_time >= start_time, ExamSchedule.end_time <= end_time)
                )
            )
        )
        if exclude_id:
            query = query.filter(ExamSchedule.id != exclude_id)
        return query.all()

class CRUDStudentExamEnrollment(CRUDBase[StudentExamEnrollment, StudentExamEnrollmentCreate, StudentExamEnrollmentUpdate]):
    def get_by_exam_event(self, db: Session, *, exam_event_id: int) -> List[StudentExamEnrollment]:
        return db.query(StudentExamEnrollment).filter(
            StudentExamEnrollment.exam_event_id == exam_event_id
        ).all()

    def get_by_student(self, db: Session, *, student_id: int) -> List[StudentExamEnrollment]:
        return db.query(StudentExamEnrollment).filter(
            StudentExamEnrollment.student_id == student_id
        ).order_by(desc(StudentExamEnrollment.enrollment_date)).all()

    def bulk_enroll_students(
        self, db: Session, *, exam_event_id: int, student_ids: List[int], enrolled_by: str
    ) -> Dict[str, Any]:
        enrolled_count = 0
        skipped_count = 0
        errors = []
        enrolled_students = []

        for student_id in student_ids:
            # Check if already enrolled
            existing = db.query(StudentExamEnrollment).filter(
                and_(
                    StudentExamEnrollment.exam_event_id == exam_event_id,
                    StudentExamEnrollment.student_id == student_id
                )
            ).first()

            if existing:
                skipped_count += 1
                continue

            try:
                enrollment = StudentExamEnrollment(
                    exam_event_id=exam_event_id,
                    student_id=student_id,
                    enrolled_by=enrolled_by,
                    enrollment_status=EnrollmentStatus.ENROLLED
                )
                db.add(enrollment)
                db.flush()

                # Get student details for response
                student = db.query(Student).filter(Student.id == student_id).first()
                if student:
                    enrolled_students.append({
                        "id": student.id,
                        "name": f"{student.first_name} {student.last_name}",
                        "roll_number": student.roll_number
                    })
                
                enrolled_count += 1

            except Exception as e:
                errors.append(f"Student ID {student_id}: {str(e)}")
                db.rollback()

        db.commit()

        return {
            "total_eligible": len(student_ids),
            "enrolled_count": enrolled_count,
            "skipped_count": skipped_count,
            "errors": errors,
            "enrolled_students": enrolled_students
        }

    def get_eligible_students(
        self, db: Session, *, department: str, semester: int, exclude_enrolled: Optional[int] = None
    ) -> List[Student]:
        # Map semester to corresponding year
        semester_to_year_map = {
            1: "1st Year", 2: "1st Year",
            3: "2nd Year", 4: "2nd Year", 
            5: "3rd Year", 6: "3rd Year",
            7: "4th Year", 8: "4th Year"
        }
        
        target_year = semester_to_year_map.get(semester)
        if not target_year:
            return []
            
        query = db.query(Student).filter(
            and_(
                Student.department == department,
                Student.state == target_year
            )
        )

        if exclude_enrolled:
            # Exclude students already enrolled in this exam event
            enrolled_student_ids = db.query(StudentExamEnrollment.student_id).filter(
                StudentExamEnrollment.exam_event_id == exclude_enrolled
            ).subquery()
            query = query.filter(~Student.id.in_(enrolled_student_ids))

        return query.all()

class CRUDStudentExam(CRUDBase[StudentExam, StudentExamCreate, StudentExamUpdate]):
    def get_by_exam_schedule(self, db: Session, *, exam_schedule_id: int) -> List[StudentExam]:
        return db.query(StudentExam).filter(
            StudentExam.exam_schedule_id == exam_schedule_id
        ).all()

    def get_by_student_and_event(self, db: Session, *, student_id: int, exam_event_id: int) -> List[StudentExam]:
        return db.query(StudentExam).join(ExamSchedule).filter(
            and_(
                StudentExam.student_id == student_id,
                ExamSchedule.exam_event_id == exam_event_id
            )
        ).all()

    def bulk_create_student_exams(
        self, db: Session, *, exam_event_id: int
    ) -> Dict[str, Any]:
        """Create StudentExam records for all enrolled students and scheduled subjects"""
        
        # Get all schedules for this exam event
        schedules = db.query(ExamSchedule).filter(
            and_(
                ExamSchedule.exam_event_id == exam_event_id,
                ExamSchedule.is_active == True
            )
        ).all()

        # Get all enrolled students
        enrollments = db.query(StudentExamEnrollment).filter(
            and_(
                StudentExamEnrollment.exam_event_id == exam_event_id,
                StudentExamEnrollment.enrollment_status == EnrollmentStatus.ENROLLED
            )
        ).all()

        created_count = 0
        skipped_count = 0
        errors = []

        for enrollment in enrollments:
            for schedule in schedules:
                # Check if StudentExam already exists
                existing = db.query(StudentExam).filter(
                    and_(
                        StudentExam.exam_schedule_id == schedule.id,
                        StudentExam.student_id == enrollment.student_id
                    )
                ).first()

                if existing:
                    skipped_count += 1
                    continue

                try:
                    student_exam = StudentExam(
                        exam_schedule_id=schedule.id,
                        student_id=enrollment.student_id,
                        attendance_status=EnrollmentStatus.ENROLLED
                    )
                    db.add(student_exam)
                    created_count += 1

                except Exception as e:
                    errors.append(f"Student {enrollment.student_id}, Schedule {schedule.id}: {str(e)}")

        db.commit()

        return {
            "created_count": created_count,
            "skipped_count": skipped_count,
            "errors": errors
        }

    def bulk_update_marks(
        self, db: Session, *, exam_schedule_id: int, marks_data: List[Dict[str, Any]], entered_by: str
    ) -> Dict[str, Any]:
        """Bulk update marks for students in an exam"""
        
        updated_count = 0
        errors = []
        
        logger.info(f"\n🔍 bulk_update_marks called:")
        logger.info(f"  Schedule ID: {exam_schedule_id}")
        logger.info(f"  Marks data: {marks_data}")
        logger.info(f"  Entered by: {entered_by}")

        for mark_entry in marks_data:
            try:
                student_id = mark_entry.get("student_id")
                theory_marks = mark_entry.get("theory_marks", 0)
                practical_marks = mark_entry.get("practical_marks", 0)
                
                logger.info(f"\n  Processing student {student_id}: theory={theory_marks}, practical={practical_marks}")
                
                student_exam = db.query(StudentExam).filter(
                    and_(
                        StudentExam.exam_schedule_id == exam_schedule_id,
                        StudentExam.student_id == student_id
                    )
                ).first()

                if not student_exam:
                    logger.info(f"    Creating new StudentExam record...")
                    # Create new StudentExam record if it doesn't exist
                    from app.models.exam import EnrollmentStatus
                    student_exam = StudentExam(
                        exam_schedule_id=exam_schedule_id,
                        student_id=student_id,
                        attendance_status=EnrollmentStatus.ENROLLED
                    )
                    db.add(student_exam)
                    db.flush()  # Ensure the record is created before updating it
                    logger.info(f"    ✅ Created StudentExam record with ID: {student_exam.id}")
                else:
                    logger.info(f"    Found existing StudentExam record with ID: {student_exam.id}")

                # Calculate total marks and grade
                total_marks = theory_marks + practical_marks
                exam_schedule = db.query(ExamSchedule).filter(ExamSchedule.id == exam_schedule_id).first()
                logger.info(f"    Total marks: {total_marks}, Schedule found: {exam_schedule is not None}")
                
                if exam_schedule:
                    percentage = (total_marks / exam_schedule.total_marks) * 100
                    is_pass = percentage >= 40  # Assuming 40% is passing
                    
                    # Simple grading system
                    if percentage >= 90:
                        grade = "A+"
                    elif percentage >= 80:
                        grade = "A"
                    elif percentage >= 70:
                        grade = "B+"
                    elif percentage >= 60:
                        grade = "B"
                    elif percentage >= 50:
                        grade = "C"
                    elif percentage >= 40:
                        grade = "D"
                    else:
                        grade = "F"

                    # Update the record
                    student_exam.theory_marks_obtained = theory_marks
                    student_exam.practical_marks_obtained = practical_marks
                    student_exam.total_marks_obtained = total_marks
                    student_exam.grade = grade
                    student_exam.is_pass = is_pass
                    student_exam.marks_entered_by = entered_by
                    student_exam.marks_entered_at = datetime.utcnow()
                    
                    logger.info(f"    ✅ Updated marks: theory={theory_marks}, grade={grade}")

                    updated_count += 1

            except Exception as e:
                error_msg = f"Error updating marks for student {mark_entry.get('student_id', 'unknown')}: {str(e)}"
                logger.error(f"    ❌ {error_msg}")
                import traceback
                traceback.print_exc()
                errors.append(error_msg)

        logger.info(f"\n  Committing {updated_count} updates...")
        db.commit()
        logger.info(f"  ✅ Committed successfully!")

        result = {
            "updated_count": updated_count,
            "errors": errors
        }
        logger.info(f"\n  Final result: {result}\n")
        return result

class CRUDExamResult(CRUDBase[ExamResult, ExamResultCreate, ExamResultUpdate]):
    def get_by_exam_event(self, db: Session, *, exam_event_id: int) -> List[ExamResult]:
        return db.query(ExamResult).filter(
            ExamResult.exam_event_id == exam_event_id
        ).all()

    def get_by_student(self, db: Session, *, student_id: int) -> List[ExamResult]:
        return db.query(ExamResult).filter(
            ExamResult.student_id == student_id
        ).order_by(desc(ExamResult.calculated_at)).all()

    def calculate_and_update_result(
        self, db: Session, *, exam_event_id: int, student_id: int
    ) -> Optional[ExamResult]:
        """Calculate comprehensive result for a student in an exam event"""
        
        # Get all student exams for this event
        student_exams = db.query(StudentExam).join(ExamSchedule).filter(
            and_(
                ExamSchedule.exam_event_id == exam_event_id,
                StudentExam.student_id == student_id
            )
        ).all()

        if not student_exams:
            return None

        # Calculate statistics
        total_subjects = len(student_exams)
        subjects_appeared = len([se for se in student_exams if se.attendance_status == EnrollmentStatus.ENROLLED])
        subjects_passed = len([se for se in student_exams if se.is_pass])
        subjects_failed = subjects_appeared - subjects_passed

        total_marks_possible = sum([se.exam_schedule.total_marks for se in student_exams])
        total_marks_obtained = sum([se.total_marks_obtained for se in student_exams])
        
        percentage = (total_marks_obtained / total_marks_possible * 100) if total_marks_possible > 0 else 0

        # Determine overall grade and promotion status
        if percentage >= 90:
            overall_grade = "A+"
        elif percentage >= 80:
            overall_grade = "A"
        elif percentage >= 70:
            overall_grade = "B+"
        elif percentage >= 60:
            overall_grade = "B"
        elif percentage >= 50:
            overall_grade = "C"
        elif percentage >= 40:
            overall_grade = "D"
        else:
            overall_grade = "F"

        is_promoted = subjects_failed == 0 and percentage >= 40
        has_backlogs = subjects_failed > 0

        # Get backlog subjects
        backlog_subjects = []
        if has_backlogs:
            for se in student_exams:
                if not se.is_pass:
                    subject = db.query(Subject).filter(Subject.id == se.exam_schedule.subject_id).first()
                    if subject:
                        backlog_subjects.append(subject.name)

        # Check if result already exists
        existing_result = db.query(ExamResult).filter(
            and_(
                ExamResult.exam_event_id == exam_event_id,
                ExamResult.student_id == student_id
            )
        ).first()

        result_data = {
            "total_subjects": total_subjects,
            "subjects_appeared": subjects_appeared,
            "subjects_passed": subjects_passed,
            "subjects_failed": subjects_failed,
            "total_marks_possible": total_marks_possible,
            "total_marks_obtained": total_marks_obtained,
            "percentage": percentage,
            "overall_grade": overall_grade,
            "is_promoted": is_promoted,
            "has_backlogs": has_backlogs,
            "backlog_subjects": json.dumps(backlog_subjects),
            "calculated_at": datetime.utcnow()
        }

        if existing_result:
            for key, value in result_data.items():
                setattr(existing_result, key, value)
            db.commit()
            return existing_result
        else:
            new_result = ExamResult(
                exam_event_id=exam_event_id,
                student_id=student_id,
                **result_data
            )
            db.add(new_result)
            db.commit()
            db.refresh(new_result)
            return new_result

    def get_exam_statistics(self, db: Session, *, exam_event_id: int) -> Dict[str, Any]:
        """Get comprehensive statistics for an exam event"""
        
        results = self.get_by_exam_event(db, exam_event_id=exam_event_id)
        
        if not results:
            return {
                "total_students": 0,
                "students_appeared": 0,
                "students_absent": 0,
                "pass_percentage": 0,
                "average_marks": 0,
                "highest_marks": 0,
                "lowest_marks": 0,
                "grade_distribution": {},
                "subject_wise_performance": []
            }

        total_students = len(results)
        students_appeared = len([r for r in results if r.subjects_appeared > 0])
        students_absent = total_students - students_appeared
        
        passed_students = len([r for r in results if r.is_promoted])
        pass_percentage = (passed_students / students_appeared * 100) if students_appeared > 0 else 0

        percentages = [r.percentage for r in results if r.subjects_appeared > 0]
        average_marks = sum(percentages) / len(percentages) if percentages else 0
        highest_marks = max(percentages) if percentages else 0
        lowest_marks = min(percentages) if percentages else 0

        # Grade distribution
        grade_distribution = {}
        for result in results:
            grade = result.overall_grade or "N/A"
            grade_distribution[grade] = grade_distribution.get(grade, 0) + 1

        return {
            "total_students": total_students,
            "students_appeared": students_appeared,
            "students_absent": students_absent,
            "pass_percentage": pass_percentage,
            "average_marks": average_marks,
            "highest_marks": highest_marks,
            "lowest_marks": lowest_marks,
            "grade_distribution": grade_distribution,
            "subject_wise_performance": []  # Can be implemented later
        }

# Create instances
crud_exam_event = CRUDExamEvent(ExamEvent)
crud_exam_schedule = CRUDExamSchedule(ExamSchedule)
crud_student_exam_enrollment = CRUDStudentExamEnrollment(StudentExamEnrollment)
crud_student_exam = CRUDStudentExam(StudentExam)
crud_exam_result = CRUDExamResult(ExamResult)
