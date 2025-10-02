import logging
import sys
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent))

from app.db.base_class import Base
from app.db.session import engine
from app.models.student import Student  # noqa: F401
from app.models.exam import ExamEvent, ExamSchedule, StudentExamEnrollment, StudentExam, ExamResult  # noqa: F401
from sqlalchemy import text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    # Create all tables
    try:
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        # Safe ALTERs for new columns
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE students ADD COLUMN roll_number VARCHAR(32) UNIQUE"))
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE students ADD COLUMN institutional_email VARCHAR(150) UNIQUE"))
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE students ADD COLUMN department VARCHAR(100)"))
            except Exception:
                pass
        logger.info("Database tables created successfully!")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Database initialized successfully!")
