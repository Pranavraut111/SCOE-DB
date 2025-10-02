# SCOEFLOW CONNECT 🎓

A comprehensive student management system designed for modern educational institutions. This full-stack application provides seamless student data management, bulk operations, and intuitive user interfaces for both administrators and students.

![SCOEFLOW CONNECT](./scoe-logo.png)

## 🌟 Overview

SCOEFLOW CONNECT is a modern campus management platform that streamlines educational administration through:

- **Student Information Management**: Complete student lifecycle management with photo uploads
- **Bulk Operations**: Excel/CSV import/export with validation and error handling
- **Subject Management**: Comprehensive subject master with Mumbai University integration
- **Examination Management**: Complete exam lifecycle from creation to result generation
- **Role-based Access**: Separate portals for administrators and students
- **Data Analytics**: Export capabilities and reporting features
- **Modern UI**: Built with React, TypeScript, and shadcn/ui components

## 🏗️ Architecture

### System Architecture Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │    Database     │
│   (React TS)    │◄──►│   (FastAPI)      │◄──►│    (MySQL)      │
│                 │    │                  │    │                 │
│ • Landing Page  │    │ • REST APIs      │    │ • Students      │
│ • Admin Portal  │    │ • File Upload    │    │ • Subjects      │
│ • Student Portal│    │ • Data Export    │    │ • Examinations  │
│ • Exam Portal   │    │ • Exam Management│    │ • Relationships │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Project Structure

```
PROJECTSCOE2/
├── src/                          # Frontend React Application
│   ├── components/               # Reusable UI Components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── AdminLayout.tsx      # Admin dashboard layout
│   │   ├── BulkUpload.tsx       # File upload component
│   │   ├── LandingPage.tsx      # Homepage
│   │   ├── StudentEntryForm.tsx # Student creation form
│   │   ├── StudentList.tsx      # Student data grid
│   │   ├── StudentPortal.tsx    # Student dashboard
│   │   ├── SubjectMaster.tsx    # Subject management
│   │   ├── ExaminationManagement.tsx # Exam system main
│   │   ├── ExamEventForm.tsx    # Exam event creation
│   │   ├── ExamDashboard.tsx    # Exam statistics
│   │   ├── ExamScheduleManager.tsx # Exam scheduling
│   │   ├── StudentEnrollmentManager.tsx # Student enrollment
│   │   ├── MarksEntryManager.tsx # Marks entry system
│   │   └── ExamResultsViewer.tsx # Results and analytics
│   ├── pages/                   # Route components
│   │   ├── AdminDashboard.tsx   # Admin main page
│   │   ├── Index.tsx           # Landing page route
│   │   └── NotFound.tsx        # 404 page
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities and API client
│   └── types/                   # TypeScript definitions
├── backend/                      # FastAPI Backend
│   ├── app/
│   │   ├── api/                 # API routes
│   │   │   └── v1/endpoints/    # API endpoints
│   │   │       ├── students.py  # Student CRUD operations
│   │   │       ├── subjects.py  # Subject management
│   │   │       └── exams.py     # Examination management
│   │   ├── core/                # Core configuration
│   │   │   └── config.py        # App settings
│   │   ├── crud/                # Database operations
│   │   ├── db/                  # Database setup
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic
│   │   └── data/                # Static data (MU subjects)
│   ├── .env                     # Environment variables
│   └── requirements.txt         # Python dependencies
├── public/                       # Static assets
├── package.json                 # Node.js dependencies
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **MySQL** (v8.0 or higher)
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd PROJECTSCOE2
```

#### 2. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 4. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE student_management;
exit

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials
```

#### 5. Initialize Database

```bash
# Run database migrations
python init_db.py

# Initialize subject data
python init_subject_db.py
```

#### 6. Start Backend Server

```bash
# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

### 🏃‍♂️ Running the Application

Based on the memory from your previous demo setup, here are the simple commands:

**Frontend (React):**
```bash
npm run dev
```

**Backend (FastAPI):**
```bash
cd backend
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uvicorn app.main:app --reload
```

## 💻 Usage Guide

### Admin Portal (`/admin`)

The admin dashboard provides comprehensive management capabilities:

#### Student Management
- **Add Students**: Individual student entry with photo upload
- **Bulk Import**: Excel/CSV file upload with validation
- **Student List**: Searchable, sortable student directory
- **Export Data**: Download student data in Excel/CSV formats

