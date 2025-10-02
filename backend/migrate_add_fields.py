#!/usr/bin/env python3
"""
Migration script to add middle_name and mother_name fields to students table
Run this script to update the database schema
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db.session import engine

def run_migration():
    """Add middle_name and mother_name columns to students table"""
    
    # Check if columns exist first
    check_columns_sql = """
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'students' 
    AND COLUMN_NAME IN ('middle_name', 'mother_name')
    """
    
    # Check if columns exist first
    check_middle_sql = """
    SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'students' AND COLUMN_NAME = 'middle_name'
    """
    
    check_mother_sql = """
    SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'students' AND COLUMN_NAME = 'mother_name'
    """
    
    migration_sql = {
        'add_middle_name': "ALTER TABLE students ADD COLUMN middle_name VARCHAR(50) DEFAULT ''",
        'add_mother_name': "ALTER TABLE students ADD COLUMN mother_name VARCHAR(100) DEFAULT ''",
        'update_middle_name': "UPDATE students SET middle_name = '' WHERE middle_name IS NULL",
        'update_mother_name': "UPDATE students SET mother_name = '' WHERE mother_name IS NULL"
    }
    
    try:
        with engine.connect() as connection:
            # Check if middle_name column exists
            result = connection.execute(text(check_middle_sql))
            middle_name_exists = result.fetchone()[0] > 0
            
            # Check if mother_name column exists
            result = connection.execute(text(check_mother_sql))
            mother_name_exists = result.fetchone()[0] > 0
            
            # Add middle_name column if it doesn't exist
            if not middle_name_exists:
                print("Adding middle_name column...")
                connection.execute(text(migration_sql['add_middle_name']))
                print("✅ middle_name column added")
            else:
                print("middle_name column already exists")
            
            # Add mother_name column if it doesn't exist
            if not mother_name_exists:
                print("Adding mother_name column...")
                connection.execute(text(migration_sql['add_mother_name']))
                print("✅ mother_name column added")
            else:
                print("mother_name column already exists")
            
            # Update existing records
            print("Updating existing records with default values...")
            connection.execute(text(migration_sql['update_middle_name']))
            connection.execute(text(migration_sql['update_mother_name']))
            
            connection.commit()
            print("✅ Migration completed successfully!")
            
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    print("🔄 Running database migration...")
    success = run_migration()
    sys.exit(0 if success else 1)
