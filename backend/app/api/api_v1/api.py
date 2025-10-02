from fastapi import APIRouter
from app.api.v1.endpoints import students, subjects, exams

api_router = APIRouter()
api_router.include_router(students.router, prefix="/students", tags=["students"])
api_router.include_router(subjects.router, prefix="/subjects", tags=["subjects"])
api_router.include_router(exams.router, prefix="/exams", tags=["exams"])
# api_router.include_router(login.router, prefix="/login", tags=["login"])  # For future authentication
