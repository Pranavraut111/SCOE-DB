from datetime import datetime
import random
import re

def generate_roll_number(department: str = "", admission_year: int = 2024) -> str:
    """
    Generate roll number in format: SCOE + Year + Sequential
    Example: SCOE1001 (1st year, student #001)
    """
    # Determine year digit based on admission year
    current_year = 2024
    year_digit = current_year - admission_year + 1
    if year_digit < 1:
        year_digit = 1
    elif year_digit > 4:
        year_digit = 4
    
    # Generate sequential number (001-999)
    sequential = random.randint(1, 999)
    
    return f"SCOE{year_digit}{sequential:03d}"

def generate_institutional_email(full_name: str, department: str) -> str:
    """Generate institutional email based on name and department"""
    # Clean the name - remove extra spaces and special characters
    clean_name = re.sub(r'[^a-zA-Z\s]', '', full_name.lower())
    name_parts = clean_name.split()
    
    # Create email prefix from first and last name
    if len(name_parts) >= 2:
        first_name = name_parts[0]
        last_name = name_parts[-1]  # Take the last part as surname
        email_prefix = f"{first_name}.{last_name}"
    else:
        email_prefix = name_parts[0] if name_parts else 'student'
    
    # Map department to short abbreviations
    dept_domains = {
        'Computer Science Engineering': 'cse',
        'Information Technology': 'it',
        'Electronics and Communication Engineering': 'ece',
        'Electrical Engineering': 'ee',
        'Mechanical Engineering': 'me',
        'Civil Engineering': 'ce'
    }
    
    domain = dept_domains.get(department, 'general')
    
    return f"{email_prefix}@{domain}.scoe.edu.in"


