from app.db.session import SessionLocal
from app.models.exam import ExamSchedule, ExamEvent

db = SessionLocal()

print("=== EXAM EVENTS ===")
events = db.query(ExamEvent).all()
for event in events:
    print(f"Event {event.id}: {event.name} (Dept: {event.department}, Sem: {event.semester})")

print("\n=== EXAM SCHEDULES ===")
schedules = db.query(ExamSchedule).all()
print(f"Total schedules: {len(schedules)}")
for schedule in schedules:
    print(f"Schedule {schedule.id}: exam_event_id={schedule.exam_event_id}, subject_id={schedule.subject_id}, active={schedule.is_active}")

print("\n=== SCHEDULES FOR EVENT 4 ===")
schedules_4 = db.query(ExamSchedule).filter(ExamSchedule.exam_event_id == 4).all()
print(f"Found {len(schedules_4)} schedules for event 4")
for schedule in schedules_4:
    print(f"  - Schedule {schedule.id}: subject_id={schedule.subject_id}")

db.close()
