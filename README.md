# SCOEFLOW CONNECT 🎓

A comprehensive campus management system for modern educational institutions. Full-stack application with student management, examination system, and Mumbai University-compliant result generation.

---

## 🌟 Key Features

### **Student Management**
- ✅ Complete student information system with photo uploads
- ✅ Bulk import/export via Excel/CSV with validation
- ✅ Search, filter, and pagination
- ✅ Student authentication with secure password management
- ✅ Student portal for exam enrollment and result viewing

### **Authentication & Security**
- ✅ Admin authentication with environment-based credentials
- ✅ Student login with institutional email
- ✅ Bcrypt password hashing
- ✅ Session management and logout functionality
- ✅ Password change capability

### **Subject Master**
- ✅ Mumbai University subject catalog (6 departments)
- ✅ Component configuration (IA 20 marks, Viva 20 marks, ESE 60 marks)
- ✅ Credit system and passing criteria
- ✅ Department and semester-wise organization

### **Examination Management**
- ✅ Exam event creation (IA, Oral, ESE, Semester)
- ✅ Exam scheduling with venue and timing
- ✅ Student enrollment application system
- ✅ Admin approval/rejection workflow
- ✅ Component-wise marks entry
- ✅ Attendance tracking

### **Result Generation (Mumbai University Style)**
- ✅ Component-based marks tracking (IA 20 marks, Viva 20 marks, ESE 60 marks)
- ✅ **Component-wise passing enforcement** - Students must pass each component individually
- ✅ Automatic grade calculation (A+ to F)
- ✅ SGPA/CGPA computation
- ✅ Result class determination (First Class with Distinction, etc.)
- ✅ Detailed subject-wise result view
- ✅ CSV export with complete breakdown
- ✅ Publish results to students
- ✅ Student result download from portal

---

## 🏗️ Technology Stack

### **Frontend**
- React 18 + TypeScript
- Vite (Build tool)
- TailwindCSS (Styling)
- shadcn/ui (Component library)
- React Hook Form + Zod (Form validation)
- Axios (HTTP client)
- Lucide React (Icons)

### **Backend**
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- MySQL (Database)
- Pydantic (Data validation)
- Bcrypt (Password hashing)
- Python-Jose (JWT tokens)

### **Database**
- MySQL 8.0+
- 13 tables with proper relationships
- Foreign key constraints
- Unique constraints on critical fields

---

## 📊 Database Schema

### **Core Tables**
1. **students** - Student information + authentication
2. **subjects** - Subject master with component configuration
3. **subject_components** - IA, Viva, ESE configuration
4. **exam_events** - Exam sessions
5. **exam_schedules** - Exam timetable

### **Enrollment Tables**
6. **student_enrollment_applications** - Student applications
7. **student_exam_enrollments** - Approved enrollments

### **Results Tables**
8. **student_exam_component_marks** - Component-wise marks (IA, Viva, ESE)
9. **subject_final_results** - Aggregated subject results with grades
10. **semester_results** - SGPA/CGPA results
11. **published_results** - Published results tracking

### **Supporting Tables**
12. **student_progression_history** - Academic progression
13. **student_exams** - Legacy system (parallel)

---

## 🚀 Getting Started

### **Prerequisites**
- Python 3.9+
- Node.js 18+
- MySQL 8.0+

### **Backend Setup**

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# Initialize database
python init_db.py
python init_subject_db.py

# Run migrations
python migrate_add_password.py
python migrate_add_enrollment_applications.py
python migrate_add_result_system.py
python migrate_add_student_progression.py
python migrate_add_published_results.py

# Start server
uvicorn app.main:app --reload
```

**Backend runs on:** `http://localhost:8000`

### **Frontend Setup**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

---

## 🔐 Default Credentials

### **Admin Portal** (`/admin`)
- **Email:** `Praut1086@gmail.com`
- **Password:** `admin123`

### **Student Portal** (`/student`)
- **Email:** Any student's institutional email (e.g., `harsh.shah@gmail.com`)
- **Password:** `Student@123` (default for all students)

---

## 📱 Application Routes

