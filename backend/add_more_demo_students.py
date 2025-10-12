#!/usr/bin/env python3
"""
Add more demo students for Computer Science Engineering Semester 2
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.student import Student, Gender, AcademicStatus
from sqlalchemy.exc import IntegrityError
from datetime import date

def add_more_demo_students():
    """Add 25 more demo students for Computer Science Engineering Semester 2"""
    
    demo_students = [
        # Batch 1: Semester 2 Computer Science Engineering Students
        {
            "first_name": "Ananya", "middle_name": "Suresh", "last_name": "Iyer",
            "email": "ananya.iyer@gmail.com", "phone": "9876543215",
            "date_of_birth": date(2005, 4, 12), "gender": Gender.FEMALE,
            "address": "Plot 15, Koregaon Park, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411001", "admission_number": "SCOE2024006",
            "roll_number": "SCOE106", "institutional_email": "ananya.iyer@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "General",
            "mother_name": "Lakshmi Iyer", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Karan", "middle_name": "Deepak", "last_name": "Joshi",
            "email": "karan.joshi@gmail.com", "phone": "9876543216",
            "date_of_birth": date(2005, 6, 8), "gender": Gender.MALE,
            "address": "Flat 204, Aundh Heights, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411007", "admission_number": "SCOE2024007",
            "roll_number": "SCOE107", "institutional_email": "karan.joshi@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "OBC",
            "mother_name": "Meera Joshi", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Riya", "middle_name": "Amit", "last_name": "Gupta",
            "email": "riya.gupta@gmail.com", "phone": "9876543217",
            "date_of_birth": date(2005, 2, 20), "gender": Gender.FEMALE,
            "address": "House 12, Viman Nagar, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411014", "admission_number": "SCOE2024008",
            "roll_number": "SCOE108", "institutional_email": "riya.gupta@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "General",
            "mother_name": "Pooja Gupta", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Aditya", "middle_name": "Ramesh", "last_name": "Nair",
            "email": "aditya.nair@gmail.com", "phone": "9876543218",
            "date_of_birth": date(2005, 8, 15), "gender": Gender.MALE,
            "address": "Bungalow 8, Kothrud, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411038", "admission_number": "SCOE2024009",
            "roll_number": "SCOE109", "institutional_email": "aditya.nair@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "General",
            "mother_name": "Sushma Nair", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Kavya", "middle_name": "Mohan", "last_name": "Reddy",
            "email": "kavya.reddy@gmail.com", "phone": "9876543219",
            "date_of_birth": date(2005, 10, 3), "gender": Gender.FEMALE,
            "address": "Apartment 301, Hadapsar, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411028", "admission_number": "SCOE2024010",
            "roll_number": "SCOE110", "institutional_email": "kavya.reddy@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "OBC",
            "mother_name": "Padma Reddy", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Harsh", "middle_name": "Vinod", "last_name": "Shah",
            "email": "harsh.shah@gmail.com", "phone": "9876543220",
            "date_of_birth": date(2005, 1, 25), "gender": Gender.MALE,
            "address": "Row House 5, Wakad, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411057", "admission_number": "SCOE2024011",
            "roll_number": "SCOE111", "institutional_email": "harsh.shah@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "General",
            "mother_name": "Nita Shah", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Ishita", "middle_name": "Rajesh", "last_name": "Agarwal",
            "email": "ishita.agarwal@gmail.com", "phone": "9876543221",
            "date_of_birth": date(2005, 5, 18), "gender": Gender.FEMALE,
            "address": "Villa 22, Baner, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411045", "admission_number": "SCOE2024012",
            "roll_number": "SCOE112", "institutional_email": "ishita.agarwal@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "General",
            "mother_name": "Priyanka Agarwal", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Varun", "middle_name": "Sanjay", "last_name": "Mehta",
            "email": "varun.mehta@gmail.com", "phone": "9876543222",
            "date_of_birth": date(2005, 9, 7), "gender": Gender.MALE,
            "address": "Flat 105, Shivaji Nagar, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411005", "admission_number": "SCOE2024013",
            "roll_number": "SCOE113", "institutional_email": "varun.mehta@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "SC",
            "mother_name": "Sunita Mehta", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Tanvi", "middle_name": "Prakash", "last_name": "Jain",
            "email": "tanvi.jain@gmail.com", "phone": "9876543223",
            "date_of_birth": date(2005, 3, 14), "gender": Gender.FEMALE,
            "address": "House 18, Deccan, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411004", "admission_number": "SCOE2024014",
            "roll_number": "SCOE114", "institutional_email": "tanvi.jain@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "General",
            "mother_name": "Rekha Jain", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Aryan", "middle_name": "Manoj", "last_name": "Verma",
            "email": "aryan.verma@gmail.com", "phone": "9876543224",
            "date_of_birth": date(2005, 7, 9), "gender": Gender.MALE,
            "address": "Apartment 402, Warje, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411058", "admission_number": "SCOE2024015",
            "roll_number": "SCOE115", "institutional_email": "aryan.verma@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "OBC",
            "mother_name": "Kavita Verma", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Shreya", "middle_name": "Anil", "last_name": "Kapoor",
            "email": "shreya.kapoor@gmail.com", "phone": "9876543225",
            "date_of_birth": date(2005, 11, 22), "gender": Gender.FEMALE,
            "address": "Bungalow 3, Pashan, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411021", "admission_number": "SCOE2024016",
            "roll_number": "SCOE116", "institutional_email": "shreya.kapoor@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "General",
            "mother_name": "Neha Kapoor", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Dev", "middle_name": "Kishore", "last_name": "Rao",
            "email": "dev.rao@gmail.com", "phone": "9876543226",
            "date_of_birth": date(2005, 4, 5), "gender": Gender.MALE,
            "address": "Plot 7, Magarpatta, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411013", "admission_number": "SCOE2024017",
            "roll_number": "SCOE117", "institutional_email": "dev.rao@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "General",
            "mother_name": "Sita Rao", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Nisha", "middle_name": "Ravi", "last_name": "Pandey",
            "email": "nisha.pandey@gmail.com", "phone": "9876543227",
            "date_of_birth": date(2005, 12, 11), "gender": Gender.FEMALE,
            "address": "Flat 203, Chinchwad, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411033", "admission_number": "SCOE2024018",
            "roll_number": "SCOE118", "institutional_email": "nisha.pandey@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "ST",
            "mother_name": "Gita Pandey", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Siddharth", "middle_name": "Gopal", "last_name": "Mishra",
            "email": "siddharth.mishra@gmail.com", "phone": "9876543228",
            "date_of_birth": date(2005, 6, 28), "gender": Gender.MALE,
            "address": "House 25, Nigdi, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411044", "admission_number": "SCOE2024019",
            "roll_number": "SCOE119", "institutional_email": "siddharth.mishra@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "General",
            "mother_name": "Usha Mishra", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Pooja", "middle_name": "Santosh", "last_name": "Tiwari",
            "email": "pooja.tiwari@gmail.com", "phone": "9876543229",
            "date_of_birth": date(2005, 8, 16), "gender": Gender.FEMALE,
            "address": "Apartment 501, Pimpri, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411018", "admission_number": "SCOE2024020",
            "roll_number": "SCOE120", "institutional_email": "pooja.tiwari@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "OBC",
            "mother_name": "Sushila Tiwari", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Rohit", "middle_name": "Ashok", "last_name": "Bhosle",
            "email": "rohit.bhosle@gmail.com", "phone": "9876543230",
            "date_of_birth": date(2005, 2, 3), "gender": Gender.MALE,
            "address": "Row House 12, Akurdi, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411035", "admission_number": "SCOE2024021",
            "roll_number": "SCOE121", "institutional_email": "rohit.bhosle@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "General",
            "mother_name": "Vandana Bhosle", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Divya", "middle_name": "Mahesh", "last_name": "Kulkarni",
            "email": "divya.kulkarni@gmail.com", "phone": "9876543231",
            "date_of_birth": date(2005, 10, 19), "gender": Gender.FEMALE,
            "address": "Villa 8, Hinjewadi, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411057", "admission_number": "SCOE2024022",
            "roll_number": "SCOE122", "institutional_email": "divya.kulkarni@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "General",
            "mother_name": "Shital Kulkarni", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Akash", "middle_name": "Sunil", "last_name": "Jadhav",
            "email": "akash.jadhav@gmail.com", "phone": "9876543232",
            "date_of_birth": date(2005, 5, 7), "gender": Gender.MALE,
            "address": "Flat 304, Katraj, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411046", "admission_number": "SCOE2024023",
            "roll_number": "SCOE123", "institutional_email": "akash.jadhav@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "SC",
            "mother_name": "Lata Jadhav", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Manasi", "middle_name": "Dilip", "last_name": "Deshpande",
            "email": "manasi.deshpande@gmail.com", "phone": "9876543233",
            "date_of_birth": date(2005, 9, 24), "gender": Gender.FEMALE,
            "address": "House 15, Bavdhan, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411021", "admission_number": "SCOE2024024",
            "roll_number": "SCOE124", "institutional_email": "manasi.deshpande@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "General",
            "mother_name": "Sarika Deshpande", "current_semester": 2, "admission_year": 2024
        },
        {
            "first_name": "Yash", "middle_name": "Ganesh", "last_name": "Patil",
            "email": "yash.patil@gmail.com", "phone": "9876543234",
            "date_of_birth": date(2005, 1, 13), "gender": Gender.MALE,
            "address": "Apartment 205, Dhankawadi, Pune", "state": "1st Year", "country": "India",
            "postal_code": "411043", "admission_number": "SCOE2024025",
            "roll_number": "SCOE125", "institutional_email": "yash.patil@scoe.edu.in",
            "department": "Computer Science Engineering", "category": "OBC",
            "mother_name": "Manjusha Patil", "current_semester": 2, "admission_year": 2024
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
                print(f"✅ Added: {student_data['first_name']} {student_data['last_name']} ({student_data['roll_number']})")
                
            except IntegrityError as e:
                db.rollback()
                print(f"❌ Failed to add {student_data['roll_number']}: {e}")
                continue
        
        print(f"\n🎉 Successfully added {added_count} more demo students!")
        print(f"📊 Total Computer Science Engineering Sem 2 students: {added_count + 2}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Adding more Computer Science Engineering Semester 2 students...")
    add_more_demo_students()
