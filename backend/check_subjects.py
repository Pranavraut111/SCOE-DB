from app.db.session import SessionLocal
from app.models.subject import Subject

db = SessionLocal()

print("=== CHECKING SUBJECTS 8 and 14 ===")
subject_8 = db.query(Subject).filter(Subject.id == 8).first()
subject_14 = db.query(Subject).filter(Subject.id == 14).first()

if subject_8:
    print(f"Subject 8: {subject_8.code} - {subject_8.name}")
else:
    print("Subject 8: NOT FOUND")

if subject_14:
    print(f"Subject 14: {subject_14.code} - {subject_14.name}")
else:
    print("Subject 14: NOT FOUND")

db.close()