### **Public Routes**
- `/` - Landing page
- `/admin` - Admin login
- `/student` - Student login

### **Admin Portal Features**
- Student Management (Add, Edit, Delete, Bulk Upload)
- Subject Master
- Examination Management
  - Create Exam Events
  - Schedule Exams
  - Review Enrollment Applications
  - Enter Component Marks
  - Calculate Results
  - Publish Results

### **Student Portal Features**
- View Profile
- Exam Notifications
- Apply for Exams
- Download Results (CSV)
- Change Password

---

## 🎯 Key Workflows

### **1. Student Enrollment Workflow**
1. Admin creates exam event
2. Admin schedules exam
3. Student sees notification in portal
4. Student applies for exam
5. Admin reviews and approves/rejects
6. Approved students are enrolled

### **2. Marks Entry & Result Generation**
1. Admin enters IA1 marks → `student_exam_component_marks`
2. Admin enters IA2 marks → `student_exam_component_marks`
3. Admin enters Oral marks → `student_exam_component_marks`
4. Admin enters ESE marks → `student_exam_component_marks`
5. Admin clicks "Calculate All Subject Results"
   - System checks if student passed EACH component
   - Calculates total marks and percentage
   - Assigns grade (A+ to F)
   - Stores in `subject_final_results`
6. Admin clicks "Calculate All SGPA/CGPA"
   - Computes SGPA = Σ(credits × grade_points) / Σ(credits)
   - Determines result class
   - Stores in `semester_results`
7. Admin clicks "Publish Results to Students"
   - Creates entries in `published_results`
   - Students can now download results

### **3. Student Result Download**
1. Student logs into portal
2. Clicks "Download Result" button
3. System fetches detailed result with all subject marks
4. Downloads CSV with:
   - Roll number, name
   - Subject-wise marks (IA, Viva, ESE)
   - Total marks, percentage, grade
   - SGPA, CGPA, Result Class

---

## 🎓 Mumbai University Compliance

### **Grading Scale**
| Grade | Grade Points | Percentage |
|-------|-------------|------------|
| A+    | 10          | 80-100%    |
| A     | 9           | 70-79%     |
| B+    | 8           | 60-69%     |
| B     | 7           | 55-59%     |
| C     | 6           | 50-54%     |
| D     | 5           | 40-49%     |
| F     | 0           | 0-39%      |

### **Component-Wise Passing**
- Student must pass EACH component (IA, Viva, ESE) individually
- Passing marks: Typically 40% of max marks for each component
- Overall percentage must also be >= 40%
- **Example:** Student with 50% total but failed IA = FAIL

### **Result Class**
- **First Class with Distinction**: SGPA >= 7.5
- **First Class**: SGPA >= 6.0
- **Second Class**: SGPA >= 5.0
- **Pass Class**: SGPA >= 4.0
- **Fail**: SGPA < 4.0

---

## 📂 Project Structure

```
PROJECTSCOE2/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # API routes
│   │   ├── core/                # Config, security
│   │   ├── db/                  # Database setup
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic
│   │   └── data/                # Mumbai University subjects
│   ├── migrations/              # Database migrations
│   ├── .env                     # Environment variables
│   └── requirements.txt         # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── StudentPortal.tsx
│   │   │   ├── ExaminationManagement.tsx
│   │   │   ├── ComponentMarksEntrySimple.tsx
│   │   │   ├── ResultsManager.tsx
│   │   │   ├── DetailedResultSheet.tsx
│   │   │   └── ...
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utilities
│   │   └── types/              # TypeScript types
│   └── package.json            # Node dependencies
│
├── data/
│   └── templates/              # Excel/CSV templates
│
├── database_schema.txt         # Database documentation
└── README.md                   # This file
```

---

## 🔧 API Endpoints

### **Authentication**
- `POST /api/v1/admin/auth/login` - Admin login
- `POST /api/v1/students/auth/login` - Student login
- `POST /api/v1/students/auth/change-password` - Change password

### **Students**
- `GET /api/v1/students/` - List students
- `POST /api/v1/students/` - Create student
- `PUT /api/v1/students/{id}` - Update student
- `DELETE /api/v1/students/{id}` - Delete student
- `POST /api/v1/students/bulk-upload` - Bulk import

