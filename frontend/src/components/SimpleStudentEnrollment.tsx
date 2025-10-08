import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  Upload, 
  Download, 
  Search
} from "lucide-react";

interface ExamEvent {
  id: number;
  name: string;
  department: string;
  semester: number;
  start_date: string;
  end_date: string;
}

interface Student {
  id: number;
  roll_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone?: string;
  department: string;
  year: string;
}

interface StudentEnrollment {
  id: number;
  student: Student;
  enrollment_status: string;
  enrollment_date: string;
}

interface SimpleStudentEnrollmentProps {
  examEvent: ExamEvent;
}

const SimpleStudentEnrollment = ({ examEvent }: SimpleStudentEnrollmentProps) => {
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Manual Add States
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({
    roll_number: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: examEvent.department,
    semester: examEvent.semester,
    year: `${examEvent.semester <= 2 ? '1st' : examEvent.semester <= 4 ? '2nd' : examEvent.semester <= 6 ? '3rd' : '4th'} Year`
  });

  // Excel Import States
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, [examEvent.id]);

  const fetchEnrollments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/exams/events/${examEvent.id}/enrollments/`);
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.roll_number || !newStudent.first_name || !newStudent.last_name || !newStudent.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Roll Number, First Name, Last Name, Email)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First create/find the student
      const studentResponse = await fetch('/api/v1/students/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent),
      });

      if (studentResponse.ok) {
        const student = await studentResponse.json();
        
        // Then enroll the student in the exam
        const enrollmentResponse = await fetch('/api/v1/exams/enrollments/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exam_event_id: examEvent.id,
            student_id: student.id,
            enrollment_status: 'enrolled'
          }),
        });

        if (enrollmentResponse.ok) {
          toast({
            title: "Student Added",
            description: `${newStudent.first_name} ${newStudent.last_name} has been enrolled successfully`,
          });
          
          // Reset form
          setNewStudent({
            roll_number: '',
            first_name: '',
            middle_name: '',
            last_name: '',
            email: '',
            phone: '',
            department: examEvent.department,
            semester: examEvent.semester,
            year: `${examEvent.semester <= 2 ? '1st' : examEvent.semester <= 4 ? '2nd' : examEvent.semester <= 6 ? '3rd' : '4th'} Year`
          });
          setShowAddDialog(false);
          fetchEnrollments();
        } else {
          throw new Error('Failed to enroll student');
        }
      } else {
        throw new Error('Failed to create student');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      // Fetch demo students from API
      const response = await fetch(`http://localhost:8000/api/v1/students/demo/template-data?department=${encodeURIComponent(examEvent.department)}&limit=5`);
      
      let demoStudents = [];
      if (response.ok) {
        demoStudents = await response.json();
      } else {
        // Fallback to hardcoded data
        demoStudents = [
          {
            roll_number: "SCOE101", first_name: "Aarav", middle_name: "Rajesh", last_name: "Sharma",
            email: "aarav.sharma@gmail.com", phone: "9876543210", department: examEvent.department, year: "1st Year"
          },
          {
            roll_number: "SCOE102", first_name: "Priya", middle_name: "Suresh", last_name: "Patel",
            email: "priya.patel@gmail.com", phone: "9876543211", department: examEvent.department, year: "1st Year"
          }
        ];
      }

      // Create CSV template with dynamic data
      let template = 'roll_number,first_name,middle_name,last_name,email,phone,department,semester,year\n';
      
      demoStudents.forEach(student => {
        template += `${student.roll_number},${student.first_name},${student.middle_name || ''},${student.last_name},${student.email},${student.phone},${examEvent.department},${examEvent.semester},${student.year}\n`;
      });

      // Create CSV file with proper encoding
      const blob = new Blob(['\ufeff' + template], { 
        type: 'text/csv;charset=utf-8' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student_enrollment_template_${examEvent.department}_sem${examEvent.semester}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Template Downloaded",
        description: "CSV template with realistic demo data has been downloaded. Modify the data as needed and upload the CSV file.",
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('exam_event_id', examEvent.id.toString());

      const response = await fetch(`/api/v1/students/import/save`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Import Successful",
          description: `${result.enrolled_count || 0} students imported successfully`,
        });
        setShowImportDialog(false);
        setSelectedFile(null);
        fetchEnrollments();
      } else {
        throw new Error('Failed to import students');
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import students. Please check your file format.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${enrollment.student.first_name} ${enrollment.student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Enrollment - {examEvent.name}
              </CardTitle>
              <CardDescription>
                Manage student enrollments for {examEvent.department} - Semester {examEvent.semester}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {/* Add Student Manually */}
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Student Manually</DialogTitle>
                    <DialogDescription>
                      Enter student details to enroll them in this exam
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="roll_number">Roll Number *</Label>
                        <Input
                          id="roll_number"
                          value={newStudent.roll_number}
                          onChange={(e) => setNewStudent(prev => ({...prev, roll_number: e.target.value.toUpperCase()}))}
                          placeholder="CS001"
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newStudent.email}
                          onChange={(e) => setNewStudent(prev => ({...prev, email: e.target.value}))}
                          placeholder="student@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="first_name">First Name *</Label>
                        <Input
                          id="first_name"
                          value={newStudent.first_name}
                          onChange={(e) => setNewStudent(prev => ({...prev, first_name: e.target.value}))}
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <Label htmlFor="middle_name">Middle Name</Label>
                        <Input
                          id="middle_name"
                          value={newStudent.middle_name}
                          onChange={(e) => setNewStudent(prev => ({...prev, middle_name: e.target.value}))}
                          placeholder="M"
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Last Name *</Label>
                        <Input
                          id="last_name"
                          value={newStudent.last_name}
                          onChange={(e) => setNewStudent(prev => ({...prev, last_name: e.target.value}))}
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newStudent.phone}
                          onChange={(e) => setNewStudent(prev => ({...prev, phone: e.target.value}))}
                          placeholder="9876543210"
                        />
                      </div>
                      <div>
                        <Label htmlFor="semester">Semester</Label>
                        <Input
                          id="semester"
                          type="number"
                          min="1"
                          max="8"
                          value={newStudent.semester}
                          onChange={(e) => setNewStudent(prev => ({...prev, semester: parseInt(e.target.value) || examEvent.semester}))}
                          placeholder={examEvent.semester.toString()}
                        />
                      </div>
                      <div>
                        <Label htmlFor="year">Year</Label>
                        <Input
                          id="year"
                          value={newStudent.year}
                          onChange={(e) => setNewStudent(prev => ({...prev, year: e.target.value}))}
                          placeholder="3rd Year"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleAddStudent} disabled={isLoading} className="flex-1">
                        {isLoading ? 'Adding...' : 'Add Student'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Import Excel */}
              <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Excel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Students from Excel</DialogTitle>
                    <DialogDescription>
                      Upload a CSV file with student data to enroll multiple students at once
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Download Template */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                      <div>
                        <h4 className="font-medium">Step 1: Download Template</h4>
                        <p className="text-sm text-muted-foreground">Get the CSV template with required columns</p>
                      </div>
                      <Button variant="outline" onClick={downloadTemplate}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>

                    {/* Upload File */}
                    <div className="space-y-2">
                      <Label htmlFor="file-upload">Step 2: Upload Completed File</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".csv"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      {selectedFile && (
                        <p className="text-sm text-green-600">
                          ✓ Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleFileUpload} disabled={!selectedFile || isUploading} className="flex-1">
                        {isUploading ? 'Importing...' : 'Import Students'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>


      {/* Student List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Enrolled Students ({enrollments.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading students...</div>
          ) : filteredEnrollments.length > 0 ? (
            <div className="space-y-2">
              {filteredEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-blue-600">
                        {enrollment.student.first_name[0]}{enrollment.student.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {enrollment.student.first_name} {enrollment.student.middle_name} {enrollment.student.last_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.student.roll_number} • {enrollment.student.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">
                      {enrollment.enrollment_status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(enrollment.enrollment_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Students Enrolled</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding students manually or importing from Excel
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleStudentEnrollment;
