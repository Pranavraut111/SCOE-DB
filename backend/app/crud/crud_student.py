from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.student import Student as DBStudent
from app.services.generators import generate_roll_number, generate_institutional_email
from app.schemas.student import StudentCreate, StudentUpdate
from app.core.security import get_password_hash, verify_password

def get_student(db: Session, student_id: int) -> Optional[DBStudent]:
    return db.query(DBStudent).filter(DBStudent.id == student_id).first()

def get_student_by_email(db: Session, email: str) -> Optional[DBStudent]:
    return db.query(DBStudent).filter(DBStudent.email == email).first()

def get_student_by_admission_number(db: Session, admission_number: str) -> Optional[DBStudent]:
    return db.query(DBStudent).filter(DBStudent.admission_number == admission_number).first()

def get_students(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    search: str = None
) -> List[DBStudent]:
    query = db.query(DBStudent)
    
    if search:
        search_filter = or_(
            DBStudent.first_name.ilike(f"%{search}%"),
            DBStudent.last_name.ilike(f"%{search}%"),
            DBStudent.email.ilike(f"%{search}%"),
            DBStudent.admission_number.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    return query.offset(skip).limit(limit).all()

def create_student(db: Session, student: StudentCreate) -> DBStudent:
    full_name = f"{student.first_name} {student.middle_name} {student.last_name}".strip()
    roll_number = student.roll_number or generate_roll_number(student.department or "", getattr(student, 'admission_year', 2024))
    institutional_email = student.institutional_email or generate_institutional_email(full_name, student.department or "dept")
    db_student = DBStudent(
        first_name=student.first_name,
        middle_name=student.middle_name,
        last_name=student.last_name,
        mother_name=student.mother_name,
        email=student.email,
        phone=student.phone,
        date_of_birth=student.date_of_birth,
        gender=student.gender,
        address=student.address,
        state=student.state,
        country=student.country,
        postal_code=student.postal_code,
        admission_number=student.admission_number,
        roll_number=roll_number,
        institutional_email=institutional_email,
        department=student.department,
        category=student.category,
        current_semester=getattr(student, 'current_semester', 1),
        admission_year=getattr(student, 'admission_year', 2024)
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def update_student(
    db: Session, 
    db_student: DBStudent, 
    student_in: StudentUpdate
) -> DBStudent:
    update_data = student_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_student, field, value)
    db.commit()
    db.refresh(db_student)
    return db_student

def delete_student(db: Session, student_id: int) -> DBStudent:
    db_student = db.query(DBStudent).filter(DBStudent.id == student_id).first()
    if db_student:
        db.delete(db_student)
        db.commit()
    return db_student

def get_students_count(db: Session) -> int:
    return db.query(DBStudent).count()

def get_student_by_institutional_email(db: Session, institutional_email: str) -> Optional[DBStudent]:
    """Get student by institutional email"""
    return db.query(DBStudent).filter(DBStudent.institutional_email == institutional_email).first()

def authenticate_student(db: Session, institutional_email: str, password: str) -> Optional[DBStudent]:
    """Authenticate student with email and password"""
    student = get_student_by_institutional_email(db, institutional_email)
    if not student:
        return None
    if not student.password_hash:
        # If no password set, check if it's the default password
        if password == "Student@123":
            # Set the default password hash for first login
            student.password_hash = get_password_hash("Student@123")
            db.commit()
            return student
        return None
    if not verify_password(password, student.password_hash):
        return None
    return student

def change_student_password(db: Session, student: DBStudent, new_password: str) -> DBStudent:
    """Change student password"""
    student.password_hash = get_password_hash(new_password)
    db.commit()
    db.refresh(student)
    return student

def set_default_password_for_all(db: Session, default_password: str = "Student@123") -> int:
    """Set default password for all students who don't have one"""
    students = db.query(DBStudent).filter(DBStudent.password_hash == None).all()
    count = 0
    password_hash = get_password_hash(default_password)
    for student in students:
        student.password_hash = password_hash
        count += 1
    db.commit()
    return count
