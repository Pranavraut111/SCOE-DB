#!/usr/bin/env python3
"""
Initialize Subject Master database tables and populate with Computer Engineering catalog
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.models.subject import Subject, SubjectCatalog, SubjectComponent, Department, Semester
from app.data.mu_subjects import ALL_DEPARTMENT_SUBJECTS, ELECTIVE_SUBJECTS
from app.db.base_class import Base

def init_db() -> None:
    """Initialize database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully")

def populate_subject_catalog(db: Session) -> None:
    """Populate subject catalog with Computer Engineering subjects"""
    print("Populating subject catalog...")
    
    # Clear existing catalog for all departments
    db.query(SubjectCatalog).delete()
    
    # Add subjects for all departments
    total_subjects = 0
    for department, department_subjects in ALL_DEPARTMENT_SUBJECTS.items():
        for semester, subjects in department_subjects.items():
            for subject_data in subjects:
                catalog_entry = SubjectCatalog(
                    department=department,
                    semester=semester,
                    **subject_data
                )
                db.add(catalog_entry)
                total_subjects += 1
    
    # Add elective subjects (for Sem VII & VIII)
    for subject_data in ELECTIVE_SUBJECTS:
        for sem in [Semester.VII, Semester.VIII]:
            catalog_entry = SubjectCatalog(
                department=Department.COMPUTER_SCIENCE_ENGINEERING,
                semester=sem,
                **subject_data
            )
            db.add(catalog_entry)
            total_subjects += 1
    
    db.commit()
    print(f"✓ Added {total_subjects} Computer Engineering subjects to catalog")

def create_sample_subjects(db: Session) -> None:
    """Create some sample subjects for demonstration"""
    print("Creating sample subjects...")
    
    # Sample subjects for current academic year
    current_year = "2024-25"
    
    sample_subjects = [
        {
            "year": current_year,
            "scheme": "2019",
            "department": Department.COMPUTER_SCIENCE_ENGINEERING,
            "semester": Semester.III,
            "subject_code": "CEC301",
            "subject_name": "Applied Mathematics III",
            "credits": 3,
            "overall_passing_criteria": 40.0,
            "components": [
                {"component_type": "ESE", "out_of_marks": 80, "passing_marks": 32, "is_enabled": True},
                {"component_type": "IA", "out_of_marks": 20, "passing_marks": 8, "is_enabled": True}
            ]
        },
        {
            "year": current_year,
            "scheme": "2019",
            "department": Department.COMPUTER_SCIENCE_ENGINEERING,
            "semester": Semester.IV,
            "subject_code": "CEC401",
            "subject_name": "Database Management Systems",
            "credits": 3,
            "overall_passing_criteria": 40.0,
            "components": [
                {"component_type": "ESE", "out_of_marks": 60, "passing_marks": 24, "is_enabled": True},
                {"component_type": "IA", "out_of_marks": 20, "passing_marks": 8, "is_enabled": True},
                {"component_type": "TW", "out_of_marks": 20, "passing_marks": 8, "is_enabled": True}
            ]
        }
    ]
    
    for subject_data in sample_subjects:
        components_data = subject_data.pop("components")
        
        # Create subject
        subject = Subject(**subject_data)
        db.add(subject)
        db.flush()  # Get the ID
        
        # Create components
        for comp_data in components_data:
            component = SubjectComponent(
                subject_id=subject.id,
                **comp_data
            )
            db.add(component)
    
    db.commit()
    print(f"✓ Created {len(sample_subjects)} sample subjects")

def main():
    """Main initialization function"""
    print("🚀 Initializing Subject Master Database...")
    print("=" * 50)
    
    try:
        # Initialize database tables
        init_db()
        
        # Create database session
        db = SessionLocal()
        
        try:
            # Populate subject catalog
            populate_subject_catalog(db)
            
            # Create sample subjects
            create_sample_subjects(db)
            
            print("=" * 50)
            print("✅ Subject Master database initialized successfully!")
            print("\nNext steps:")
            print("1. Start the backend server: cd backend && python -m uvicorn app.main:app --reload")
            print("2. Access the Subject Master form in your frontend")
            print("3. The catalog is pre-populated with MU Computer Engineering subjects")
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
