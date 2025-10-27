"""
Service for calculating grades, SGPA, CGPA
Mumbai University grading system
"""

from typing import Tuple, List


class ResultCalculator:
    """Service for calculating grades, SGPA, CGPA"""
    
    @staticmethod
    def calculate_grade(percentage: float) -> Tuple[str, float]:
        """
        Calculate grade and grade points from percentage
        Mumbai University Grading Scale
        
        Returns: (grade, grade_points)
        """
        if percentage >= 80:
            return ("A+", 10.0)
        elif percentage >= 70:
            return ("A", 9.0)
        elif percentage >= 60:
            return ("B+", 8.0)
        elif percentage >= 55:
            return ("B", 7.0)
        elif percentage >= 50:
            return ("C", 6.0)
        elif percentage >= 40:
            return ("D", 5.0)
        else:
            return ("F", 0.0)
    
    @staticmethod
    def calculate_sgpa(credit_points: List[float], credits: List[int]) -> float:
        """
        Calculate SGPA (Semester Grade Point Average)
        SGPA = Σ(credits × grade_points) / Σ(credits)
        
        Args:
            credit_points: List of (credits × grade_points) for each subject
            credits: List of credits for each subject
            
        Returns:
            SGPA rounded to 2 decimal places
        """
        total_credit_points = sum(credit_points)
        total_credits = sum(credits)
        return round(total_credit_points / total_credits, 2) if total_credits > 0 else 0.0
    
    @staticmethod
    def calculate_cgpa(all_semester_sgpas: List[float], all_semester_credits: List[int]) -> float:
        """
        Calculate CGPA (Cumulative Grade Point Average)
        CGPA = Σ(SGPA × Credits) / Σ(Credits) for all semesters
        
        Args:
            all_semester_sgpas: List of SGPA for each semester
            all_semester_credits: List of total credits for each semester
            
        Returns:
            CGPA rounded to 2 decimal places
        """
        weighted_sum = sum(sgpa * credits for sgpa, credits in zip(all_semester_sgpas, all_semester_credits))
        total_credits = sum(all_semester_credits)
        return round(weighted_sum / total_credits, 2) if total_credits > 0 else 0.0
    
    @staticmethod
    def determine_result_class(cgpa: float) -> str:
        """
        Determine result class based on CGPA
        Mumbai University Classification
        
        Args:
            cgpa: Cumulative Grade Point Average
            
        Returns:
            Result class string
        """
        if cgpa >= 7.5:
            return "First Class with Distinction"
        elif cgpa >= 6.0:
            return "First Class"
        elif cgpa >= 5.0:
            return "Second Class"
        elif cgpa >= 4.0:
            return "Pass Class"
        else:
            return "Fail"
    
    @staticmethod
    def check_component_passing(marks_obtained: float, max_marks: float, passing_percentage: float = 40.0) -> bool:
        """
        Check if student passed a component
        
        Args:
            marks_obtained: Marks scored by student
            max_marks: Maximum marks for the component
            passing_percentage: Minimum percentage required (default 40%)
            
        Returns:
            True if passed, False otherwise
        """
        if max_marks == 0:
            return False
        percentage = (marks_obtained / max_marks) * 100
        return percentage >= passing_percentage


# Singleton instance
result_calculator = ResultCalculator()
