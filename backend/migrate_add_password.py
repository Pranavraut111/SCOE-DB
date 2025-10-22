"""
Migration script to add password_hash field to students table
and initialize default passwords for all existing students
"""
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.db.session import SessionLocal
from app.crud.crud_student import set_default_password_for_all

def add_password_column():
    """Add password_hash column to students table"""
    engine = create_engine(settings.DATABASE_URI)
    
    with engine.connect() as connection:
        # Check if column already exists
        result = connection.execute(text("""
            SELECT COUNT(*) as count
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'students' 
            AND COLUMN_NAME = 'password_hash'
        """))
        
        exists = result.fetchone()[0] > 0
        
        if not exists:
            print("Adding password_hash column to students table...")
            connection.execute(text("""
                ALTER TABLE students 
                ADD COLUMN password_hash VARCHAR(255) NULL 
                COMMENT 'Hashed password for student login'
            """))
            connection.commit()
            print("✓ Column added successfully")
        else:
            print("✓ password_hash column already exists")

def initialize_passwords():
    """Set default password for all students"""
    db = SessionLocal()
    try:
        print("\nInitializing default passwords for students...")
        count = set_default_password_for_all(db, "Student@123")
        print(f"✓ Default password set for {count} students")
        print("  Default password: Student@123")
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Student Authentication Migration")
    print("=" * 60)
    
    try:
        # Step 1: Add password column
        add_password_column()
        
        # Step 2: Initialize passwords
        initialize_passwords()
        
        print("\n" + "=" * 60)
        print("Migration completed successfully!")
        print("=" * 60)
        print("\nStudents can now login with:")
        print("  - Email: their institutional email (e.g., amey.kadam@cse.scoe.edu.in)")
        print("  - Password: Student@123 (default)")
        print("\nStudents can change their password after first login.")
        
    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        import traceback
        traceback.print_exc()
