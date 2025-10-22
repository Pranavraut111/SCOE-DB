from app.db.session import SessionLocal
from app.crud import crud_enrollment_application

db = SessionLocal()

print("Testing get_eligible_exam_events_for_student...")
events = crud_enrollment_application.get_eligible_exam_events_for_student(
    db, 1, 'Computer Science Engineering'
)

print(f"Found {len(events)} events")
for event in events:
    print(f"  - Event {event.id}: {event.name}, Sem: {event.semester}, Dept: {event.department}")

db.close()