### **Subjects**
- `GET /api/v1/subjects/` - List subjects
- `POST /api/v1/subjects/` - Create subject
- `GET /api/v1/subjects/catalog` - Get subject catalog

### **Examinations**
- `POST /api/v1/exams/events` - Create exam event
- `POST /api/v1/exams/schedules` - Schedule exam
- `GET /api/v1/enrollment-applications/` - List applications
- `PUT /api/v1/enrollment-applications/{id}/approve` - Approve application

### **Results**
- `POST /api/v1/results/marks/component/bulk` - Enter component marks
- `POST /api/v1/results/subject/calculate` - Calculate subject result
- `POST /api/v1/results/semester/calculate` - Calculate SGPA/CGPA
- `POST /api/v1/results/publish` - Publish results to students
- `GET /api/v1/results/detailed-result-sheet/{student_id}` - Get detailed result
- `GET /api/v1/results/student-published/{student_id}` - Get published results

---

## 🎨 UI Components

### **Admin Portal**
- Dashboard with statistics
- Student list with search and filters
- Bulk upload with drag-and-drop
- Subject master form
- Exam event creation
- Marks entry interface
- Results calculation and publishing
- Detailed result view with subject breakdown

### **Student Portal**
- Profile information
- Exam notifications
- Enrollment application form
- Result download button
- Password change dialog

---

## 📈 Features Implemented

### ✅ **Completed Features**
- [x] Student CRUD operations
- [x] Bulk import/export (Excel/CSV)
- [x] Admin authentication
- [x] Student authentication
- [x] Subject master with components
- [x] Exam event management
- [x] Exam scheduling
- [x] Student enrollment applications
- [x] Component-based marks entry
- [x] Component-wise passing enforcement
- [x] SGPA/CGPA calculation
- [x] Result class determination
- [x] Detailed result view
- [x] Result publishing system
- [x] Student result download
- [x] CSV export with subject details

### 🚧 **Future Enhancements**
- [ ] PDF result generation
- [ ] Email notifications
- [ ] Attendance management
- [ ] Fee management
- [ ] Library management
- [ ] Timetable generation
- [ ] Mobile app
- [ ] Analytics dashboard
- [ ] Report generation

---

## 🐛 Troubleshooting

### **Backend Issues**

**Database connection error:**
```bash
# Check MySQL is running
mysql -u root -p

# Verify credentials in .env file
cat backend/.env

# Recreate database
mysql -u root -p
CREATE DATABASE student_management;
```

**Migration errors:**
```bash
# Run migrations in order
python migrate_add_password.py
python migrate_add_enrollment_applications.py
python migrate_add_result_system.py
python migrate_add_student_progression.py
python migrate_add_published_results.py
```

### **Frontend Issues**

**Port already in use:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
npm run dev
```

**Module not found:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Environment Variables

### **Backend (.env)**
```env
# Database
DATABASE_URL=mysql+pymysql://root:password@localhost/student_management

# Admin Credentials
ADMIN_EMAIL=Praut1086@gmail.com
ADMIN_PASSWORD=admin123

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 🤝 Contributing

This is an academic project for educational purposes. Feel free to fork and modify for your institution's needs.

---

## 📄 License

This project is for educational purposes. All rights reserved.

---

## 👨‍💻 Author

**Pranav Raut**
- Email: Praut1086@gmail.com
- Institution: Saraswati College of Engineering (SCOE)

---

## 🙏 Acknowledgments

- Mumbai University for grading standards
- FastAPI for excellent Python web framework
- shadcn/ui for beautiful React components
- React ecosystem for powerful frontend tools

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the database schema documentation
3. Contact: Praut1086@gmail.com

---

**Version:** 2.0  
**Last Updated:** October 28, 2025  
**Status:** Production Ready ✅

---

## 🎯 Quick Start Summary

```bash
# Backend
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm run dev

# Access
Admin: http://localhost:5173/admin
Student: http://localhost:5173/student
```

**Ready for your viva! 🎓🚀**