#### Subject Management
- **Subject Master**: Manage academic subjects
- **Mumbai University Integration**: Pre-loaded MU subject database
- **Course Assignment**: Link subjects to students

#### Bulk Operations
1. **Download Template**: Get Excel template with proper headers
2. **Upload File**: Drag-and-drop or browse for Excel/CSV files
3. **Preview**: Validate data before import
4. **Import**: Process and save validated records

### Student Portal (`/student`)

Students can access their information by entering:
- Roll number (e.g., `SCOE1001`)
- Email address

**Features:**
- Personal information display
- Academic details and enrolled subjects
- Contact information
- Account statistics

### Landing Page (`/`)

- System overview and features
- Portal access buttons
- Institutional branding

### Examination Management (`/admin` - Examinations Tab)

The comprehensive examination management system handles the complete exam lifecycle:

#### Exam Event Management
- **Create Exam Events**: Define exam sessions (Mid-term, End-term, Internal, Practical, Viva, Project)
- **Event Configuration**: Set department, semester, academic year, and date ranges
- **Status Tracking**: Draft → Scheduled → Ongoing → Completed workflow
- **Event Selection**: Choose active exam event for all operations

#### Exam Scheduling
- **Subject-wise Scheduling**: Add individual exam sessions with date, time, and venue
- **Conflict Detection**: Automatic validation for venue and supervisor conflicts
- **Marks Configuration**: Set maximum marks and passing marks per subject
- **Timetable View**: Visual representation of exam schedule

#### Student Enrollment Management
- **Bulk Enrollment**: Automatically enroll all eligible students based on department/semester
- **Individual Enrollment**: Add specific students to exam events
- **Enrollment Status**: Track enrolled, absent, exempted, and disqualified students
- **Special Cases**: Handle backlog students and subject exemptions
- **Enrollment Statistics**: Real-time counts and analytics

#### Marks Entry System
- **Subject Selection**: Choose exam subject for marks entry
- **Attendance Tracking**: Mark students as present or absent
- **Individual Entry**: Enter marks for each student with validation
- **Bulk Entry**: Apply same marks to multiple students
- **Grade Calculation**: Automatic grade assignment based on marks
- **Validation**: Ensure marks are within valid range (0 to max marks)

#### Results and Analytics
- **Result Generation**: Calculate overall results, grades, and rankings
- **Statistics Dashboard**: Pass/fail rates, grade distribution, averages
- **Student Rankings**: Automatic ranking based on performance
- **Subject-wise Analysis**: Individual subject performance tracking
- **Export Results**: Download results in Excel format
- **Result Status**: Track passed, failed, and absent students

## 🔧 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Student Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/students/` | List all students with pagination |
| `POST` | `/students/` | Create new student |
| `GET` | `/students/{id}` | Get student by ID |
| `PUT` | `/students/{id}` | Update student |
| `DELETE` | `/students/{id}` | Delete student |
| `GET` | `/students/count` | Get total student count |
| `GET` | `/students/export/excel` | Export students to Excel |
| `GET` | `/students/export/csv` | Export students to CSV |
| `POST` | `/students/import/preview` | Preview import file |
| `POST` | `/students/import/save` | Import validated data |
| `GET` | `/students/import/template-new` | Download import template |

### Subject Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/subjects/` | List all subjects |
| `POST` | `/subjects/` | Create new subject |
| `GET` | `/subjects/{id}` | Get subject by ID |
| `PUT` | `/subjects/{id}` | Update subject |
| `DELETE` | `/subjects/{id}` | Delete subject |

### Examination Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/exams/events/` | List all exam events |
| `POST` | `/exams/events/` | Create new exam event |
| `GET` | `/exams/events/{id}` | Get exam event by ID |
| `PUT` | `/exams/events/{id}` | Update exam event |
| `DELETE` | `/exams/events/{id}` | Delete exam event |
| `GET` | `/exams/events/{id}/schedules/` | Get exam schedules for event |
| `POST` | `/exams/events/{id}/schedules/` | Add exam schedule to event |
| `GET` | `/exams/events/{id}/enrollments/` | Get student enrollments |
| `POST` | `/exams/events/{id}/enrollments/bulk` | Bulk enroll students |
| `GET` | `/exams/events/{id}/results/` | Get exam results |
| `POST` | `/exams/events/{id}/results/generate` | Generate exam results |
| `GET` | `/exams/events/{id}/results/statistics/` | Get result statistics |
| `GET` | `/exams/events/{id}/results/export` | Export results to Excel |
| `GET` | `/exams/schedules/{id}/student-exams/` | Get student exams for schedule |
| `POST` | `/exams/student-exams/bulk-marks` | Bulk update marks |
| `PUT` | `/exams/student-exams/{id}` | Update student exam |
| `GET` | `/exams/dashboard/overview` | Get exam dashboard data |

