import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { FileText, Download, CheckCircle, XCircle, Award } from 'lucide-react';
import { Badge } from './ui/badge';

interface ComponentMark {
  marks_obtained: number;
  max_marks: number;
  passing_marks: number;
  is_pass: boolean;
}

interface Subject {
  subject_code: string;
  subject_name: string;
  credits: number;
  components: {
    IA?: ComponentMark;
    ESE?: ComponentMark;
    OR?: ComponentMark;
    PR?: ComponentMark;
    TW?: ComponentMark;
  };
  total_marks_obtained: number;
  total_max_marks: number;
  percentage: number;
  grade: string;
  grade_points: number;
  is_pass: boolean;
  credits_earned: number;
}

interface StudentInfo {
  id: number;
  name: string;
  roll_number: string;
  department: string;
  semester: number;
  academic_year: string;
}

interface SemesterSummary {
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

interface DetailedResultData {
  student: StudentInfo;
  subjects: Subject[];
  semester_summary: SemesterSummary;
}

interface DetailedResultSheetProps {
  studentId: number;
  academicYear: string;
  semester: number;
  onClose?: () => void;
}

const DetailedResultSheet: React.FC<DetailedResultSheetProps> = ({
  studentId,
  academicYear,
  semester,
  onClose
}) => {
  const { toast } = useToast();
  const [resultData, setResultData] = useState<DetailedResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDetailedResult();
  }, [studentId, academicYear, semester]);

  const fetchDetailedResult = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/results/detailed-result-sheet/${studentId}?academic_year=${academicYear}&semester=${semester}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setResultData(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch detailed result",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch detailed result",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeBadge = (grade: string) => {
    const colors: { [key: string]: string } = {
      'A+': 'bg-green-600',
      'A': 'bg-green-500',
      'B+': 'bg-blue-500',
      'B': 'bg-blue-400',
      'C': 'bg-yellow-500',
      'D': 'bg-orange-500',
      'F': 'bg-red-600'
    };
    return (
      <Badge className={`${colors[grade] || 'bg-gray-500'} text-white`}>
        {grade}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'PASS' ? (
      <Badge className="bg-green-600 text-white flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Pass
      </Badge>
    ) : (
      <Badge className="bg-red-600 text-white flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Fail
      </Badge>
    );
  };

  const getComponentStatus = (component: ComponentMark | undefined) => {
    if (!component) return <span className="text-gray-400">-</span>;
    
    const isPassing = component.is_pass;
    return (
      <div className={`text-center ${isPassing ? 'text-green-700' : 'text-red-700 font-bold'}`}>
        {component.marks_obtained}
        {!isPassing && <span className="ml-1">❌</span>}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading detailed result...</p>
        </CardContent>
      </Card>
    );
  }

  if (!resultData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">No result data available</p>
        </CardContent>
      </Card>
    );
  }

  const { student, subjects, semester_summary } = resultData;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Viewing Results For: {student.department} - Semester {student.semester} - {student.academic_year}</h2>
            <p className="text-sm text-gray-600 mt-1">{student.name} ({student.roll_number})</p>
          </div>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Subject-wise Results */}
      <Card className="bg-white">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Subject-Wise Component Marks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-white">
                  <th className="p-3 text-left text-sm font-medium text-gray-700">Subject Code</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-700">Subject Name</th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700">Credits</th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700">IA1</th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700">IA2</th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700">Oral</th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700">ESE</th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700">Total</th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700">%</th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700">Grade</th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700">Status</th>
                </tr>
                <tr className="border-b bg-gray-50 text-xs text-gray-500">
                  <th colSpan={3} className="p-2 text-left">Max Marks →</th>
                  <th className="p-2 text-center">20</th>
                  <th className="p-2 text-center">20</th>
                  <th className="p-2 text-center">10</th>
                  <th className="p-2 text-center">50</th>
                  <th className="p-2 text-center">100</th>
                  <th colSpan={3}></th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-sm">{subject.subject_code}</td>
                    <td className="p-3 text-sm">{subject.subject_name}</td>
                    <td className="p-3 text-center text-sm">{subject.credits}</td>
                    <td className="p-3 text-center text-sm">{getComponentStatus(subject.components.IA)}</td>
                    <td className="p-3 text-center text-sm">{getComponentStatus(subject.components.IA)}</td>
                    <td className="p-3 text-center text-sm">{getComponentStatus(subject.components.OR)}</td>
                    <td className="p-3 text-center text-sm">{getComponentStatus(subject.components.ESE)}</td>
                    <td className="p-3 text-center font-semibold text-sm">
                      {subject.total_marks_obtained}/{subject.total_max_marks}
                    </td>
                    <td className="p-3 text-center font-semibold text-sm">{subject.percentage.toFixed(1)}%</td>
                    <td className="p-3 text-center">{getGradeBadge(subject.grade)}</td>
                    <td className="p-3 text-center">
                      {subject.is_pass ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="m-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> ❌ indicates component failure. Student must pass ALL components individually to pass the subject.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Semester Summary */}
      <Card className="bg-white border">
        <CardHeader className="border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4" />
              Semester Summary
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                // Download CSV functionality
                const csvData = subjects.map(s => ({
                  'Subject Code': s.subject_code,
                  'Subject Name': s.subject_name,
                  'Credits': s.credits,
                  'IA1': s.components.IA?.marks_obtained || '-',
                  'IA2': s.components.IA?.marks_obtained || '-',
                  'Oral': s.components.OR?.marks_obtained || '-',
                  'ESE': s.components.ESE?.marks_obtained || '-',
                  'Total': `${s.total_marks_obtained}/${s.total_max_marks}`,
                  'Percentage': s.percentage.toFixed(1),
                  'Grade': s.grade,
                  'Status': s.is_pass ? 'Pass' : 'Fail'
                }));
                
                const headers = Object.keys(csvData[0]);
                const csv = [
                  headers.join(','),
                  ...csvData.map(row => headers.map(h => row[h]).join(','))
                ].join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${student.roll_number}_results.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-3 w-3" />
              Download CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg border">
              <p className="text-xs text-gray-600 mb-1">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{semester_summary.total_subjects}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Passed</p>
              <p className="text-2xl font-bold text-green-600">{semester_summary.subjects_passed}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-gray-600 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-600">{semester_summary.subjects_failed}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Credits</p>
              <p className="text-2xl font-bold text-blue-600">
                {semester_summary.total_credits_earned}/{semester_summary.total_credits_attempted}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-gray-600 mb-1">Percentage</p>
              <p className="text-2xl font-bold text-purple-600">{semester_summary.overall_percentage.toFixed(1)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">SGPA</p>
              <p className="text-3xl font-bold text-blue-600">{semester_summary.sgpa.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-gray-600 mb-1">CGPA</p>
              <p className="text-3xl font-bold text-purple-600">{semester_summary.cgpa.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border">
              <p className="text-xs text-gray-600 mb-1">Status</p>
              <div className="mt-1">
                {semester_summary.result_status === 'PASS' ? (
                  <Badge className="bg-green-600 text-white">Pass</Badge>
                ) : (
                  <Badge className="bg-red-600 text-white">Fail</Badge>
                )}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border">
              <p className="text-xs text-gray-600 mb-1">Result Class</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{semester_summary.result_class}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedResultSheet;
