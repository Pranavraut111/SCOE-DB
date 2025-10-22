import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Download, Upload, CheckCircle, Users, AlertCircle } from "lucide-react";
import axios from 'axios';

interface ExamEvent {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  code: string;
  name: string;
  total_marks: number;
}

interface StudentMark {
  roll_number: string;
  student_name: string;
  student_id: number;
  marks: number;
}

interface MarksEntryManagerProps {
  examEvent: ExamEvent;
}

const MarksEntryManagerClean = ({ examEvent }: MarksEntryManagerProps) => {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSubjects();
  }, [examEvent.id]);

  const loadSubjects = async () => {
    try {
      const response = await axios.get(`/api/v1/exams/events/${examEvent.id}/schedules/`);
      const schedules = response.data;
      
      const subjectList = schedules.map((s: any) => ({
        id: s.id,
        code: s.subject.code,
        name: s.subject.name,
        total_marks: s.total_marks
      }));
      
      setSubjects(subjectList);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      });
    }
  };

  const loadMarksForSubject = async (subject: Subject) => {
    setLoading(true);
    setSelectedSubject(subject);
    
    try {
      // Get enrolled students
      const appsResponse = await axios.get(
        `/api/v1/enrollment-applications/exam-event/${examEvent.id}/applications?status=APPROVED`
      );
      
      // Get exam schedules to find subject_id
      const schedulesResponse = await axios.get(`/api/v1/exams/events/${examEvent.id}/schedules/`);
      const schedule = schedulesResponse.data.find((s: any) => s.id === subject.id);
      
      if (!schedule) {
        throw new Error('Schedule not found');
      }
      
      // Filter students enrolled in this subject
      const enrolledStudents = appsResponse.data
        .filter((app: any) => {
          const selectedSubjects = JSON.parse(app.selected_subjects);
          return selectedSubjects.includes(schedule.subject_id);
        });
      
      // Get existing marks
      const marksResponse = await axios.get(`/api/v1/exams/schedules/${subject.id}/student-exams`);
      const existingMarks = marksResponse.data;
      
      // Combine data
      const marksData: StudentMark[] = enrolledStudents.map((student: any) => {
        const markRecord = existingMarks.find((m: any) => m.student_id === student.student_id);
        return {
          roll_number: student.roll_number,
          student_name: student.student_name,
          student_id: student.student_id,
          marks: markRecord?.theory_marks_obtained || 0
        };
      });
      
      setStudentMarks(marksData);
      
    } catch (error) {
      console.error('Error loading marks:', error);
      toast({
        title: "Error",
        description: "Failed to load student marks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportMasterCSV = async () => {
    try {
      // Get all approved applications
      const appsResponse = await axios.get(
        `/api/v1/enrollment-applications/exam-event/${examEvent.id}/applications?status=APPROVED`
      );
      
      const allApplications = appsResponse.data;
      
      // Get all schedules
      const schedulesResponse = await axios.get(`/api/v1/exams/events/${examEvent.id}/schedules/`);
      const schedules = schedulesResponse.data;
      
      // Create CSV headers
      const subjectHeaders = schedules.map((s: any) => 
        `${s.subject.code} - ${s.subject.name} (${s.total_marks})`
      );
      const headers = ['Roll Number', 'Student Name', ...subjectHeaders];
      
      // Get unique students
      const uniqueStudents = Array.from(
        new Map(allApplications.map((app: any) => [app.roll_number, app])).values()
      );
      
      // Create rows
      const rows = uniqueStudents.map((app: any) => {
        const selectedSubjects = JSON.parse(app.selected_subjects);
        const row = [app.roll_number, app.student_name];
        
        schedules.forEach((schedule: any) => {
          if (selectedSubjects.includes(schedule.subject_id)) {
            row.push('0');
          } else {
            row.push('NA');
          }
        });
        
        return row;
      });
      
      // Generate CSV
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${examEvent.name.replace(/\s+/g, '_')}_Marks_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "✅ CSV Exported",
        description: `Template ready for ${uniqueStudents.length} students`,
      });
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Could not generate CSV",
        variant: "destructive",
      });
    }
  };

  const importFilledCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV file is empty');
        }
        
        // Parse headers
        const headers = lines[0].split(',').map(h => h.trim());
        const subjectColumns = headers.slice(2);
        
        // Extract subject codes
        const subjectCodes = subjectColumns.map(h => {
          const match = h.match(/^([A-Z0-9]+)/);
          return match ? match[1] : '';
        });
        
        // Get schedules
        const schedulesResponse = await axios.get(`/api/v1/exams/events/${examEvent.id}/schedules/`);
        const schedules = schedulesResponse.data;
        
        // Get all applications
        const appsResponse = await axios.get(
          `/api/v1/enrollment-applications/exam-event/${examEvent.id}/applications?status=APPROVED`
        );
        const allApplications = appsResponse.data;
        
        let successCount = 0;
        let errorCount = 0;
        
        console.log(`📊 Processing ${lines.length - 1} rows with ${subjectCodes.length} subjects`);
        console.log(`Subject codes:`, subjectCodes);
        console.log(`Schedules:`, schedules);
        
        // Process each row
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const rollNumber = values[0];
          
          console.log(`\n📝 Row ${i}: ${rollNumber}`);
          
          // Process each subject
          for (let j = 0; j < subjectCodes.length; j++) {
            const subjectCode = subjectCodes[j];
            const marksValue = values[j + 2];
            
            console.log(`  Subject ${subjectCode}: marks="${marksValue}"`);
            
            if (!marksValue || marksValue === 'NA' || marksValue === '0') {
              console.log(`    ⏭️  Skipping (empty, NA, or 0)`);
              continue;
            }
            
            const marks = parseInt(marksValue);
            if (isNaN(marks) || marks < 0) {
              console.log(`    ❌ Invalid marks: ${marksValue}`);
              continue;
            }
            
            console.log(`    ✓ Valid marks: ${marks}`);
            
            // Find schedule
            const schedule = schedules.find((s: any) => s.subject.code === subjectCode);
            if (!schedule) {
              console.log(`    ❌ Schedule not found for ${subjectCode}`);
              continue;
            }
            
            console.log(`    ✓ Found schedule ID: ${schedule.id}`);
            
            // Find student
            const student = allApplications.find((app: any) => 
              app.roll_number === rollNumber &&
              JSON.parse(app.selected_subjects).includes(schedule.subject_id)
            );
            
            if (!student) {
              console.log(`    ❌ Student not enrolled in ${subjectCode}`);
              continue;
            }
            
            console.log(`    ✓ Found student ID: ${student.student_id}`);
            console.log(`    🚀 Posting marks...`);
            
            // Save marks
            try {
              await axios.post(`/api/v1/exams/schedules/${schedule.id}/marks/bulk`, {
                exam_schedule_id: schedule.id,
                marks_data: [{
                  student_id: student.student_id,
                  theory_marks: marks,
                  practical_marks: 0
                }],
                entered_by: "admin"
              });
              successCount++;
            } catch (err) {
              console.error(`Failed to save marks for ${rollNumber} in ${subjectCode}:`, err);
              errorCount++;
            }
          }
        }
        
        toast({
          title: "✅ Import Complete",
          description: `Saved ${successCount} marks${errorCount > 0 ? `, ${errorCount} errors` : ''}. Click a subject to view.`,
        });
        
        // Reload current subject if selected
        if (selectedSubject) {
          loadMarksForSubject(selectedSubject);
        }
        
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Import Failed",
          description: "Invalid CSV format",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const marksEntered = studentMarks.filter(s => s.marks > 0).length;

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
                Export template → Teachers fill marks → Import filled CSV
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportMasterCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export Template
              </Button>
              <Button 
                variant="default"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Marks
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={importFilledCSV}
                className="hidden"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-12 gap-6">
            {/* Subjects List */}
            <div className="col-span-4 space-y-2">
              <h3 className="font-semibold text-lg mb-4">Subjects</h3>
              {subjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No subjects found</p>
                </div>
              ) : (
                subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary ${
                      selectedSubject?.id === subject.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-card'
                    }`}
                    onClick={() => loadMarksForSubject(subject)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-base mb-1">
                          {subject.code}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {subject.name}
                        </div>
                        <Badge variant="secondary" className="text-xs mt-2">
                          {subject.total_marks} marks
                        </Badge>
                      </div>
                      {selectedSubject?.id === subject.id && (
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Marks Display */}
            <div className="col-span-8">
              {!selectedSubject ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a subject to view marks</p>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading marks...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                          <div className="text-2xl font-bold">{studentMarks.length}</div>
                          <div className="text-sm text-muted-foreground">Total Students</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <div className="text-2xl font-bold">{marksEntered}</div>
                          <div className="text-sm text-muted-foreground">Marks Entered</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                          <div className="text-2xl font-bold">{studentMarks.length - marksEntered}</div>
                          <div className="text-sm text-muted-foreground">Pending</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Marks Table */}
                  {studentMarks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No students enrolled</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-4 font-semibold">Roll Number</th>
                            <th className="text-left p-4 font-semibold">Student Name</th>
                            <th className="text-center p-4 font-semibold">Marks</th>
                            <th className="text-center p-4 font-semibold">Total</th>
                            <th className="text-center p-4 font-semibold">Percentage</th>
                            <th className="text-center p-4 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentMarks.map((student, index) => {
                            const percentage = selectedSubject.total_marks > 0
                              ? ((student.marks / selectedSubject.total_marks) * 100).toFixed(2)
                              : '0.00';
                            
                            return (
                              <tr key={student.student_id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                                <td className="p-4 font-medium">{student.roll_number}</td>
                                <td className="p-4">{student.student_name}</td>
                                <td className="p-4 text-center">
                                  <span className="text-lg font-semibold">{student.marks}</span>
                                </td>
                                <td className="p-4 text-center text-muted-foreground">
                                  {selectedSubject.total_marks}
                                </td>
                                <td className="p-4 text-center">
                                  <Badge variant="secondary">{percentage}%</Badge>
                                </td>
                                <td className="p-4 text-center">
                                  {student.marks > 0 ? (
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
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarksEntryManagerClean;
