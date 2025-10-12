#!/usr/bin/env python3
"""
Database migration script to add student progression tracking fields
Run this script to update your existing database schema
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.db.session import SessionLocal

def migrate_add_student_progression():
    """Add student progression tracking fields"""
    db = SessionLocal()
    try:
        print("Adding student progression tracking fields...")
        
        # Add current_semester field
        db.execute(text("""
            ALTER TABLE students 
            ADD COLUMN current_semester INTEGER DEFAULT 1 
            COMMENT 'Current semester (1-8)'
        """))
        
        # Add admission_year field
        db.execute(text("""
            ALTER TABLE students 
            ADD COLUMN admission_year INTEGER DEFAULT 2024 
            COMMENT 'Year student was admitted'
        """))
        
        # Add academic_status field for tracking progression
        db.execute(text("""
            ALTER TABLE students 
            ADD COLUMN academic_status ENUM('active', 'promoted', 'detained', 'graduated', 'dropout') 
            DEFAULT 'active' 
            COMMENT 'Current academic status'
        """))
        
        # Add last_updated timestamp for tracking changes
        db.execute(text("""
            ALTER TABLE students 
            ADD COLUMN progression_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            COMMENT 'Last time progression was updated'
        """))
        
        db.commit()
        print("✅ Successfully added student progression tracking fields!")
        
        # Update existing students with calculated values
        print("Updating existing students with calculated progression data...")
        
        # Calculate current semester based on academic year
        # Assuming: 1st Year = Sem 1-2, 2nd Year = Sem 3-4, etc.
        db.execute(text("""
            UPDATE students 
            SET current_semester = CASE 
                WHEN state = '1st Year' THEN 2
                WHEN state = '2nd Year' THEN 4  
                WHEN state = '3rd Year' THEN 6
                WHEN state = '4th Year' THEN 8
                ELSE 1
            END
        """))
        
        # Set admission year based on current year and academic year
        db.execute(text("""
            UPDATE students 
            SET admission_year = CASE 
                WHEN state = '1st Year' THEN YEAR(CURDATE())
                WHEN state = '2nd Year' THEN YEAR(CURDATE()) - 1
                WHEN state = '3rd Year' THEN YEAR(CURDATE()) - 2  
                WHEN state = '4th Year' THEN YEAR(CURDATE()) - 3
                ELSE YEAR(CURDATE())
            END
        """))
        
        db.commit()
        print("✅ Updated existing student progression data!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error during migration: {e}")
        raise
    finally:
        db.close()

def create_student_progression_table():
    """Create a separate table to track semester-wise progression history"""
    db = SessionLocal()
    try:
        print("Creating student progression history table...")
        
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS student_progression_history (
                id INTEGER PRIMARY KEY AUTO_INCREMENT,
                student_id INTEGER NOT NULL,
                from_semester INTEGER NOT NULL,
                to_semester INTEGER NOT NULL,
                academic_year VARCHAR(10) NOT NULL COMMENT 'e.g., 2023-24',
                promotion_date DATE NOT NULL,
                exam_event_id INTEGER NULL COMMENT 'Exam that led to promotion',
                status ENUM('promoted', 'detained', 'repeated') DEFAULT 'promoted',
                remarks TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                INDEX idx_student_progression (student_id, academic_year),
                INDEX idx_semester_progression (from_semester, to_semester)
            ) COMMENT 'Track semester-wise student progression history'
        """))
        
        db.commit()
        print("✅ Created student progression history table!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating progression table: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Starting student progression tracking migration...")
    migrate_add_student_progression()
    create_student_progression_table()
    print("🎉 Migration completed successfully!")
    print("\n📋 Summary of changes:")
    print("   • Added current_semester field to students table")
    print("   • Added admission_year field to students table") 
    print("   • Added academic_status field for tracking")
    print("   • Added progression_updated_at timestamp")
    print("   • Created student_progression_history table")
    print("   • Updated existing students with calculated data")
