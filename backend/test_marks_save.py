"""
Test script to directly save marks and see what happens
"""
from app.db.session import SessionLocal
from app.crud.crud_exam import crud_student_exam

def test_save_marks():
    db = SessionLocal()
    
    try:
        print("\n🧪 Testing bulk_update_marks function...")
        
        result = crud_student_exam.bulk_update_marks(
            db,
            exam_schedule_id=8,
            marks_data=[{
                "student_id": 90,
                "theory_marks": 99,
                "practical_marks": 0
            }],
            entered_by="test_script"
        )
        
        print(f"\n✅ Function returned: {result}")
        
        # Check if record was created
        from app.models.exam import StudentExam
        record = db.query(StudentExam).filter(
            StudentExam.exam_schedule_id == 8,
            StudentExam.student_id == 90
        ).first()
        
        if record:
            print(f"\n✅ Record found in database!")
            print(f"   Theory marks: {record.theory_marks_obtained}")
            print(f"   Total marks: {record.total_marks_obtained}")
            print(f"   Grade: {record.grade}")
        else:
            print(f"\n❌ No record found in database after save!")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_save_marks()
