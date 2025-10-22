"""
Script to check marks in the database
"""
from app.db.session import SessionLocal
from app.models.exam import StudentExam, ExamSchedule
from sqlalchemy import and_

def check_marks():
    db = SessionLocal()
    
    try:
        # Get all student exams
        all_exams = db.query(StudentExam).all()
        print(f"\n📊 Total StudentExam records: {len(all_exams)}")
        
        if len(all_exams) == 0:
            print("❌ No StudentExam records found in database!")
            print("\nThis means marks are not being saved to the database.")
            print("The bulk_update_marks function might be failing silently.")
        else:
            print("\n✅ Found StudentExam records:")
            for exam in all_exams:
                schedule = db.query(ExamSchedule).filter(ExamSchedule.id == exam.exam_schedule_id).first()
                subject_name = schedule.subject.code if schedule and schedule.subject else "Unknown"
                
                print(f"\n  Student ID: {exam.student_id}")
                print(f"  Schedule ID: {exam.exam_schedule_id} ({subject_name})")
                print(f"  Theory Marks: {exam.theory_marks_obtained}")
                print(f"  Practical Marks: {exam.practical_marks_obtained}")
                print(f"  Total Marks: {exam.total_marks_obtained}")
                print(f"  Grade: {exam.grade}")
                print(f"  Is Present: {exam.is_present}")
                print(f"  Marks Entered By: {exam.marks_entered_by}")
                print(f"  Marks Entered At: {exam.marks_entered_at}")
        
        # Check specific schedule
        print("\n\n🔍 Checking Schedule ID 8 (CS104):")
        cs104_exams = db.query(StudentExam).filter(StudentExam.exam_schedule_id == 8).all()
        print(f"Found {len(cs104_exams)} records for CS104")
        
        for exam in cs104_exams:
            print(f"  - Student {exam.student_id}: {exam.theory_marks_obtained} marks")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Checking marks in database...\n")
    check_marks()
    print("\n✅ Done!")
