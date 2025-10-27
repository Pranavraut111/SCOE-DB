# Simplified Exam Flow - 3 Events Only

## ✅ **Simplified Structure (As Per Teacher's Requirement)**

Instead of 4 events (IA1, IA2, Oral, ESE), we now use **3 events only:**

1. **IA (Internal Assessment)** - Single IA exam (25 marks)
2. **Oral/Viva** - Oral examination (25 marks)
3. **End Semester (ESE)** - Final exam (50 marks)

**Total: 100 marks** (25 + 25 + 50)

---

## 📋 **Complete Workflow**

### **Step 1: Create 3 Exam Events**

#### **Event 1: IA**
```
Name: IA - Semester 2
Exam Type: Internal Assessment
Department: Computer Science Engineering
Semester: 2
Dates: 27/10/2025 - 28/10/2025
```

#### **Event 2: Oral**
```
Name: Oral - Semester 2
Exam Type: Viva Voce
Department: Computer Science Engineering
Semester: 2
Dates: 05/12/2025 - 07/12/2025
```

#### **Event 3: End Semester**
```
Name: End Semester - Semester 2
Exam Type: End-Term Examination
Department: Computer Science Engineering
Semester: 2
Dates: 15/12/2025 - 20/12/2025
```

---

### **Step 2: Schedule Subjects for Each Event**

For each event:
1. Go to Schedule tab
2. Click "Schedule All Semester Subjects"
3. Subjects are automatically scheduled

---

### **Step 3: Enroll Students**

For each event:
1. Go to Enrollment tab
2. Click "Add All Eligible Students"
3. Students are enrolled

---

### **Step 4: Enter Marks Using Master CSV**

#### **For IA Event:**

1. Go to **Marks Entry tab**
2. Select **IA event**
3. Click **"Download Master CSV Template"**
4. Edit in Excel:

```csv
roll_number,student_name,CS201,CS204
SCOE1021,Akash Sunil Jadhav,20,22
SCOE1022,Priya Sharma,18,20
```

5. **Upload CSV**
6. **Preview Table Shows:**
   - All marks displayed
   - **Red highlighting** if marks exceed max (e.g., 80 entered when max is 20)
   - Error message: "⚠️ Exceeds max marks (20)"
7. **Fix errors** in Excel and re-upload
8. **Click "Save All Marks"** ✅

#### **For Oral Event:**

Same process, but marks out of 25

#### **For End Semester Event:**

Same process, but marks out of 50

---

## ✅ **New Validation Feature**

### **Marks Validation in Preview:**

When you upload CSV, the system now:

1. **Checks component max marks** for each subject
2. **Highlights errors in RED** if:
   - Marks exceed maximum (e.g., 80 when max is 20)
   - Marks are negative
3. **Shows error message** below the cell
4. **Prevents saving** until all errors are fixed

### **Example:**

If IA component max marks = 20, and you enter 80:

```
Preview Table:
┌────────────┬──────────────┬─────────┐
│ Roll No    │ Student Name │  CS201  │
├────────────┼──────────────┼─────────┤
│ SCOE1021   │ Akash Jadhav │   80    │ ← RED BACKGROUND
│            │              │ ⚠️ Exceeds max marks (20)
└────────────┴──────────────┴─────────┘
```

**Save button disabled** until you fix it to 20 or less.

---

## 📊 **Result Calculation**

After entering marks for all 3 events:

### **Step 1: Calculate Subject Results**

Go to **Results tab** and click **"Calculate All Subject Results"**

This aggregates:
- IA marks (25)
- Oral marks (25)
- ESE marks (50)
- **Total: 100 marks**

Calculates:
- Grade (A+, A, B+, etc.)
- Grade points
- Pass/Fail status

### **Step 2: Calculate SGPA/CGPA**

Click **"Calculate All SGPA/CGPA"**

This computes:
- SGPA = Σ(credits × grade_points) / Σ(credits)
- CGPA (if previous semesters exist)
- Result class (First Class with Distinction, etc.)

### **Step 3: View Results**

Results tab shows table with:
- Roll Number
- Student Name
- Subjects Passed/Failed
- Credits Earned
- **SGPA**
- **CGPA**
- Result Status
- Result Class

---

## 🎯 **Key Benefits**

### **1. Simplified Structure**
- Only 3 events instead of 4
- Easier to manage
- Follows teacher's requirement

### **2. Validation**
- Prevents invalid marks entry
- Shows errors in preview
- Must fix before saving

### **3. Component-Based**
- Each exam (IA, Oral, ESE) tracked separately
- Proper aggregation for final result
- Mumbai University compliant

### **4. Master CSV**
- One CSV for all subjects
- Fast bulk entry
- Preview before save

---

## ⚠️ **Important Notes**

### **Component Max Marks:**

Make sure in **Subject Master**, each subject has components with correct max marks:

```
Subject: CS201 - Applied Mathematics II
├─ IA Component: 25 marks
├─ OR Component: 25 marks
└─ ESE Component: 50 marks
```

### **Validation Rules:**

1. **Marks cannot exceed component max marks**
   - If IA max = 25, cannot enter 30
2. **Marks cannot be negative**
   - Cannot enter -5
3. **Preview shows errors in RED**
   - Fix in Excel and re-upload
4. **Cannot save with errors**
   - All marks must be valid

---

## 📝 **Example Scenario**

### **Semester 2 - Computer Science**

**Subjects:**
- CS201 - Applied Mathematics II
- CS204 - Engineering Graphics

**Events:**
1. IA (25 marks each subject)
2. Oral (25 marks each subject)
3. End Semester (50 marks each subject)

**Marks Entry:**

**IA Event:**
```csv
roll_number,student_name,CS201,CS204
SCOE1021,Akash Jadhav,20,22
SCOE1022,Priya Sharma,18,20
```

**Oral Event:**
```csv
roll_number,student_name,CS201,CS204
SCOE1021,Akash Jadhav,20,18
SCOE1022,Priya Sharma,22,20
```

**End Semester Event:**
```csv
roll_number,student_name,CS201,CS204
SCOE1021,Akash Jadhav,40,38
SCOE1022,Priya Sharma,42,40
```

**Final Result for SCOE1021 - CS201:**
- IA: 20
- Oral: 20
- ESE: 40
- **Total: 80/100**
- **Grade: A**
- **Grade Points: 9**

**SGPA Calculation:**
```
CS201: 80/100 = A (9 points) × 4 credits = 36
CS204: 78/100 = A (9 points) × 3 credits = 27
Total: 63 points / 7 credits = SGPA 9.0
```

---

## ✅ **Summary**

1. **3 Events Only:** IA, Oral, End Semester
2. **Master CSV:** One file for all subjects
3. **Validation:** Red highlights for errors
4. **Preview:** Review before saving
5. **Result Aggregation:** Automatic calculation
6. **SGPA/CGPA:** Mumbai University compliant

**Simple, practical, and teacher-approved!** 🎉
