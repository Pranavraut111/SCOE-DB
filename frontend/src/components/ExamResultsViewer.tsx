import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown,
  Search,
  Filter,
  Download,
  FileText,
  BarChart3,
  Users,
  Award,
  Target,
  CheckCircle,
  XCircle
} from "lucide-react";

interface ExamEvent {
  id: number;
  name: string;
  department: string;
  semester: number;
}

interface ExamResult {
  id: number;
  student_id: number;
  total_marks: number;
  total_max_marks: number;
  percentage: number;
  overall_grade: string;
  result_status: string;
  gpa?: number;
  rank?: number;
  generated_at: string;
  student?: {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    roll_number: string;
    email: string;
    department: string;
    state: string;
  };
  subject_results?: SubjectResult[];
}

interface SubjectResult {
  subject_name: string;
  marks_obtained: number;
  max_marks: number;
  grade: string;
  status: string;
}

interface ResultStatistics {
  total_students: number;
  passed_students: number;
  failed_students: number;
  absent_students: number;
  average_percentage: number;
  highest_percentage: number;
  lowest_percentage: number;
  grade_distribution: { [key: string]: number };
}

interface ExamResultsViewerProps {
  examEvent: ExamEvent;
}

const ExamResultsViewer = ({ examEvent }: ExamResultsViewerProps) => {
  const { toast } = useToast();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [statistics, setStatistics] = useState<ResultStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rank');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchResults();
    fetchStatistics();
  }, [examEvent.id]);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/exams/events/${examEvent.id}/results/`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load exam results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`/api/v1/exams/events/${examEvent.id}/results/statistics/`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleGenerateResults = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/v1/exams/events/${examEvent.id}/results/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        await fetchResults();
        await fetchStatistics();
        
        toast({
          title: "Results Generated",
          description: `Generated results for ${result.generated_count} students`,
        });
      } else {
        throw new Error('Failed to generate results');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate results",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportResults = async () => {
    try {
      const response = await fetch(`/api/v1/exams/events/${examEvent.id}/results/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${examEvent.name}_results.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export Complete",
          description: "Results exported successfully",
        });
      } else {
        throw new Error('Failed to export results');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export results",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'absent':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
      case 'D':
        return 'bg-yellow-100 text-yellow-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResults = results
    .filter(result => {
      const student = result.student;
      if (!student) return false;

      const matchesSearch = searchTerm === '' || 
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_number.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || result.result_status === statusFilter;
      const matchesGrade = gradeFilter === 'all' || result.overall_grade === gradeFilter;

      return matchesSearch && matchesStatus && matchesGrade;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rank':
          return (a.rank || 999) - (b.rank || 999);
        case 'percentage':
          return b.percentage - a.percentage;
        case 'name':
          return (a.student?.first_name || '').localeCompare(b.student?.first_name || '');
        case 'roll':
          return (a.student?.roll_number || '').localeCompare(b.student?.roll_number || '');
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Exam Results - {examEvent.name}
              </CardTitle>
              <CardDescription>
                View and manage exam results and statistics
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleExportResults}
                variant="outline"
                disabled={results.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button 
                onClick={handleGenerateResults}
                disabled={isGenerating}
                className="bg-gradient-primary hover:bg-primary-hover"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate Results'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{statistics.total_students}</div>
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
                  <div className="text-2xl font-bold">{statistics.passed_students}</div>
                  <div className="text-sm text-muted-foreground">
                    Passed ({statistics.total_students > 0 ? Math.round((statistics.passed_students / statistics.total_students) * 100) : 0}%)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <div className="text-2xl font-bold">{statistics.failed_students}</div>
                  <div className="text-sm text-muted-foreground">
                    Failed ({statistics.total_students > 0 ? Math.round((statistics.failed_students / statistics.total_students) * 100) : 0}%)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{statistics.average_percentage.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Average</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grade Distribution */}
      {statistics && statistics.grade_distribution && (
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(statistics.grade_distribution).map(([grade, count]) => (
                <div key={grade} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold ${getGradeColor(grade)}`}>
                    {grade}
                  </div>
                  <div className="mt-2 text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground">
                    {statistics.total_students > 0 ? Math.round((count / statistics.total_students) * 100) : 0}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="F">F</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rank">Sort by Rank</SelectItem>
                <SelectItem value="percentage">Sort by Percentage</SelectItem>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="roll">Sort by Roll No.</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Results ({filteredResults.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
              <p className="text-muted-foreground mb-4">
                {results.length === 0 
                  ? "Generate results to view student performance" 
                  : "No results match the current filters"
                }
              </p>
              {results.length === 0 && (
                <Button onClick={handleGenerateResults} disabled={isGenerating}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Results
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <Card key={result.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {result.rank && result.rank <= 3 && (
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold ${
                              result.rank === 1 ? 'bg-yellow-500' : 
                              result.rank === 2 ? 'bg-gray-400' : 'bg-amber-600'
                            }`}>
                              {result.rank}
                            </div>
                          )}
                          
                          <div>
                            <h4 className="font-semibold text-lg">
                              {result.student?.first_name} {result.student?.middle_name} {result.student?.last_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Roll: {result.student?.roll_number} • Email: {result.student?.email}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Rank</Label>
                            <div className="font-semibold">{result.rank || 'N/A'}</div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-muted-foreground">Total Marks</Label>
                            <div className="font-semibold">
                              {result.total_marks} / {result.total_max_marks}
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-muted-foreground">Percentage</Label>
                            <div className="font-semibold">{result.percentage.toFixed(2)}%</div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-muted-foreground">Grade</Label>
                            <Badge className={getGradeColor(result.overall_grade)}>
                              {result.overall_grade}
                            </Badge>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-muted-foreground">Status</Label>
                            <Badge className={getStatusColor(result.result_status)}>
                              {result.result_status}
                            </Badge>
                          </div>

                          {result.gpa && (
                            <div>
                              <Label className="text-xs text-muted-foreground">GPA</Label>
                              <div className="font-semibold">{result.gpa.toFixed(2)}</div>
                            </div>
                          )}
                        </div>

                        {/* Subject-wise Results */}
                        {result.subject_results && result.subject_results.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Subject-wise Performance</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {result.subject_results.map((subject, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                  <div className="font-medium text-sm">{subject.subject_name}</div>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-sm">
                                      {subject.marks_obtained} / {subject.max_marks}
                                    </span>
                                    <Badge 
                                      className={getGradeColor(subject.grade)}
                                    >
                                      {subject.grade}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 text-right">
                        <div className="text-xs text-muted-foreground mb-1">Generated</div>
                        <div className="text-sm">
                          {new Date(result.generated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamResultsViewer;
