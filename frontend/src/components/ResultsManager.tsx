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
  Download,
  RefreshCw,
  BarChart3,
  Loader2,
  Eye,
  Printer
} from "lucide-react";
import ProfessionalResultSheet from './ProfessionalResultSheet';

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
}

interface SemesterResult {
  student_id: number;
  student_name: string;
  roll_number: string;
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
  has_backlogs: boolean;
}

const ResultsManager = () => {
  const { toast } = useToast();
  const [department, setDepartment] = useState('Computer Science Engineering');
  const [semester, setSemester] = useState(2);
  const [academicYear, setAcademicYear] = useState('2025-26');
  const [students, setStudents] = useState<Student[]>([]);
  const [semesterResults, setSemesterResults] = useState<SemesterResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [showResultSheet, setShowResultSheet] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchSemesterResults();
  }, [department, semester, academicYear]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/v1/students/?department=${encodeURIComponent(department)}&semester=${semester}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSemesterResults = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/results/semester/all?department=${encodeURIComponent(department)}&semester=${semester}&academic_year=${academicYear}`);
      if (response.ok) {
        const data = await response.json();
        setSemesterResults(data);
      } else {
        setSemesterResults([]);
      }
    } catch (error) {
      console.error('Error fetching semester results:', error);
      setSemesterResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateAllSubjectResults = async () => {
    setIsCalculating(true);
    try {
      // First, get all unique subject IDs from component marks
      const marksResponse = await fetch(`/api/v1/results/marks/component/all?department=${encodeURIComponent(department)}&semester=${semester}`);
      
      if (!marksResponse.ok) {
        toast({
          title: "Error",
          description: "No component marks found. Please enter marks first.",
          variant: "destructive"
        });
        setIsCalculating(false);
        return;
      }

      const allMarks = await marksResponse.json();
      
      // Get unique student-subject combinations
      const combinations = new Set<string>();
      allMarks.forEach((mark: any) => {
        combinations.add(`${mark.student_id}-${mark.subject_id}`);
      });

      let successCount = 0;
      let errorCount = 0;

      // Calculate result for each unique student-subject combination
      for (const combo of Array.from(combinations)) {
        const [studentId, subjectId] = combo.split('-').map(Number);
        
        try {
          const response = await fetch(
            `/api/v1/results/subject/calculate?student_id=${studentId}&subject_id=${subjectId}&academic_year=${academicYear}&semester=${semester}`,
            { method: 'POST' }
          );
          
          if (response.ok) {
            successCount++;
          } else {
            const error = await response.json();
            console.error('Failed to calculate:', error);
            errorCount++;
          }
        } catch (error) {
          console.error('Error calculating:', error);
          errorCount++;
        }
      }

      toast({
        title: "✅ Subject Results Calculated",
        description: `Successfully calculated ${successCount} subject results. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
      });
    } catch (error) {
      console.error('Calculation error:', error);
      toast({
        title: "Error",
        description: "Failed to calculate subject results",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCalculateAllSGPA = async () => {
    setIsCalculating(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const student of students) {
        try {
          const response = await fetch(
            `/api/v1/results/semester/calculate?student_id=${student.id}&semester=${semester}&academic_year=${academicYear}`,
            { method: 'POST' }
          );
          
          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      toast({
        title: "✅ SGPA/CGPA Calculated",
        description: `Successfully calculated for ${successCount} students. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
      });

      // Refresh results
      await fetchSemesterResults();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate SGPA/CGPA",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'PASS') {
      return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Pass</Badge>;
    } else {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />ATKT</Badge>;
    }
  };

  const getResultClassBadge = (resultClass: string) => {
    const colors: any = {
      'First Class with Distinction': 'bg-purple-500',
      'First Class': 'bg-blue-500',
      'Second Class': 'bg-yellow-500',
      'Pass Class': 'bg-gray-500',
      'Fail': 'bg-red-500'
    };
    return <Badge className={colors[resultClass] || 'bg-gray-500'}>{resultClass}</Badge>;
  };

  const handleViewResultSheet = (studentId: number) => {
    setSelectedStudentId(studentId);
    setShowResultSheet(true);
  };

  const handleExportAll = () => {
    // Create CSV export
    const headers = ['Roll No', 'Student Name', 'Subjects', 'Passed', 'Failed', 'Credits', 'SGPA', 'CGPA', 'Percentage', 'Status', 'Result Class'];
    const rows = semesterResults.map(r => [
      r.roll_number,
      r.student_name,
      r.total_subjects,
      r.subjects_passed,
      r.subjects_failed,
      `${r.total_credits_earned}/${r.total_credits_attempted}`,
      r.sgpa.toFixed(2),
      r.cgpa.toFixed(2),
      r.overall_percentage.toFixed(1) + '%',
      r.result_status,
      r.result_class
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `semester_results_${department.replace(/\s+/g, '_')}_Sem${semester}_${academicYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "✅ Export Successful",
      description: `Exported ${semesterResults.length} student results`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Select Semester & Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science Engineering">Computer Science Engineering</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Electronics Engineering">Electronics Engineering</SelectItem>
                  <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
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
                placeholder="2025-26"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <TrendingUp className="h-4 w-4" />
              <span>Viewing Results For: {department} - Semester {semester} - {academicYear}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button 
              onClick={handleCalculateAllSubjectResults}
              disabled={isCalculating}
              className="flex-1"
            >
              {isCalculating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Calculating...</>
              ) : (
                <><Calculator className="h-4 w-4 mr-2" />Calculate All Subject Results</>
              )}
            </Button>

            <Button 
              onClick={handleCalculateAllSGPA}
              disabled={isCalculating}
              className="flex-1"
              variant="secondary"
            >
              {isCalculating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Calculating...</>
              ) : (
                <><TrendingUp className="h-4 w-4 mr-2" />Calculate All SGPA/CGPA</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Semester Results - All Students</CardTitle>
              <CardDescription>SGPA, CGPA, and overall performance</CardDescription>
            </div>
            <Button variant="outline" onClick={() => handleExportAll()}>
              <Download className="h-4 w-4 mr-2" />
              Export All Results
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading results...</p>
            </div>
          ) : semesterResults.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">No Semester Results Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Calculate semester results to view SGPA/CGPA for all students
              </p>
              <Button onClick={handleCalculateAllSGPA}>
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Semester Results
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
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
                    <th className="p-3 text-center">Percentage</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-left">Result Class</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {semesterResults.map((result, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{result.roll_number}</td>
                      <td className="p-3">{result.student_name}</td>
                      <td className="p-3 text-center">{result.total_subjects}</td>
                      <td className="p-3 text-center text-green-600 font-semibold">{result.subjects_passed}</td>
                      <td className="p-3 text-center text-red-600 font-semibold">{result.subjects_failed}</td>
                      <td className="p-3 text-center">{result.total_credits_earned}/{result.total_credits_attempted}</td>
                      <td className="p-3 text-center font-bold text-blue-600">{result.sgpa.toFixed(2)}</td>
                      <td className="p-3 text-center font-bold text-purple-600">{result.cgpa.toFixed(2)}</td>
                      <td className="p-3 text-center">{result.overall_percentage.toFixed(1)}%</td>
                      <td className="p-3 text-center">{getStatusBadge(result.result_status)}</td>
                      <td className="p-3">{getResultClassBadge(result.result_class)}</td>
                      <td className="p-3 text-center">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewResultSheet(result.student_id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Result
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Note */}
      {semesterResults.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Award className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Feature Note</h4>
                <p className="text-sm text-blue-800">
                  Bulk calculation will process all students automatically. Results are calculated based on component marks (IA, Oral, ESE) entered in the Marks Entry tab.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Sheet Modal */}
      {showResultSheet && selectedStudentId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Professional Result Sheet</h2>
              <Button variant="outline" onClick={() => setShowResultSheet(false)}>
                Close
              </Button>
            </div>
            <div className="p-4">
              <ProfessionalResultSheet 
                studentId={selectedStudentId}
                semester={semester}
                academicYear={academicYear}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsManager;
