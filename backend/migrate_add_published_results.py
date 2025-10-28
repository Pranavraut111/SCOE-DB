#!/usr/bin/env python3
"""
Add published_results table to track which results are published to students
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db.session import SessionLocal, engine

def add_published_results_table():
    """Add published_results table"""
    db = SessionLocal()
    
    try:
        print("Adding published_results table...")
        
        # Create published_results table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS published_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                semester INT NOT NULL,
                academic_year VARCHAR(20) NOT NULL,
                department VARCHAR(100) NOT NULL,
                published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                published_by VARCHAR(100),
                is_viewed BOOLEAN DEFAULT FALSE,
                viewed_at DATETIME,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                UNIQUE KEY unique_student_semester (student_id, semester, academic_year)
            )
        """))
        
        db.commit()
        print("✓ published_results table created successfully")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

def main():
    print("🚀 Adding published_results table...")
    print("=" * 50)
    
    try:
        add_published_results_table()
        print("=" * 50)
        print("✅ Migration completed successfully!")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
