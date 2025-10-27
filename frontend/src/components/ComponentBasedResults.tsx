import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Calculator,
  TrendingUp,
  FileText,
  Award,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  RefreshCw,
  BarChart3
} from "lucide-react";

interface Student {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  roll_number: string;
  department: string;
  current_semester: number;
}

interface Subject {
  id: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  semester: string;
}

interface ComponentMark {
  component_type: string;
  component_name: string;
  marks_obtained: number;
  max_marks: number;
  percentage: number;
  exam_event_id: number;
}

interface SubjectResult {
  id: number;
  ia_marks: number;
  ese_marks: number;
  oral_marks: number;
  total_marks_obtained: number;
  total_max_marks: number;
  percentage: number;
  grade: string;
  grade_points: number;
  is_pass: boolean;
  credits_earned: number;
}

interface SemesterResult {
  id: number;
  semester: number;
  academic_year: string;
  total_subjects: number;
  subjects_passed: number;
  subjects_failed: number;
  total_credits_attempted: number;
  total_credits_earned: number;
  sgpa: number;
  cgpa: number;
  overall_percentage: number;
  result_status: string;
  result_class: string;
}

const ComponentBasedResults = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [semester, setSemester] = useState(1);
  
  const [componentMarks, setComponentMarks] = useState<ComponentMark[]>([]);
  const [subjectResult, setSubjectResult] = useState<SubjectResult | null>(null);
  const [semesterResult, setSemesterResult] = useState<SemesterResult | null>(null);
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<'component' | 'subject' | 'semester'>('component');

  useEffect(() => {
    fetchStudents();
    fetchSubjects();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/v1/students/');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`/api/v1/subjects/?semester=I`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchComponentMarks = async () => {
    if (!selectedStudent || !selectedSubject) return;
    
    try {
      const response = await fetch(
        `/api/v1/results/marks/component/student/${selectedStudent}/subject/${selectedSubject}`
      );
      if (response.ok) {
        const data = await response.json();
        setComponentMarks(data.component_marks || []);
      }
    } catch (error) {
      console.error('Error fetching component marks:', error);
      setComponentMarks([]);
    }
  };

  const fetchSubjectResult = async () => {
    if (!selectedStudent || !selectedSubject) return;
    
    try {
      const response = await fetch(
        `/api/v1/results/subject/${selectedStudent}/${selectedSubject}?academic_year=${academicYear}`
      );
      if (response.ok) {
        const data = await response.json();
        setSubjectResult(data);
      }
    } catch (error) {
      console.error('Error fetching subject result:', error);
      setSubjectResult(null);
    }
  };

  const fetchSemesterResult = async () => {
    if (!selectedStudent) return;
    
    try {
      const response = await fetch(
        `/api/v1/results/semester/${selectedStudent}/${semester}?academic_year=${academicYear}`
      );
      if (response.ok) {
        const data = await response.json();
        setSemesterResult(data);
      }
    } catch (error) {
      console.error('Error fetching semester result:', error);
      setSemesterResult(null);
    }
  };

  const calculateSubjectResult = async () => {
    if (!selectedStudent || !selectedSubject) {
      toast({
        title: "Selection Required",
        description: "Please select a student and subject first",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    try {
      const response = await fetch(
        `/api/v1/results/subject/calculate?student_id=${selectedStudent}&subject_id=${selectedSubject}&academic_year=${academicYear}&semester=${semester}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "✅ Subject Result Calculated",
          description: `Grade: ${data.result.grade} (${data.result.percentage}%)`,
        });
        fetchSubjectResult();
      } else {
        const error = await response.json();
        toast({
          title: "Calculation Failed",
          description: error.detail || "Failed to calculate result",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate subject result",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const calculateSemesterResult = async () => {
    if (!selectedStudent) {
      toast({
        title: "Selection Required",
        description: "Please select a student first",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    try {
      const response = await fetch(
        `/api/v1/results/semester/calculate?student_id=${selectedStudent}&semester=${semester}&academic_year=${academicYear}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "✅ Semester Result Calculated",
          description: `SGPA: ${data.result.sgpa} | ${data.result.result_class}`,
        });
        fetchSemesterResult();
      } else {
        const error = await response.json();
        toast({
          title: "Calculation Failed",
          description: error.detail || "Failed to calculate semester result",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate semester result",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleStudentChange = (studentId: string) => {
    setSelectedStudent(parseInt(studentId));
    setComponentMarks([]);
    setSubjectResult(null);
    setSemesterResult(null);
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(parseInt(subjectId));
    setComponentMarks([]);
    setSubjectResult(null);
  };

  const selectedStudentData = students.find(s => s.id === selectedStudent);
  const selectedSubjectData = subjects.find(s => s.id === selectedSubject);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Component-Based Result Generation
          </CardTitle>
          <CardDescription>
            View component marks, calculate subject results, and generate semester SGPA/CGPA
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Selection Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Select Student & Subject</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Student</Label>
              <Select onValueChange={handleStudentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.roll_number} - {student.first_name} {student.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Subject</Label>
              <Select onValueChange={handleSubjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.subject_code} - {subject.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Academic Year</Label>
              <Input 
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2024-25"
              />
            </div>
          </div>

          {selectedStudentData && (
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Selected Student:</p>
                <p className="text-lg font-bold">{selectedStudentData.roll_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {selectedStudentData.first_name} {selectedStudentData.middle_name} {selectedStudentData.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedStudentData.department} | Semester {selectedStudentData.current_semester}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'component' ? 'default' : 'ghost'}
          onClick={() => {
            setActiveTab('component');
            fetchComponentMarks();
          }}
          className="rounded-b-none"
        >
          <Eye className="h-4 w-4 mr-2" />
          Component Marks
        </Button>
        <Button
          variant={activeTab === 'subject' ? 'default' : 'ghost'}
          onClick={() => {
            setActiveTab('subject');
            fetchSubjectResult();
          }}
          className="rounded-b-none"
        >
          <FileText className="h-4 w-4 mr-2" />
          Subject Result
        </Button>
        <Button
          variant={activeTab === 'semester' ? 'default' : 'ghost'}
          onClick={() => {
            setActiveTab('semester');
            fetchSemesterResult();
          }}
          className="rounded-b-none"
        >
          <Award className="h-4 w-4 mr-2" />
          Semester Result
        </Button>
      </div>

      {/* Component Marks Tab */}
      {activeTab === 'component' && (
        <Card>
          <CardHeader>
            <CardTitle>Component-wise Marks</CardTitle>
            <CardDescription>
              View marks for IA1, IA2, Oral, ESE separately
            </CardDescription>
          </CardHeader>
          <CardContent>
            {componentMarks.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {componentMarks.map((mark, index) => (
                    <Card key={index} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm text-gray-600">{mark.component_name}</p>
                            <p className="text-2xl font-bold">{mark.marks_obtained}/{mark.max_marks}</p>
                          </div>
                          <Badge variant={mark.percentage >= 40 ? "default" : "destructive"}>
                            {mark.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${mark.percentage >= 40 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${mark.percentage}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button onClick={fetchComponentMarks} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No component marks found</p>
                <p className="text-sm">Marks will appear here after entering them for IA1, IA2, Oral, ESE exams</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subject Result Tab */}
      {activeTab === 'subject' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Subject Final Result</CardTitle>
                <CardDescription>
                  Aggregated result from all component marks
                </CardDescription>
              </div>
              <Button 
                onClick={calculateSubjectResult}
                disabled={isCalculating || !selectedStudent || !selectedSubject}
              >
                <Calculator className="h-4 w-4 mr-2" />
                {isCalculating ? 'Calculating...' : 'Calculate Result'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {subjectResult ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">IA Marks</p>
                      <p className="text-2xl font-bold">{subjectResult.ia_marks}/50</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">Oral Marks</p>
                      <p className="text-2xl font-bold">{subjectResult.oral_marks}/25</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">ESE Marks</p>
                      <p className="text-2xl font-bold">{subjectResult.ese_marks}/50</p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-blue-500">
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold">
                        {subjectResult.total_marks_obtained}/{subjectResult.total_max_marks}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Result Details */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Percentage</p>
                        <p className="text-3xl font-bold">{subjectResult.percentage.toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Grade</p>
                        <p className="text-3xl font-bold text-blue-600">{subjectResult.grade}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Grade Points</p>
                        <p className="text-3xl font-bold">{subjectResult.grade_points}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Credits Earned</p>
                        <p className="text-3xl font-bold">{subjectResult.credits_earned}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        {subjectResult.is_pass ? (
                          <Badge className="text-lg px-3 py-1">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            PASS
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-lg px-3 py-1">
                            <XCircle className="h-4 w-4 mr-1" />
                            FAIL
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No subject result calculated yet</p>
                <p className="text-sm mb-4">Click "Calculate Result" to generate the final result</p>
                <Button 
                  onClick={calculateSubjectResult}
                  disabled={!selectedStudent || !selectedSubject}
                >
                  Calculate Subject Result
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Semester Result Tab */}
      {activeTab === 'semester' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Semester Result</CardTitle>
                <CardDescription>
                  Overall SGPA/CGPA and semester performance
                </CardDescription>
              </div>
              <Button 
                onClick={calculateSemesterResult}
                disabled={isCalculating || !selectedStudent}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {isCalculating ? 'Calculating...' : 'Calculate SGPA/CGPA'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {semesterResult ? (
              <div className="space-y-6">
                {/* SGPA/CGPA Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="pt-6">
                      <p className="text-sm opacity-90">SGPA (Semester)</p>
                      <p className="text-5xl font-bold">{semesterResult.sgpa.toFixed(2)}</p>
                      <p className="text-sm mt-2 opacity-90">Out of 10.00</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="pt-6">
                      <p className="text-sm opacity-90">CGPA (Cumulative)</p>
                      <p className="text-5xl font-bold">{semesterResult.cgpa.toFixed(2)}</p>
                      <p className="text-sm mt-2 opacity-90">Out of 10.00</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">Total Subjects</p>
                      <p className="text-2xl font-bold">{semesterResult.total_subjects}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">Passed</p>
                      <p className="text-2xl font-bold text-green-600">{semesterResult.subjects_passed}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">Failed</p>
                      <p className="text-2xl font-bold text-red-600">{semesterResult.subjects_failed}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">Percentage</p>
                      <p className="text-2xl font-bold">{semesterResult.overall_percentage.toFixed(2)}%</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Credits */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Credits Attempted</p>
                        <p className="text-3xl font-bold">{semesterResult.total_credits_attempted}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Credits Earned</p>
                        <p className="text-3xl font-bold text-green-600">{semesterResult.total_credits_earned}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Result Status */}
                <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Result Status</p>
                        <p className="text-2xl font-bold">{semesterResult.result_status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Result Class</p>
                        <p className="text-xl font-bold text-blue-600">{semesterResult.result_class}</p>
                      </div>
                      <Award className="h-16 w-16 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No semester result calculated yet</p>
                <p className="text-sm mb-4">Calculate all subject results first, then generate semester SGPA/CGPA</p>
                <Button 
                  onClick={calculateSemesterResult}
                  disabled={!selectedStudent}
                >
                  Calculate Semester Result
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComponentBasedResults;
