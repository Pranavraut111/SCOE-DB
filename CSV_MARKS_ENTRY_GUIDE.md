# CSV Marks Entry Guide - Component-Based System

## ✅ **Marks Entry Tab Updated!**

The **Marks Entry** tab now uses the new component-based system with CSV upload support.

---

## 🎯 **How to Use:**

### **Step 1: Select Exam Event**
1. Go to **Examinations → Marks Entry tab**
2. Select your exam event (e.g., IA-1)

### **Step 2: Select Subject & Component**
1. **Select Subject:** Choose from dropdown (e.g., CS201 - Applied Mathematics II)
2. **Select Component:** Choose which exam this is:
   - **IA** - For IA1 or IA2 exams (25 marks each)
   - **OR** - For Oral/Viva exam (25 marks)
   - **ESE** - For End Semester exam (50 marks)

### **Step 3: Enter Marks**

You have **3 options:**

#### **Option 1: Manual Entry (UI)**
- Enter marks directly in the table
- Check "Absent" checkbox for absent students
- Click "Save All Marks"

#### **Option 2: Download Template → Edit → Upload**
1. Click **"Download CSV Template"**
2. Open the CSV file in Excel/Google Sheets
3. Edit the `marks_obtained` column
4. Set `is_absent` to `true` for absent students
5. Save the file
6. Click **"Upload CSV"** and select your file
7. Click **"Save All Marks"**

#### **Option 3: Create Your Own CSV**
Create a CSV file with this format:

```csv
student_id,roll_number,student_name,marks_obtained,is_absent
1,SCOE3001,Sneha Deshmukh,20,false
2,SCOE3002,Rahul Patil,22,false
3,SCOE3003,Priya Sharma,18,false
4,SCOE3004,Amit Kumar,0,true
```

Then upload it using "Upload CSV" button.

---

## 📊 **CSV Format Explained:**

| Column | Description | Example |
|--------|-------------|---------|
| `student_id` | Student's database ID | 1 |
| `roll_number` | Student's roll number | SCOE3001 |
| `student_name` | Student's full name | Sneha Deshmukh |
| `marks_obtained` | Marks scored (0 to max_marks) | 20 |
| `is_absent` | Was student absent? | false or true |

---

## 🎓 **Complete Workflow Example:**

### **Scenario: Enter marks for IA-1 exam**

**1. Create IA-1 Event**
- Name: IA-1
- Dates: 27/10/2025 - 28/10/2025

**2. Schedule Subjects**
- Go to Schedule tab
- Click "Schedule All Semester Subjects"

**3. Enroll Students**
- Go to Enrollment tab
- Enroll students

**4. Enter Marks for Each Subject**

**For CS201 - Applied Mathematics II:**
1. Go to Marks Entry tab
2. Select Subject: CS201
3. Select Component: IA (25 marks)
4. Download CSV template
5. Edit marks in Excel:
   ```csv
   student_id,roll_number,student_name,marks_obtained,is_absent
   1,SCOE3001,Sneha Deshmukh,20,false
   2,SCOE3002,Rahul Patil,22,false
   3,SCOE3003,Priya Sharma,18,false
   ```
6. Upload CSV
7. Click "Save All Marks"

**For CS204 - Engineering Graphics:**
1. Select Subject: CS204
2. Select Component: IA (25 marks)
3. Repeat the process

---

## 🔄 **For Multiple Exams:**

### **IA-1 Exam (September):**
- Subject: CS201, Component: IA → Enter marks
- Subject: CS204, Component: IA → Enter marks

### **IA-2 Exam (November):**
- Create new event: IA-2
- Subject: CS201, Component: IA → Enter marks (different event!)
- Subject: CS204, Component: IA → Enter marks

### **Oral Exam (December):**
- Create new event: Oral
- Subject: CS201, Component: OR → Enter marks
- Subject: CS204, Component: OR → Enter marks

### **End Semester Exam (December):**
- Create new event: End Semester
- Subject: CS201, Component: ESE → Enter marks
- Subject: CS204, Component: ESE → Enter marks

---

## 📈 **After Entering All Marks:**

Once you've entered marks for all 4 exams (IA1, IA2, Oral, ESE):

1. Go to **Results tab**
2. Select department and semester
3. Click **"Calculate All Subject Results"**
4. Click **"Calculate All SGPA/CGPA"**
5. View all students' results in the table!

---

## ✅ **Key Points:**

- ✅ **Same component, different events:** IA1 and IA2 both use "IA" component but different exam events
- ✅ **CSV upload saves time:** Upload marks for 100+ students in seconds
- ✅ **Validation:** System checks max marks automatically
- ✅ **Absent handling:** Mark students as absent, marks set to 0
- ✅ **Bulk save:** All marks saved in one click

---

## 🎯 **Benefits of CSV Upload:**

1. **Fast:** Enter marks for 100 students in 2 minutes
2. **Accurate:** Copy from Excel, no typing errors
3. **Flexible:** Edit offline, upload when ready
4. **Template:** Download pre-filled template with student names
5. **Backup:** Keep CSV files as backup

---

## 🐛 **Troubleshooting:**

**Q: CSV upload not working?**
- Check CSV format matches exactly
- Ensure no extra commas or quotes
- Use UTF-8 encoding

**Q: Marks not saving?**
- Check if subject and component are selected
- Verify marks don't exceed max marks
- Check browser console for errors

**Q: Students not showing?**
- Ensure students are enrolled for the exam event
- Check department and semester match

---

**Happy Marks Entry! 🎉**
