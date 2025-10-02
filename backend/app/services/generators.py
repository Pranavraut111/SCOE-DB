from datetime import datetime
import random
import re

def generate_roll_number(_: str = "", __: str = "") -> str:
    number = random.randint(0, 9999)
    return f"SCOE{str(number).zfill(4)}"

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