### Example API Calls

#### Create Student
```bash
curl -X POST "http://localhost:8000/api/v1/students/" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "middle_name": "Kumar",
    "last_name": "Doe",
    "email": "john.doe@gmail.com",
    "phone": "9876543210",
    "date_of_birth": "2000-01-15",
    "gender": "male",
    "address": "123 Main Street, Mumbai",
    "state": "1st Year",
    "country": "India",
    "admission_number": "SCOE1001",
    "roll_number": "SCOE1001",
    "institutional_email": "john.doe@scoe.edu.in",
    "department": "Computer Science Engineering",
    "category": "General",
    "mother_name": "Jane Doe"
  }'
```

#### Get Students with Search
```bash
curl "http://localhost:8000/api/v1/students/?search=john&limit=10&skip=0"
```

#### Create Exam Event
```bash
curl -X POST "http://localhost:8000/api/v1/exams/events/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mid-Term Examination 2024",
    "description": "Mid-term exams for Spring semester",
    "exam_type": "mid_term",
    "department": "Computer Science Engineering",
    "semester": 3,
    "academic_year": "2023-24",
    "start_date": "2024-03-15",
    "end_date": "2024-03-25",
    "instructions": "Bring valid ID and stationery"
  }'
```

#### Bulk Enroll Students
```bash
curl -X POST "http://localhost:8000/api/v1/exams/events/1/enrollments/bulk" \
  -H "Content-Type: application/json" \
  -d '{
    "exam_event_id": 1,
    "department": "Computer Science Engineering",
    "semester": 3,
    "enrolled_by": "Admin"
  }'
```

## 📊 Data Models

### Student Model

```python
class Student(Base):
    id: int
    first_name: str
    middle_name: str
    last_name: str
    email: str (unique)
    phone: str (unique)
    date_of_birth: date
    gender: Gender (male/female/other)
    address: str
    state: str  # Academic year
    country: str
    admission_number: str (unique)
    roll_number: str (unique)
    institutional_email: str (unique)
    department: str
    category: str  # General/OBC/SC/ST
    mother_name: str
```

### Subject Model

```python
class Subject(Base):
    id: int
    name: str
    code: str (unique)
    credits: int
    semester: int
    department: str
    description: str
```

### Examination Models

#### ExamEvent Model
```python
class ExamEvent(Base):
    id: int
    name: str
    description: str
    exam_type: ExamType (mid_term/end_term/internal/practical/viva/project)
    status: ExamStatus (draft/scheduled/ongoing/completed/cancelled)
    department: str
    semester: int
    academic_year: str
    start_date: date
    end_date: date
    instructions: str
    created_by: str
```

#### ExamSchedule Model
```python
class ExamSchedule(Base):
    id: int
    exam_event_id: int
    subject_id: int
    exam_date: date
    start_time: time
    end_time: time
    venue: str
    supervisor: str
    max_marks: int
    passing_marks: int
```

#### StudentExamEnrollment Model
```python
class StudentExamEnrollment(Base):
    id: int
    exam_event_id: int
    student_id: int
    enrollment_status: EnrollmentStatus (enrolled/absent/exempted/disqualified)
    enrollment_date: datetime
    is_backlog_student: bool
    exempted_subjects: str
    special_requirements: str
    notes: str
    enrolled_by: str
```

#### StudentExam Model
```python
class StudentExam(Base):
    id: int
    student_exam_enrollment_id: int
    exam_schedule_id: int
    student_id: int
    attendance_status: AttendanceStatus (present/absent)
    marks_obtained: float
    grade: str
    remarks: str
```

