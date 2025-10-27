from fastapi import APIRouter
from app.api.v1.endpoints import students, subjects, exams, admin, enrollment_applications, results

api_router = APIRouter()
api_router.include_router(students.router, prefix="/students", tags=["students"])
api_router.include_router(subjects.router, prefix="/subjects", tags=["subjects"])
api_router.include_router(exams.router, prefix="/exams", tags=["exams"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(enrollment_applications.router, prefix="/enrollment-applications", tags=["enrollment-applications"])
api_router.include_router(results.router, prefix="/results", tags=["results"])
