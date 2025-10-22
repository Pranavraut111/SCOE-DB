import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Save, Users, CheckCircle, Download, Upload, FileSpreadsheet } from "lucide-react";
import axios from 'axios';

interface ExamEvent {
  id: number;
  name: string;
  department: string;
  semester: number;
}

interface ExamSchedule {
  id: number;
  subject_id: number;
  exam_date: string;
  total_marks: number;
  subject: {
    id: number;
    name: string;
    code: string;
  };
}

interface EnrolledStudent {
  id: number;
  student_id: number;
  student_name: string;
  roll_number: string;
  marks?: number;
}

interface MarksEntryManagerProps {
  examEvent: ExamEvent;
}

const MarksEntryManagerNew = ({ examEvent }: MarksEntryManagerProps) => {
  const { toast } = useToast();
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [marks, setMarks] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchExamSchedules();
  }, [examEvent.id]);

  const fetchExamSchedules = async () => {
    try {
      const response = await axios.get(`/api/v1/exams/events/${examEvent.id}/schedules/`);
      setExamSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchEnrolledStudents = async (scheduleId: number, subjectId: number) => {
    setLoading(true);
    try {
      // Get approved applications for this exam
      const appsResponse = await axios.get(
        `/api/v1/enrollment-applications/exam-event/${examEvent.id}/applications?status=APPROVED`
      );
      
      // Filter students who selected this subject
      const enrolledForSubject = appsResponse.data
        .filter((app: any) => {
          const selectedSubjects = JSON.parse(app.selected_subjects);
          return selectedSubjects.includes(subjectId);
        })
        .map((app: any) => ({
          id: app.id,
          student_id: app.student_id,
          student_name: app.student_name,
          roll_number: app.roll_number,
          marks: undefined
        }));

      setEnrolledStudents(enrolledForSubject);
      
      // Fetch existing marks from database
      try {
        console.log(`Fetching marks for schedule ${scheduleId}...`);
        const marksResponse = await axios.get(`/api/v1/exams/schedules/${scheduleId}/student-exams`);
        const existingMarks = marksResponse.data;
        
        console.log('Existing marks from DB:', existingMarks);
        console.log('Enrolled students:', enrolledForSubject);
        
        // Initialize marks state with existing marks or 0
        const initialMarks: { [key: number]: number } = {};
        enrolledForSubject.forEach((student: EnrolledStudent) => {
          const studentMark = existingMarks.find((m: any) => m.student_id === student.student_id);
          // Try multiple field names that might contain the marks
          const marks = studentMark 
            ? (studentMark.theory_marks_obtained || studentMark.theory_marks || studentMark.total_marks_obtained || 0)
            : 0;
          initialMarks[student.student_id] = marks;
          console.log(`Student ${student.roll_number} (ID: ${student.student_id}): ${marks} marks`, studentMark);
        });
        setMarks(initialMarks);
        
        console.log('Final marks state:', initialMarks);
      } catch (error) {
        console.error('Error fetching existing marks:', error);
        // Initialize with zeros if marks fetch fails
        const initialMarks: { [key: number]: number } = {};
        enrolledForSubject.forEach((student: EnrolledStudent) => {
          initialMarks[student.student_id] = 0;
        });
        setMarks(initialMarks);
      }

    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      toast({
        title: "Error",
        description: "Failed to load enrolled students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = (schedule: ExamSchedule) => {
    setSelectedSchedule(schedule);
    fetchEnrolledStudents(schedule.id, schedule.subject_id);
  };


  const handleExportMasterCSV = async () => {
    if (examSchedules.length === 0) return;

    try {
      // Fetch all enrolled students for all subjects
      const appsResponse = await axios.get(
        `/api/v1/enrollment-applications/exam-event/${examEvent.id}/applications?status=APPROVED`
      );
      
      const allApplications = appsResponse.data;
      
      // Create headers with subject code and name
      const subjectHeaders = examSchedules.map(s => `${s.subject.code} - ${s.subject.name} (${s.total_marks})`);
      const headers = ['Roll Number', 'Student Name', ...subjectHeaders];
      
      // Get unique students
      const uniqueStudents = Array.from(
        new Map(allApplications.map((app: any) => [app.roll_number, app])).values()
      );
      
      // Create rows
      const rows = uniqueStudents.map((app: any) => {
        const selectedSubjects = JSON.parse(app.selected_subjects);
        const row = [app.roll_number, app.student_name];
        
        // For each subject, add marks column (0 if not enrolled, empty if enrolled)
        examSchedules.forEach(schedule => {
          if (selectedSubjects.includes(schedule.subject_id)) {
            row.push('0'); // Student is enrolled, teacher can fill marks
          } else {
            row.push('NA'); // Student not enrolled in this subject
          }
        });
        
        return row;
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${examEvent.name.replace(/\s+/g, '_')}_All_Subjects_Marks_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Master CSV exported!",
        description: `Downloaded marks template for ${uniqueStudents.length} students across ${examSchedules.length} subjects`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to generate CSV",
        variant: "destructive",
      });
    }
  };

  const handleImportMasterCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Parse header to get subject columns
        const headers = lines[0].split(',').map(h => h.trim());
        const subjectColumns = headers.slice(2); // Skip Roll Number and Student Name
        
        // Get subject codes from headers (e.g., "CSL103 - Basic... (100)" -> "CSL103")
        const subjectCodes = subjectColumns.map(h => {
          const codeMatch = h.match(/^([A-Z0-9]+)/);
          return codeMatch ? codeMatch[1] : h.split('-')[0].trim();
        });
        
        // Map subject codes to schedule IDs
        const subjectMap = new Map(
          examSchedules.map(s => [s.subject.code, s])
        );
        
        const dataLines = lines.slice(1);
        let totalImported = 0;
        let totalErrors = 0;

        // Fetch all approved applications once
        const appsResponse = await axios.get(
          `/api/v1/enrollment-applications/exam-event/${examEvent.id}/applications?status=APPROVED`
        );
        const allApplications = appsResponse.data;

        // Process each student row and save marks
        for (const line of dataLines) {
          const values = line.split(',').map(v => v.trim());
          const rollNumber = values[0];
          
          // For each subject column, save marks
          for (let i = 0; i < subjectCodes.length; i++) {
            const subjectCode = subjectCodes[i];
            const marksValue = values[i + 2]; // +2 to skip roll number and name
            
            if (marksValue === 'NA' || !marksValue || marksValue === '0') continue;
            
            const schedule = subjectMap.get(subjectCode);
            if (!schedule) {
              console.log(`Subject not found: ${subjectCode}`);
              continue;
            }
            
            const marks = parseInt(marksValue) || 0;
            if (marks < 0 || marks > schedule.total_marks) {
              totalErrors++;
              continue;
            }
            
            // Find student in enrolled list for this subject
            const student = allApplications.find((app: any) => 
              app.roll_number === rollNumber && 
              JSON.parse(app.selected_subjects).includes(schedule.subject_id)
            );
            
            if (student) {
              // Save marks immediately
              try {
                const payload = {
                  exam_schedule_id: schedule.id,
                  marks_data: [{
                    student_id: student.student_id,
                    theory_marks: marks,
                    practical_marks: 0
                  }],
                  entered_by: "admin"
                };
                console.log(`Saving marks for ${rollNumber} in ${subjectCode}:`, payload);
                
                const response = await axios.post(`/api/v1/exams/schedules/${schedule.id}/marks/bulk`, payload);
                console.log(`✅ Save response:`, response.data);
                
                totalImported++;
                console.log(`Saved ${marks} for ${rollNumber} in ${subjectCode}`);
              } catch (error: any) {
                console.error(`❌ Error saving marks for ${rollNumber} in ${subjectCode}:`, error.response?.data || error);
                totalErrors++;
              }
            } else {
              console.log(`Student ${rollNumber} not enrolled in ${subjectCode}`);
            }
          }
        }

        toast({
          title: "✅ Marks imported successfully!",
          description: `Imported ${totalImported} marks. Click on a subject to view the marks.`,
        });

        // If a subject is already selected, refresh it
        if (selectedSchedule) {
          fetchEnrolledStudents(selectedSchedule.id, selectedSchedule.subject_id);
        }

      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Import failed",
          description: "Invalid CSV format or import error",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const enteredCount = Object.values(marks).filter(m => m > 0).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Marks Entry - {examEvent.name}
              </CardTitle>
              <CardDescription>
                Export master CSV, give to teachers, then import filled CSV
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportMasterCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export Master CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Filled CSV
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportMasterCSV}
                className="hidden"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Subject List */}
            <div className="col-span-4 space-y-3">
              <h3 className="font-semibold text-lg mb-4">Subjects</h3>
              {examSchedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No subjects scheduled</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {examSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary ${
                        selectedSchedule?.id === schedule.id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border bg-card'
                      }`}
                      onClick={() => handleSubjectSelect(schedule)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-base mb-1">
                            {schedule.subject.code}
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {schedule.subject.name}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{new Date(schedule.exam_date).toLocaleDateString()}</span>
                            <Badge variant="secondary" className="text-xs">
                              {schedule.total_marks} marks
                            </Badge>
                          </div>
                        </div>
                        {selectedSchedule?.id === schedule.id && (
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Content - Student List */}
            <div className="col-span-8">

          {/* Student Marks Entry */}
          {selectedSchedule && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-2xl font-bold">{enrolledStudents.length}</div>
                      <div className="text-sm text-muted-foreground">Enrolled Students</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <div className="text-2xl font-bold">{enteredCount}</div>
                      <div className="text-sm text-muted-foreground">Marks Entered</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <div className="text-2xl font-bold">{enrolledStudents.length - enteredCount}</div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{selectedSchedule.total_marks}</div>
                      <div className="text-sm text-muted-foreground">Maximum Marks</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Marks Entry Table */}
              {loading ? (
                <div className="text-center py-8">Loading students...</div>
              ) : enrolledStudents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No students enrolled for this subject</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Student Marks</h3>
                    <Badge variant="secondary" className="text-sm">
                      {enrolledStudents.length} students enrolled
                    </Badge>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-4 font-semibold">Roll Number</th>
                          <th className="text-left p-4 font-semibold">Student Name</th>
                          <th className="text-center p-4 font-semibold">Marks Obtained</th>
                          <th className="text-center p-4 font-semibold">Total Marks</th>
                          <th className="text-center p-4 font-semibold">Percentage</th>
                          <th className="text-center p-4 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrolledStudents.map((student, index) => {
                          const studentMarks = marks[student.student_id] || 0;
                          const percentage = selectedSchedule.total_marks > 0 
                            ? ((studentMarks / selectedSchedule.total_marks) * 100).toFixed(2)
                            : '0.00';
                          
                          return (
                            <tr key={student.student_id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                              <td className="p-4 font-medium">{student.roll_number}</td>
                              <td className="p-4">{student.student_name}</td>
                              <td className="p-4 text-center">
                                <span className="text-lg font-semibold">{studentMarks}</span>
                              </td>
                              <td className="p-4 text-center text-muted-foreground">
                                {selectedSchedule.total_marks}
                              </td>
                              <td className="p-4 text-center">
                                <Badge variant="secondary">
                                  {percentage}%
                                </Badge>
                              </td>
                              <td className="p-4 text-center">
                                {studentMarks > 0 ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Entered
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                    Pending
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {!selectedSchedule && (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a subject to enter marks</p>
              </div>
            </div>
          )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarksEntryManagerNew;
