from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.student import Student as DBStudent
from app.services.generators import generate_roll_number, generate_institutional_email
from app.schemas.student import StudentCreate, StudentUpdate

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
    roll_number = student.roll_number or generate_roll_number("", student.state or "")
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
        category=student.category
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
