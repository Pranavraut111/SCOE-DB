#!/usr/bin/env python3
"""
Migration to add comprehensive result generation system
Creates 3 tables: student_exam_component_marks, subject_final_results, semester_results
"""

from sqlalchemy import create_engine, text
from app.core.config import settings

def run_migration():
    engine = create_engine(str(settings.DATABASE_URI))
    
    with engine.connect() as conn:
        print("🔄 Creating student_exam_component_marks table...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS student_exam_component_marks (
                id INT PRIMARY KEY AUTO_INCREMENT,
                student_id INT NOT NULL,
                subject_id INT NOT NULL,
                subject_component_id INT NOT NULL,
                exam_event_id INT NOT NULL,
                marks_obtained FLOAT NOT NULL DEFAULT 0.0,
                max_marks FLOAT NOT NULL,
                is_absent BOOLEAN DEFAULT FALSE,
                is_pass BOOLEAN DEFAULT FALSE,
                grade VARCHAR(5) NULL,
                marks_entered_by VARCHAR(100),
                marks_entered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                verified_by VARCHAR(100) NULL,
                verified_at DATETIME NULL,
                remarks TEXT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_component_id) REFERENCES subject_components(id) ON DELETE CASCADE,
                FOREIGN KEY (exam_event_id) REFERENCES exam_events(id) ON DELETE CASCADE,
                INDEX idx_student_subject (student_id, subject_id),
                INDEX idx_exam_event (exam_event_id),
                INDEX idx_component (subject_component_id),
                UNIQUE KEY unique_student_component_exam (student_id, subject_component_id, exam_event_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """))
        
        print("🔄 Creating subject_final_results table...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS subject_final_results (
                id INT PRIMARY KEY AUTO_INCREMENT,
                student_id INT NOT NULL,
                subject_id INT NOT NULL,
                academic_year VARCHAR(20) NOT NULL,
                semester INT NOT NULL,
                ia_marks FLOAT DEFAULT 0.0,
                ese_marks FLOAT DEFAULT 0.0,
                oral_marks FLOAT DEFAULT 0.0,
                practical_marks FLOAT DEFAULT 0.0,
                tw_marks FLOAT DEFAULT 0.0,
                total_marks_obtained FLOAT NOT NULL DEFAULT 0.0,
                total_max_marks FLOAT NOT NULL,
                percentage FLOAT DEFAULT 0.0,
                grade VARCHAR(5) NULL,
                grade_points FLOAT DEFAULT 0.0,
                is_pass BOOLEAN DEFAULT FALSE,
                credits_earned INT DEFAULT 0,
                ia_passing_status BOOLEAN DEFAULT FALSE,
                ese_passing_status BOOLEAN DEFAULT FALSE,
                oral_passing_status BOOLEAN DEFAULT FALSE,
                overall_passing_status BOOLEAN DEFAULT FALSE,
                is_backlog BOOLEAN DEFAULT FALSE,
                attempt_number INT DEFAULT 1,
                calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                calculated_by VARCHAR(100),
                remarks TEXT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                INDEX idx_student_year (student_id, academic_year),
                INDEX idx_semester (semester),
                INDEX idx_backlog (is_backlog),
                UNIQUE KEY unique_student_subject_year_attempt (student_id, subject_id, academic_year, attempt_number)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """))
        
        print("🔄 Creating semester_results table...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS semester_results (
                id INT PRIMARY KEY AUTO_INCREMENT,
                student_id INT NOT NULL,
                semester INT NOT NULL,
                academic_year VARCHAR(20) NOT NULL,
                total_credits_attempted INT NOT NULL DEFAULT 0,
                total_credits_earned INT NOT NULL DEFAULT 0,
                total_credit_points FLOAT NOT NULL DEFAULT 0.0,
                sgpa FLOAT DEFAULT 0.0,
                cgpa FLOAT DEFAULT 0.0,
                total_subjects INT NOT NULL DEFAULT 0,
                subjects_passed INT DEFAULT 0,
                subjects_failed INT DEFAULT 0,
                subjects_absent INT DEFAULT 0,
                overall_percentage FLOAT DEFAULT 0.0,
                total_marks_obtained FLOAT DEFAULT 0.0,
                total_max_marks FLOAT DEFAULT 0.0,
                result_status VARCHAR(50),
                result_class VARCHAR(100) NULL,
                backlog_subjects TEXT NULL,
                has_backlogs BOOLEAN DEFAULT FALSE,
                result_declared BOOLEAN DEFAULT FALSE,
                result_declared_at DATETIME NULL,
                result_declared_by VARCHAR(100) NULL,
                remarks TEXT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                INDEX idx_student (student_id),
                INDEX idx_semester_year (semester, academic_year),
                INDEX idx_declared (result_declared),
                UNIQUE KEY unique_student_semester_year (student_id, semester, academic_year)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """))
        
        conn.commit()
        print("✅ Migration completed successfully!")
        print("\n📋 Created tables:")
        print("  1. student_exam_component_marks - Tracks IA1, IA2, Oral, ESE marks separately")
        print("  2. subject_final_results - Aggregated final result per subject")
        print("  3. semester_results - Overall SGPA/CGPA per semester")
        print("\n💡 Next steps:")
        print("  - Add models to backend/app/models/exam.py")
        print("  - Create schemas in backend/app/schemas/results.py")
        print("  - Create API endpoints in backend/app/api/v1/endpoints/results.py")

if __name__ == "__main__":
    print("🚀 Starting migration to add result generation system...")
    print("=" * 70)
    run_migration()
