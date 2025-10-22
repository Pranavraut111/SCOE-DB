"""
Migration script to add student_enrollment_applications table
for student-initiated exam enrollment workflow
"""
from sqlalchemy import create_engine, text
from app.core.config import settings

def add_enrollment_applications_table():
    """Add student_enrollment_applications table"""
    engine = create_engine(settings.DATABASE_URI)
    
    with engine.connect() as connection:
        # Check if table already exists
        result = connection.execute(text("""
            SELECT COUNT(*) as count
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'student_enrollment_applications'
        """))
        
        exists = result.fetchone()[0] > 0
        
        if exists:
            print("✓ Table 'student_enrollment_applications' already exists")
            return
        
        print("Adding student_enrollment_applications table...")
        
        # Create the table
        connection.execute(text("""
            CREATE TABLE student_enrollment_applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                exam_event_id INT NOT NULL,
                student_id INT NOT NULL,
                
                application_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                student_name VARCHAR(200) NOT NULL,
                roll_number VARCHAR(32) NOT NULL,
                department VARCHAR(100) NOT NULL,
                semester INT NOT NULL,
                
                selected_subjects TEXT,
                
                is_backlog_student BOOLEAN DEFAULT FALSE,
                special_requirements TEXT,
                student_remarks TEXT,
                
                reviewed_by VARCHAR(100),
                reviewed_at DATETIME,
                admin_remarks TEXT,
                rejection_reason TEXT,
                
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                FOREIGN KEY (exam_event_id) REFERENCES exam_events(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                INDEX idx_exam_event (exam_event_id),
                INDEX idx_student (student_id),
                INDEX idx_status (application_status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """))
        
        connection.commit()
        print("✓ Table created successfully")

if __name__ == "__main__":
    print("=" * 60)
    print("Student Enrollment Applications Migration")
    print("=" * 60)
    
    try:
        add_enrollment_applications_table()
        print("\n" + "=" * 60)
        print("Migration completed successfully!")
        print("=" * 60)
        print("\nStudents can now apply for exam enrollments!")
        print("Admin can review and approve/reject applications.")
    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        import traceback
        traceback.print_exc()
