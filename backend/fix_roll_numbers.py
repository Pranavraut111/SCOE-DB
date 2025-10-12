#!/usr/bin/env python3
"""
Fix roll numbers to follow proper format: SCOE + Year + DeptCode + Sequential
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from sqlalchemy import text

def fix_roll_numbers():
    """Update all students with proper roll number format"""
    
    db = SessionLocal()
    try:
        # Get all students
        result = db.execute(text('''
            SELECT id, first_name, last_name, department, admission_year, current_semester 
            FROM students 
            ORDER BY admission_year DESC, id ASC
        '''))
        students = result.fetchall()
        
        # Department codes
        dept_codes = {
            'Computer Science Engineering': '00',
            'Information Technology': '01', 
            'Electronics and Communication Engineering': '02',
            'Electrical Engineering': '03',
            'Mechanical Engineering': '04',
            'Civil Engineering': '05'
        }
        
        # Track sequential numbers per year/department
        sequential_counters = {}
        
        updated_count = 0
        for student in students:
            student_id, first_name, last_name, department, admission_year, current_semester = student
            
            # Calculate year digit (1-4)
            current_year = 2024
            year_digit = current_year - admission_year + 1
            if year_digit < 1:
                year_digit = 1
            elif year_digit > 4:
                year_digit = 4
            
            # Get department code
            dept_code = dept_codes.get(department, '00')
            
            # Generate sequential number for this year/department combination
            key = f"{year_digit}{dept_code}"
            if key not in sequential_counters:
                sequential_counters[key] = 1
            else:
                sequential_counters[key] += 1
            
            sequential = sequential_counters[key]
            
            # Generate new roll number
            new_roll_number = f"SCOE{year_digit}{dept_code}{sequential:03d}"
            
            # Update the student
            db.execute(text('UPDATE students SET roll_number = :roll_number WHERE id = :id'), 
                      {'roll_number': new_roll_number, 'id': student_id})
            
            updated_count += 1
            print(f'✅ Updated {first_name} {last_name}: {new_roll_number} (Year {year_digit}, Dept {dept_code})')
        
        db.commit()
        print(f'\n🎉 Updated {updated_count} students with proper roll numbers!')
        
        # Show the new roll number distribution
        print(f'\n📊 Roll Number Distribution:')
        for key, count in sequential_counters.items():
            year = key[0]
            dept = key[1:3]
            dept_name = {v: k for k, v in dept_codes.items()}.get(dept, 'Unknown')
            print(f'  Year {year} {dept_name}: {count} students')
        
    except Exception as e:
        print(f'❌ Error: {e}')
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Fixing roll numbers to proper format...")
    fix_roll_numbers()
