import logging
import sys
from pathlib import Path
from datetime import date

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent))

from app.db.session import SessionLocal
from app.models.student import Student, Gender
from sqlalchemy.exc import IntegrityError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def add_demo_students():
    """Add realistic demo students for Computer Engineering 1st year, 2nd semester"""
    
    demo_students = [
        {
            "first_name": "Aarav", "middle_name": "Rajesh", "last_name": "Sharma",
            "email": "aarav.sharma@gmail.com", "phone": "9876543210",
            "date_of_birth": date(2005, 3, 15), "gender": Gender.MALE,
            "address": "123 MG Road, Pune", "state": "Maharashtra", "country": "India",
            "postal_code": "411001", "admission_number": "SCOE2024001",
            "roll_number": "SCOE101", "institutional_email": "aarav.sharma@scoe.edu.in",
            "department": "Computer Engineering", "category": "General",
            "mother_name": "Priya Sharma"
        },
        {
            "first_name": "Priya", "middle_name": "Suresh", "last_name": "Patel",
            "email": "priya.patel@gmail.com", "phone": "9876543211",
            "date_of_birth": date(2005, 7, 22), "gender": Gender.FEMALE,
            "address": "456 FC Road, Pune", "state": "Maharashtra", "country": "India",
            "postal_code": "411005", "admission_number": "SCOE2024002",
            "roll_number": "SCOE102", "institutional_email": "priya.patel@scoe.edu.in",
            "department": "Computer Engineering", "category": "OBC",
            "mother_name": "Sunita Patel"
        },
        {
            "first_name": "Arjun", "middle_name": "Vikram", "last_name": "Singh",
            "email": "arjun.singh@gmail.com", "phone": "9876543212",
            "date_of_birth": date(2005, 1, 10), "gender": Gender.MALE,
            "address": "789 JM Road, Pune", "state": "Maharashtra", "country": "India",
            "postal_code": "411004", "admission_number": "SCOE2024003",
            "roll_number": "SCOE103", "institutional_email": "arjun.singh@scoe.edu.in",
            "department": "Computer Engineering", "category": "General",
            "mother_name": "Kavita Singh"
        },
        {
            "first_name": "Sneha", "middle_name": "Anil", "last_name": "Deshmukh",
            "email": "sneha.deshmukh@gmail.com", "phone": "9876543213",
            "date_of_birth": date(2005, 9, 5), "gender": Gender.FEMALE,
            "address": "321 Karve Road, Pune", "state": "Maharashtra", "country": "India",
            "postal_code": "411029", "admission_number": "SCOE2024004",
            "roll_number": "SCOE104", "institutional_email": "sneha.deshmukh@scoe.edu.in",
            "department": "Computer Engineering", "category": "SC",
            "mother_name": "Mangala Deshmukh"
        },
        {
            "first_name": "Rohan", "middle_name": "Prakash", "last_name": "Kulkarni",
            "email": "rohan.kulkarni@gmail.com", "phone": "9876543214",
            "date_of_birth": date(2005, 11, 18), "gender": Gender.MALE,
            "address": "654 Baner Road, Pune", "state": "Maharashtra", "country": "India",
            "postal_code": "411045", "admission_number": "SCOE2024005",
            "roll_number": "SCOE105", "institutional_email": "rohan.kulkarni@scoe.edu.in",
            "department": "Computer Engineering", "category": "General",
            "mother_name": "Shobha Kulkarni"
        },
        {
            "first_name": "Ananya", "middle_name": "Ramesh", "last_name": "Iyer",
            "email": "ananya.iyer@gmail.com", "phone": "9876543215",
            "date_of_birth": date(2005, 4, 30), "gender": Gender.FEMALE,
            "address": "987 Wakad Road, Pune", "state": "Maharashtra", "country": "India",
            "postal_code": "411057", "admission_number": "SCOE2024006",
            "roll_number": "SCOE106", "institutional_email": "ananya.iyer@scoe.edu.in",
            "department": "Computer Engineering", "category": "General",
            "mother_name": "Lakshmi Iyer"
        },
        {
            "first_name": "Karan", "middle_name": "Deepak", "last_name": "Joshi",
            "email": "karan.joshi@gmail.com", "phone": "9876543216",
            "date_of_birth": date(2005, 6, 12), "gender": Gender.MALE,
            "address": "147 Hinjewadi Road, Pune", "state": "Maharashtra", "country": "India",
            "postal_code": "411057", "admission_number": "SCOE2024007",
            "roll_number": "SCOE107", "institutional_email": "karan.joshi@scoe.edu.in",
            "department": "Computer Engineering", "category": "OBC",
            "mother_name": "Meera Joshi"
        },
        {
            "first_name": "Ishita", "middle_name": "Manoj", "last_name": "Gupta",
            "email": "ishita.gupta@gmail.com", "phone": "9876543217",
            "date_of_birth": date(2005, 8, 25), "gender": Gender.FEMALE,
            "address": "258 Viman Nagar, Pune", "state": "Maharashtra", "country": "India",
            "postal_code": "411014", "admission_number": "SCOE2024008",
            "roll_number": "SCOE108", "institutional_email": "ishita.gupta@scoe.edu.in",
            "department": "Computer Engineering", "category": "General",
            "mother_name": "Pooja Gupta"
        },
        {
            "first_name": "Aditya", "middle_name": "Sanjay", "last_name": "Rao",
            "email": "aditya.rao@gmail.com", "phone": "9876543218",
            "date_of_birth": date(2005, 2, 8), "gender": Gender.MALE,
            "address": "369 Koregaon Park, Pune", "state": "Maharashtra", "country": "India",
            "postal_code": "411001", "admission_number": "SCOE2024009",
            "roll_number": "SCOE109", "institutional_email": "aditya.rao@scoe.edu.in",
            "department": "Computer Engineering", "category": "ST",
            "mother_name": "Sudha Rao"
        },
        {
            "first_name": "Kavya", "middle_name": "Ashok", "last_name": "Nair",
            "email": "kavya.nair@gmail.com", "phone": "9876543219",
            "date_of_birth": date(2005, 12, 3), "gender": Gender.FEMALE,
            "address": "741 Aundh Road, Pune", "state": "Maharashtra", "country": "India",
            "postal_code": "411007", "admission_number": "SCOE2024010",
            "roll_number": "SCOE110", "institutional_email": "kavya.nair@scoe.edu.in",
            "department": "Computer Engineering", "category": "General",
            "mother_name": "Radha Nair"
        },
        {
            "first_name": "Vivek", "middle_name": "Ganesh", "last_name": "Patil",
            "email": "vivek.patil@gmail.com", "phone": "9876543220",
            "date_of_birth": date(2005, 5, 17), "gender": Gender.MALE,
            "address": "852 Shivaji Nagar, Pune", "state": "Maharashtra", "country": "India",
            "postal_code": "411005", "admission_number": "SCOE2024011",
            "roll_number": "SCOE111", "institutional_email": "vivek.patil@scoe.edu.in",
            "department": "Computer Engineering", "category": "OBC",
            "mother_name": "Sushma Patil"
        },
        {
            "first_name": "Riya", "middle_name": "Vinod", "last_name": "Shah",
            "email": "riya.shah@gmail.com", "phone": "9876543221",
            "date_of_birth": date(2005, 10, 14), "gender": Gender.FEMALE,
            "address": "963 Camp Area, Pune", "state": "Maharashtra", "country": "India",
            "postal_code": "411001", "admission_number": "SCOE2024012",
            "roll_number": "SCOE112", "institutional_email": "riya.shah@scoe.edu.in",
            "department": "Computer Engineering", "category": "General",
            "mother_name": "Nisha Shah"
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
                    (Student.email == student_data["email"]) |
                    (Student.admission_number == student_data["admission_number"])
                ).first()
                
                if existing:
                    logger.info(f"Student {student_data['roll_number']} already exists, skipping...")
                    continue
                
                student = Student(**student_data)
                db.add(student)
                db.commit()
                added_count += 1
                logger.info(f"Added student: {student_data['first_name']} {student_data['last_name']} ({student_data['roll_number']})")
                
            except IntegrityError as e:
                db.rollback()
                logger.warning(f"Failed to add student {student_data['roll_number']}: {e}")
                continue
        
        logger.info(f"Successfully added {added_count} demo students to the database!")
        
    except Exception as e:
        logger.error(f"Error adding demo students: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Adding demo students for Computer Engineering 1st year, 2nd semester...")
    add_demo_students()
    print("Demo students added successfully!")
