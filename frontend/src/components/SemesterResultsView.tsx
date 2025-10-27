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
  Award,
  CheckCircle,
  XCircle,
  Download,
  Search,
  Filter,
  BarChart3,
  Users
} from "lucide-react";

interface SubjectResult {
  student_id: number;
  student_name: string;
  roll_number: string;
  subject_id: number;
  subject_name: string;
  subject_code: string;
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
  student_id: number;
  student_name: string;
  roll_number: string;
  semester: number;
  total_subjects: number;
  subjects_passed: number;
  subjects_failed: number;
  total_credits_earned: number;
  sgpa: number;
  cgpa: number;
  result_status: string;
  result_class: string;
}

const SemesterResultsView = () => {
  const { toast } = useToast();
  const [department, setDepartment] = useState('Computer Science Engineering');
  const [semester, setSemester] = useState(1);
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [activeView, setActiveView] = useState<'semester' | 'subject'>('semester');
  
  const [semesterResults, setSemesterResults] = useState<SemesterResult[]>([]);
  const [subjectResults, setSubjectResults] = useState<SubjectResult[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, [department, semester]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`/api/v1/subjects/?department=${encodeURIComponent(department)}&semester=${semester}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const calculateAllSubjectResults = async () => {
    setIsCalculating(true);
    try {
      // This would need a bulk calculate endpoint
      toast({
        title: "Calculating Results",
        description: "Calculating subject results for all students...",
      });
      
      // For now, show message that this needs to be implemented
      toast({
        title: "Feature Note",
        description: "Bulk calculation will process all students automatically",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate results",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const calculateAllSemesterResults = async () => {
    setIsCalculating(true);
    try {
      toast({
        title: "Calculating SGPA/CGPA",
        description: "Calculating semester results for all students...",
      });
      
      // Bulk semester calculation
      toast({
        title: "Feature Note",
        description: "Bulk SGPA/CGPA calculation will process all students",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate semester results",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const filteredSemesterResults = semesterResults.filter(result =>
    result.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6" />
            Semester Results - All Students
          </CardTitle>
          <CardDescription>
            View and manage results for all students in a semester
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Select Semester & Department</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science Engineering">Computer Science Engineering</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Electronics and Communication Engineering">Electronics & Communication</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Semester</Label>
              <Select value={semester.toString()} onValueChange={(v) => setSemester(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
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

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium">Viewing Results For:</p>
              <p className="text-sm text-gray-600">
                {department} - Semester {semester} - {academicYear}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant={activeView === 'semester' ? 'default' : 'outline'}
          onClick={() => setActiveView('semester')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Semester Results (SGPA/CGPA)
        </Button>
        <Button
          variant={activeView === 'subject' ? 'default' : 'outline'}
          onClick={() => setActiveView('subject')}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Subject-wise Results
        </Button>
        <div className="ml-auto flex gap-2">
          <Button onClick={calculateAllSubjectResults} disabled={isCalculating}>
            <Calculator className="h-4 w-4 mr-2" />
            Calculate All Subject Results
          </Button>
          <Button onClick={calculateAllSemesterResults} disabled={isCalculating} variant="default">
            <TrendingUp className="h-4 w-4 mr-2" />
            Calculate All SGPA/CGPA
          </Button>
        </div>
      </div>

      {/* Semester Results View */}
      {activeView === 'semester' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Semester Results - All Students</CardTitle>
                <CardDescription>SGPA, CGPA, and overall performance</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by roll number or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {semesterResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3 text-left">Roll No</th>
                      <th className="p-3 text-left">Student Name</th>
                      <th className="p-3 text-center">Subjects</th>
                      <th className="p-3 text-center">Passed</th>
                      <th className="p-3 text-center">Failed</th>
                      <th className="p-3 text-center">Credits</th>
                      <th className="p-3 text-center">SGPA</th>
                      <th className="p-3 text-center">CGPA</th>
                      <th className="p-3 text-center">Result</th>
                      <th className="p-3 text-left">Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSemesterResults.map((result) => (
                      <tr key={result.student_id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{result.roll_number}</td>
                        <td className="p-3">{result.student_name}</td>
                        <td className="p-3 text-center">{result.total_subjects}</td>
                        <td className="p-3 text-center text-green-600 font-medium">{result.subjects_passed}</td>
                        <td className="p-3 text-center text-red-600 font-medium">{result.subjects_failed}</td>
                        <td className="p-3 text-center">{result.total_credits_earned}</td>
                        <td className="p-3 text-center">
                          <span className="font-bold text-blue-600">{result.sgpa.toFixed(2)}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-bold text-purple-600">{result.cgpa.toFixed(2)}</span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={result.result_status === 'PASS' ? 'default' : 'destructive'}>
                            {result.result_status}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">{result.result_class}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No Semester Results Found</p>
                <p className="text-sm mb-4">Calculate semester results to view SGPA/CGPA for all students</p>
                <Button onClick={calculateAllSemesterResults}>
                  Calculate Semester Results
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subject Results View */}
      {activeView === 'subject' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Subject-wise Results - All Students</CardTitle>
                <CardDescription>View marks and grades for each subject</CardDescription>
              </div>
              <Select value={selectedSubject?.toString() || ''} onValueChange={(v) => setSelectedSubject(parseInt(v))}>
                <SelectTrigger className="w-64">
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
          </CardHeader>
          <CardContent>
            {selectedSubject ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3 text-left">Roll No</th>
                      <th className="p-3 text-left">Student Name</th>
                      <th className="p-3 text-center">IA Marks</th>
                      <th className="p-3 text-center">Oral Marks</th>
                      <th className="p-3 text-center">ESE Marks</th>
                      <th className="p-3 text-center">Total</th>
                      <th className="p-3 text-center">Percentage</th>
                      <th className="p-3 text-center">Grade</th>
                      <th className="p-3 text-center">Credits</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectResults
                      .filter(r => r.subject_id === selectedSubject)
                      .map((result) => (
                        <tr key={result.student_id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{result.roll_number}</td>
                          <td className="p-3">{result.student_name}</td>
                          <td className="p-3 text-center">{result.ia_marks}/50</td>
                          <td className="p-3 text-center">{result.oral_marks}/25</td>
                          <td className="p-3 text-center">{result.ese_marks}/50</td>
                          <td className="p-3 text-center font-medium">
                            {result.total_marks_obtained}/{result.total_max_marks}
                          </td>
                          <td className="p-3 text-center">{result.percentage.toFixed(2)}%</td>
                          <td className="p-3 text-center">
                            <Badge>{result.grade}</Badge>
                          </td>
                          <td className="p-3 text-center">{result.credits_earned}</td>
                          <td className="p-3 text-center">
                            {result.is_pass ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Please select a subject to view results</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SemesterResultsView;