#### ExamResult Model
```python
class ExamResult(Base):
    id: int
    exam_event_id: int
    student_id: int
    total_marks: float
    total_max_marks: float
    percentage: float
    overall_grade: str
    result_status: ResultStatus (passed/failed/absent)
    gpa: float
    rank: int
    generated_at: datetime
```

## 🔄 Data Flow

### Student Registration Flow

```
1. Admin accesses Admin Portal
2. Chooses between individual entry or bulk upload
3. For bulk upload:
   a. Downloads template
   b. Fills data in Excel/CSV
   c. Uploads file
   d. System validates data
   e. Preview shows validation results
   f. Admin confirms import
   g. System generates roll numbers and emails
   h. Data saved to database
```

### Student Portal Access Flow

```
1. Student visits Student Portal
2. Enters roll number or email
3. System searches database
4. If found, displays student dashboard
5. Shows personal info, subjects, and stats
```

### Examination Management Flow

```
1. Create Exam Event
   a. Admin creates exam event (Mid-term/End-term/etc.)
   b. Sets department, semester, academic year
   c. Defines date range and instructions
   d. Event status: Draft → Scheduled

2. Schedule Exams
   a. Select exam event
   b. Add subject-wise exam schedules
   c. Set date, time, venue, supervisor
   d. Configure marks (max marks, passing marks)
   e. System validates for conflicts

3. Enroll Students
   a. Bulk enroll all eligible students OR
   b. Individual student enrollment
   c. Handle special cases (backlog, exemptions)
   d. Track enrollment statistics

4. Conduct Exams & Enter Marks
   a. Select exam schedule/subject
   b. Mark attendance (present/absent)
   c. Enter marks for present students
   d. Add remarks if needed
   e. System validates marks range
   f. Bulk save all entries

5. Generate Results
   a. Calculate total marks and percentage
   b. Assign grades based on performance
   c. Generate student rankings
   d. Create result statistics
   e. Export results to Excel

6. View Analytics
   a. Dashboard shows exam statistics
   b. Pass/fail rates and grade distribution
   c. Subject-wise performance analysis
   d. Student ranking and achievements
```

## 🛠️ Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
MYSQL_SERVER=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=student_management

# SMTP Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
```

### Department Configuration

The system supports these departments with auto-generated roll number ranges:

- **Computer Science Engineering**: SCOE1000-1999
- **Information Technology**: SCOE3000-3999
- **Electronics and Communication**: SCOE5000-5999
- **Electrical Engineering**: SCOE7000-7999
- **Mechanical Engineering**: SCOE8000-8999
- **Civil Engineering**: SCOE9000-9999

## 📁 File Upload Specifications

### Supported Formats
- Excel (.xlsx)
- CSV (.csv)

### Required Columns
| Column | Required | Format | Example |
|--------|----------|--------|---------|
| First Name | Yes | Text | John |
| Middle Name | Yes | Text | Kumar |
| Last Name | Yes | Text | Doe |
| Address | Yes | Text | 123 Main St, Mumbai |
| Gender | Yes | Male/Female | Male |
| Category | Yes | General/OBC/SC/ST | General |
| Date of Birth | Yes | YYYY-MM-DD | 2000-01-15 |
| Phone Number | Yes | 10 digits | 9876543210 |
| Branch | Yes | Full department name | Computer Science Engineering |
| Year | Yes | 1st/2nd/3rd/4th Year | 1st Year |
| Mother Name | Yes | Text | Jane Doe |

### General System
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Automated email notifications
- [ ] Integration with academic management systems
- [ ] Biometric authentication
- [ ] Multi-language support
- [ ] Advanced reporting with charts
- [ ] API rate limiting and authentication
- [ ] Real-time notifications
- [ ] Audit logging

### Examination System
- [ ] Online examination platform
- [ ] Automated question paper generation
- [ ] Anti-plagiarism detection
- [ ] Proctoring system integration
- [ ] Advanced result analytics with charts
- [ ] Parent/guardian result notifications
- [ ] Grade curve analysis
- [ ] Historical performance tracking
- [ ] Automated revaluation system
- [ ] Integration with external assessment tools
- [ ] Seating arrangement automation
- [ ] Hall ticket generation
- [ ] Answer sheet scanning and evaluation

---

**Built with ❤️ for modern educational institutions**

*SCOEFLOW CONNECT - Streamlining Campus Management*
