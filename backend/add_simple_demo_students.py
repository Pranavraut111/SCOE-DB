#!/usr/bin/env python3
"""
Simple script to add demo students with progression fields
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.student import Student, Gender, AcademicStatus
from sqlalchemy.exc import IntegrityError
from datetime import date

def add_simple_demo_students():
    """Add a few demo students with progression tracking"""
    
    demo_students = [
        {
            "first_name": "Aarav", "middle_name": "Rajesh", "last_name": "Sharma",
            "email": "aarav.sharma@gmail.com", "phone": "9876543210",
            "date_of_birth": date(2005, 3, 15), "gender": Gender.MALE,
            "address": "123 MG Road, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411001", "admission_number": "SCOE2024001",
            "roll_number": "SCOE101", "institutional_email": "aarav.sharma@scoe.edu.in",
            "department": "Computer Engineering", "category": "General",
            "mother_name": "Priya Sharma", "current_semester": 2, "admission_year": 2024,
            "academic_status": AcademicStatus.ACTIVE
        },
        {
            "first_name": "Priya", "middle_name": "Suresh", "last_name": "Patel",
            "email": "priya.patel@gmail.com", "phone": "9876543211",
            "date_of_birth": date(2005, 7, 22), "gender": Gender.FEMALE,
            "address": "456 FC Road, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411005", "admission_number": "SCOE2024002",
            "roll_number": "SCOE102", "institutional_email": "priya.patel@scoe.edu.in",
            "department": "Computer Engineering", "category": "OBC",
            "mother_name": "Sunita Patel", "current_semester": 2, "admission_year": 2024,
            "academic_status": AcademicStatus.ACTIVE
        },
        {
            "first_name": "Arjun", "middle_name": "Vikram", "last_name": "Singh",
            "email": "arjun.singh@gmail.com", "phone": "9876543212",
            "date_of_birth": date(2005, 1, 10), "gender": Gender.MALE,
            "address": "789 JM Road, Pune", "state": "2nd Year", "country": "India",
            "postal_code": "411004", "admission_number": "SCOE2023003",
            "roll_number": "SCOE103", "institutional_email": "arjun.singh@scoe.edu.in",
            "department": "Computer Engineering", "category": "General",
            "mother_name": "Kavita Singh", "current_semester": 4, "admission_year": 2023,
            "academic_status": AcademicStatus.ACTIVE
        },
        {
            "first_name": "Sneha", "middle_name": "Anil", "last_name": "Deshmukh",
            "email": "sneha.deshmukh@gmail.com", "phone": "9876543213",
            "date_of_birth": date(2004, 9, 5), "gender": Gender.FEMALE,
            "address": "321 Karve Road, Pune", "state": "3rd Year", "country": "India",
            "postal_code": "411029", "admission_number": "SCOE2022004",
            "roll_number": "SCOE104", "institutional_email": "sneha.deshmukh@scoe.edu.in",
            "department": "Computer Engineering", "category": "SC",
            "mother_name": "Mangala Deshmukh", "current_semester": 6, "admission_year": 2022,
            "academic_status": AcademicStatus.ACTIVE
        },
        {
            "first_name": "Rohan", "middle_name": "Prakash", "last_name": "Kulkarni",
            "email": "rohan.kulkarni@gmail.com", "phone": "9876543214",
            "date_of_birth": date(2003, 11, 18), "gender": Gender.MALE,
            "address": "654 Baner Road, Pune", "state": "4th Year", "country": "India",
            "postal_code": "411045", "admission_number": "SCOE2021005",
            "roll_number": "SCOE105", "institutional_email": "rohan.kulkarni@scoe.edu.in",
            "department": "Computer Engineering", "category": "General",
            "mother_name": "Shobha Kulkarni", "current_semester": 8, "admission_year": 2021,
            "academic_status": AcademicStatus.ACTIVE
        }
    ]
    
    db = SessionLocal()
    try:
        added_count = 0
        for student_data in demo_students:
            try:
                # Check if student already exists
                existing = db.query(Student).filter(
                    (Student.roll_number == student_data["roll_number"]) |
                    (Student.email == student_data["email"])
                ).first()
                
                if existing:
                    print(f"Student {student_data['roll_number']} already exists, skipping...")
                    continue
                
                student = Student(**student_data)
                db.add(student)
                db.commit()
                added_count += 1
                print(f"✅ Added: {student_data['first_name']} {student_data['last_name']} ({student_data['roll_number']}) - Sem {student_data['current_semester']}")
                
            except IntegrityError as e:
                db.rollback()
                print(f"❌ Failed to add {student_data['roll_number']}: {e}")
                continue
        
        print(f"\n🎉 Successfully added {added_count} demo students!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Adding demo students with progression tracking...")
    add_simple_demo_students()
