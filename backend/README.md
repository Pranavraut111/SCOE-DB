# Student Management System - Backend

A robust and scalable backend system for managing student information, built with FastAPI and MySQL. This system provides a comprehensive RESTful API for handling student data, authentication, and administrative functions.

## 🚀 Features

- **Student Management**: Full CRUD operations for student records
- **Authentication & Authorization**: Secure access control with JWT tokens
- **Search & Filtering**: Advanced search capabilities with pagination
- **Data Validation**: Input validation using Pydantic models
- **API Documentation**: Interactive OpenAPI/Swagger documentation
- **Testing**: Comprehensive test suite for API endpoints
- **Scalable Architecture**: Built with performance and scalability in mind

## 🛠️ Tech Stack

- **Framework**: FastAPI (Python 3.8+)
- **Database**: MySQL 8.0+
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: OpenAPI (Swagger UI and ReDoc)
- **Testing**: Pytest
- **Dependency Management**: pip
- **ASGI Server**: Uvicorn

## Prerequisites

- Python 3.8+
- MySQL Server 8.0+
- pip (Python package manager)

## Setup

1. **Clone the repository**

2. **Create a virtual environment and activate it**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up MySQL**
   - Make sure MySQL server is running
   - Create a new database:
     ```sql
     CREATE DATABASE student_management;
     ```

5. **Initialize the database**
   ```bash
   python init_db.py
   ```

## Running the Application

1. **Start the FastAPI development server**
   ```bash
   uvicorn app.main:app --reload
   ```

2. **Access the API documentation**
   - Open your browser and go to: http://localhost:8000/api/docs
   - This will show the interactive Swagger/OpenAPI documentation

## API Endpoints

### Students

- `POST /api/v1/students/` - Create a new student
- `GET /api/v1/students/` - List all students (with pagination and search)
- `GET /api/v1/students/count` - Get total count of students
- `GET /api/v1/students/{student_id}` - Get a specific student
- `PUT /api/v1/students/{student_id}` - Update a student
- `DELETE /api/v1/students/{student_id}` - Delete a student

## Environment Variables

The application uses the following environment variables (set in `app/core/config.py`):

- `MYSQL_SERVER`: MySQL server address (default: localhost)
- `MYSQL_USER`: MySQL username (default: root)
- `MYSQL_PASSWORD`: MySQL password (default: Pranav@2137)
- `MYSQL_DB`: MySQL database name (default: student_management)

## Testing

To run tests (you'll need to set up a test database first):

```bash
pytest
```

## Production Deployment

For production deployment, consider using:
- Gunicorn with Uvicorn workers
- A production-grade ASGI server
- Environment variables for configuration
- Proper database connection pooling
- HTTPS with a valid certificate

## License

This project is licensed under the MIT License.
