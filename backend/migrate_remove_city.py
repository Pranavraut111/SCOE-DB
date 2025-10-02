#!/usr/bin/env python3
"""
Database migration script to remove the city column from students table
Run this script to update your existing database schema
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.db.session import SessionLocal

def migrate_remove_city():
    """Remove city column from students table"""
    db = SessionLocal()
    try:
        # Check if city column exists
        result = db.execute(text("""
            SELECT COUNT(*) 
            FROM information_schema.columns 
            WHERE table_name = 'students' 
            AND column_name = 'city'
            AND table_schema = DATABASE()
        """))
        
        city_exists = result.scalar() > 0
        
        if city_exists:
            print("Removing city column from students table...")
            # Remove the city column
            db.execute(text("ALTER TABLE students DROP COLUMN city"))
            db.commit()
            print("✅ Successfully removed city column")
        else:
            print("ℹ️  City column doesn't exist, no migration needed")
            
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting database migration to remove city column...")
    migrate_remove_city()
    print("Migration completed!")
