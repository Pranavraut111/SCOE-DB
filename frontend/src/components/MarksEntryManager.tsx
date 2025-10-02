import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  ClipboardList, 
  Save, 
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calculator,
  FileText,
  Users
} from "lucide-react";

interface ExamEvent {
  id: number;
  name: string;
  department: string;
  semester: number;
}

interface ExamSchedule {
  id: number;
  subject_id: number;
  subject_name: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  max_marks: number;
  passing_marks: number;
}

interface StudentExam {
  id: number;
  student_id: number;
  exam_schedule_id: number;
  attendance_status: string;
  marks_obtained?: number;
  grade?: string;
  remarks?: string;
  student?: {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    roll_number: string;
    email: string;
  };
  exam_schedule?: ExamSchedule;
}

interface MarksEntryManagerProps {
  examEvent: ExamEvent;
}

const MarksEntryManager = ({ examEvent }: MarksEntryManagerProps) => {
  const { toast } = useToast();
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [studentExams, setStudentExams] = useState<StudentExam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  const [marksData, setMarksData] = useState<{ [key: number]: { marks: string; remarks: string } }>({});
  const [bulkMarksMode, setBulkMarksMode] = useState(false);
  const [bulkMarks, setBulkMarks] = useState('');

  useEffect(() => {
    fetchExamSchedules();
  }, [examEvent.id]);

  useEffect(() => {
    if (selectedSchedule) {
      fetchStudentExams();
    }
  }, [selectedSchedule]);

  const fetchExamSchedules = async () => {
    try {
      const response = await fetch(`/api/v1/exams/events/${examEvent.id}/schedules/`);
      if (response.ok) {
        const data = await response.json();
        setExamSchedules(data);
        if (data.length > 0 && !selectedSchedule) {
          setSelectedSchedule(data[0].id);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load exam schedules",
        variant: "destructive",
      });
    }
  };

  const fetchStudentExams = async () => {
    if (!selectedSchedule) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/exams/schedules/${selectedSchedule}/student-exams/`);
      if (response.ok) {
        const data = await response.json();
        setStudentExams(data);
        
        // Initialize marks data
        const initialMarksData: { [key: number]: { marks: string; remarks: string } } = {};
        data.forEach((exam: StudentExam) => {
          initialMarksData[exam.id] = {
            marks: exam.marks_obtained?.toString() || '',
            remarks: exam.remarks || ''
          };
        });
        setMarksData(initialMarksData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load student exams",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarksChange = (examId: number, field: 'marks' | 'remarks', value: string) => {
    setMarksData(prev => ({
      ...prev,
      [examId]: {
        ...prev[examId],
        [field]: value
      }
    }));
  };

  const handleSaveMarks = async (examId: number) => {
    const data = marksData[examId];
    if (!data) return;

    const marks = parseFloat(data.marks);
    const currentSchedule = examSchedules.find(s => s.id === selectedSchedule);
    
    if (data.marks && (isNaN(marks) || marks < 0 || marks > (currentSchedule?.max_marks || 100))) {
      toast({
        title: "Invalid Marks",
        description: `Marks must be between 0 and ${currentSchedule?.max_marks || 100}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/v1/exams/student-exams/${examId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marks_obtained: data.marks ? marks : null,
          remarks: data.remarks || null
        }),
      });

      if (response.ok) {
        await fetchStudentExams();
        toast({
          title: "Marks Saved",
          description: "Student marks updated successfully",
        });
      } else {
        throw new Error('Failed to save marks');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save marks",
        variant: "destructive",
      });
    }
  };

  const handleBulkSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(marksData)
        .filter(([_, data]) => data.marks || data.remarks)
        .map(([examId, data]) => ({
          student_exam_id: parseInt(examId),
          marks_obtained: data.marks ? parseFloat(data.marks) : null,
          remarks: data.remarks || null
        }));

      if (updates.length === 0) {
        toast({
          title: "No Changes",
          description: "No marks to save",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/v1/exams/student-exams/bulk-marks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ marks_entries: updates }),
      });

      if (response.ok) {
        const result = await response.json();
        await fetchStudentExams();
        toast({
          title: "Bulk Save Complete",
          description: `${result.updated_count} student marks updated successfully`,
        });
      } else {
        throw new Error('Failed to save marks');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save marks",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkMarksApply = () => {
    if (!bulkMarks || isNaN(parseFloat(bulkMarks))) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid marks",
        variant: "destructive",
      });
      return;
    }

    const filteredExams = getFilteredStudentExams();
    const newMarksData = { ...marksData };
    
    filteredExams.forEach(exam => {
      if (exam.attendance_status === 'present') {
        newMarksData[exam.id] = {
          ...newMarksData[exam.id],
          marks: bulkMarks
        };
      }
    });
    
    setMarksData(newMarksData);
    setBulkMarks('');
    setBulkMarksMode(false);
    
    toast({
      title: "Bulk Marks Applied",
      description: `Applied ${bulkMarks} marks to ${filteredExams.filter(e => e.attendance_status === 'present').length} students`,
    });
  };

  const handleAttendanceUpdate = async (examId: number, status: string) => {
    try {
      const response = await fetch(`/api/v1/exams/student-exams/${examId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendance_status: status
        }),
      });

      if (response.ok) {
        await fetchStudentExams();
        toast({
          title: "Attendance Updated",
          description: "Student attendance updated successfully",
        });
      } else {
        throw new Error('Failed to update attendance');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive",
      });
    }
  };

  const getGrade = (marks: number, maxMarks: number, passingMarks: number) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= passingMarks) return 'D';
    return 'F';
  };

  const getFilteredStudentExams = () => {
    return studentExams.filter(exam => {
      const student = exam.student;
      if (!student) return false;

      const matchesSearch = searchTerm === '' || 
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_number.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAttendance = attendanceFilter === 'all' || exam.attendance_status === attendanceFilter;

      return matchesSearch && matchesAttendance;
    });
  };

  const currentSchedule = examSchedules.find(s => s.id === selectedSchedule);
  const filteredStudentExams = getFilteredStudentExams();

  const stats = {
    total: studentExams.length,
    present: studentExams.filter(e => e.attendance_status === 'present').length,
    absent: studentExams.filter(e => e.attendance_status === 'absent').length,
    marksEntered: studentExams.filter(e => e.marks_obtained !== null && e.marks_obtained !== undefined).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Marks Entry - {examEvent.name}
              </CardTitle>
              <CardDescription>
                Enter and manage student marks for exam subjects
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setBulkMarksMode(!bulkMarksMode)}
                variant="outline"
              >
                <Calculator className="mr-2 h-4 w-4" />
                Bulk Entry
              </Button>
              <Button 
                onClick={handleBulkSave}
                disabled={isSaving}
                className="bg-gradient-primary hover:bg-primary-hover"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save All'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Subject Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examSchedules.map((schedule) => (
              <Card 
                key={schedule.id} 
                className={`cursor-pointer transition-all ${
                  selectedSchedule === schedule.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedSchedule(schedule.id)}
              >
                <CardContent className="p-4">
                  <div className="font-semibold">{schedule.subject_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(schedule.exam_date).toLocaleDateString()} • {schedule.start_time}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Max: {schedule.max_marks} • Pass: {schedule.passing_marks}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Venue: {schedule.venue}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedSchedule && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Students</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{stats.present}</div>
                    <div className="text-sm text-muted-foreground">Present</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold">{stats.absent}</div>
                    <div className="text-sm text-muted-foreground">Absent</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">{stats.marksEntered}</div>
                    <div className="text-sm text-muted-foreground">Marks Entered</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bulk Marks Entry */}
          {bulkMarksMode && (
            <Card>
              <CardHeader>
                <CardTitle>Bulk Marks Entry</CardTitle>
                <CardDescription>
                  Apply the same marks to all present students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="bulkMarks">Marks (out of {currentSchedule?.max_marks})</Label>
                    <Input
                      id="bulkMarks"
                      type="number"
                      min="0"
                      max={currentSchedule?.max_marks}
                      value={bulkMarks}
                      onChange={(e) => setBulkMarks(e.target.value)}
                      placeholder="Enter marks to apply to all present students"
                    />
                  </div>
                  <Button onClick={handleBulkMarksApply}>
                    Apply to Present Students
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={attendanceFilter} onValueChange={setAttendanceFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Student Marks Entry */}
          <Card>
            <CardHeader>
              <CardTitle>
                Student Marks - {currentSchedule?.subject_name}
              </CardTitle>
              <CardDescription>
                Enter marks for each student (Max: {currentSchedule?.max_marks}, Pass: {currentSchedule?.passing_marks})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredStudentExams.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
                  <p className="text-muted-foreground">
                    No students match the current filters
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStudentExams.map((exam) => (
                    <Card key={exam.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                          {/* Student Info */}
                          <div className="lg:col-span-4">
                            <div className="font-semibold">
                              {exam.student?.first_name} {exam.student?.middle_name} {exam.student?.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Roll: {exam.student?.roll_number}
                            </div>
                          </div>

                          {/* Attendance */}
                          <div className="lg:col-span-2">
                            <Select
                              value={exam.attendance_status}
                              onValueChange={(value) => handleAttendanceUpdate(exam.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Marks Entry */}
                          <div className="lg:col-span-2">
                            <Input
                              type="number"
                              min="0"
                              max={currentSchedule?.max_marks}
                              value={marksData[exam.id]?.marks || ''}
                              onChange={(e) => handleMarksChange(exam.id, 'marks', e.target.value)}
                              placeholder="Marks"
                              disabled={exam.attendance_status === 'absent'}
                            />
                          </div>

                          {/* Grade Display */}
                          <div className="lg:col-span-1">
                            {marksData[exam.id]?.marks && currentSchedule ? (
                              <Badge className="w-full justify-center">
                                {getGrade(
                                  parseFloat(marksData[exam.id].marks), 
                                  currentSchedule.max_marks, 
                                  currentSchedule.passing_marks
                                )}
                              </Badge>
                            ) : (
                              <div className="text-center text-muted-foreground">-</div>
                            )}
                          </div>

                          {/* Remarks */}
                          <div className="lg:col-span-2">
                            <Input
                              value={marksData[exam.id]?.remarks || ''}
                              onChange={(e) => handleMarksChange(exam.id, 'remarks', e.target.value)}
                              placeholder="Remarks"
                            />
                          </div>

                          {/* Save Button */}
                          <div className="lg:col-span-1">
                            <Button
                              size="sm"
                              onClick={() => handleSaveMarks(exam.id)}
                              className="w-full"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MarksEntryManager;
