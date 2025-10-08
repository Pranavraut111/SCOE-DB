import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Calendar, 
  Users, 
  BarChart3, 
  FileText, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Calculator
} from "lucide-react";

interface SubjectComponent {
  id: number;
  component: string; // IA, OR, ESE, PRACTICAL, VIVA
  status: string;
  total_marks: number;
  passing_marks: number;
  percentage: number;
}

interface Subject {
  id: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  semester: string;
  department: string;
  passing_criteria: number;
  components: SubjectComponent[];
}

interface ExamEvent {
  id: number;
  name: string;
  department: string;
  semester: number;
  exam_type: 'IA' | 'OR' | 'ESE' | 'PRACTICAL' | 'VIVA';
  start_date: string;
  end_date: string;
  academic_year: string;
}

interface StudentResult {
  id: number;
  student_id: number;
  subject_id: number;
  exam_event_id: number;
  component_type: string;
  marks_obtained: number;
  total_marks: number;
  status: 'PASS' | 'FAIL' | 'ABSENT';
  student_name: string;
  roll_number: string;
}

interface ComprehensiveExamManagerProps {
  examEvent: ExamEvent;
}

const ComprehensiveExamManager = ({ examEvent }: ComprehensiveExamManagerProps) => {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [consolidatedResults, setConsolidatedResults] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSubjectsWithComponents();
    fetchResults();
  }, [examEvent]);

  const fetchSubjectsWithComponents = async () => {
    try {
      const response = await fetch(`/api/v1/subjects/?department=${examEvent.department}&semester=${examEvent.semester}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/v1/exams/events/${examEvent.id}/results/`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  };

  const generateConsolidatedResults = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/exams/results/consolidated`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          department: examEvent.department,
          semester: examEvent.semester,
          academic_year: examEvent.academic_year
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConsolidatedResults(data);
        toast({
          title: "Results Consolidated",
          description: "Successfully generated final results combining all exam components",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate consolidated results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getComponentStatus = (subject: Subject, componentType: string) => {
    const component = subject.components.find(c => c.component === componentType);
    return component?.status === 'Enabled';
  };

  const getComponentMarks = (subject: Subject, componentType: string) => {
    const component = subject.components.find(c => c.component === componentType);
    return {
      total: component?.total_marks || 0,
      passing: component?.passing_marks || 0,
      percentage: component?.percentage || 0
    };
  };

  const calculateFinalGrade = (totalMarks: number, maxMarks: number) => {
    const percentage = (totalMarks / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Comprehensive Exam Management - {examEvent.name}
              </CardTitle>
              <CardDescription>
                Component-based exam management for {examEvent.department} - Semester {examEvent.semester}
              </CardDescription>
            </div>
            <Badge variant={examEvent.exam_type === 'ESE' ? 'default' : 'secondary'}>
              {examEvent.exam_type} Exam
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="components" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="components">Subject Components</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="results">Results Entry</TabsTrigger>
          <TabsTrigger value="consolidated">Final Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Subject Components Tab */}
        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subject Components & Marking Scheme
              </CardTitle>
              <CardDescription>
                View component breakdown for each subject based on Subject Master configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjects.map((subject) => (
                  <Card key={subject.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{subject.subject_code}</h4>
                          <p className="text-muted-foreground">{subject.subject_name}</p>
                          <p className="text-sm text-blue-600">
                            Credits: {subject.credits} | Passing: {subject.passing_criteria}%
                          </p>
                        </div>
                        <Badge variant="outline">{subject.semester}</Badge>
                      </div>

                      {/* Component Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {subject.components.map((component) => (
                          <div key={component.id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{component.component}</span>
                              <Badge 
                                variant={component.status === 'Enabled' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {component.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div>Total: {component.total_marks}</div>
                              <div>Passing: {component.passing_marks}</div>
                              <div>Weight: {component.percentage}%</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Current Exam Type Highlight */}
                      {getComponentStatus(subject, examEvent.exam_type) && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-800 font-medium">
                              Current Exam: {examEvent.exam_type} 
                              ({getComponentMarks(subject, examEvent.exam_type).total} marks)
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {examEvent.exam_type} Exam Schedule
              </CardTitle>
              <CardDescription>
                Schedule exams only for subjects that have {examEvent.exam_type} component enabled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjects
                  .filter(subject => getComponentStatus(subject, examEvent.exam_type))
                  .map((subject) => {
                    const componentMarks = getComponentMarks(subject, examEvent.exam_type);
                    return (
                      <Card key={subject.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                            <div className="lg:col-span-2">
                              <h4 className="font-semibold">{subject.subject_code}</h4>
                              <p className="text-sm text-muted-foreground">{subject.subject_name}</p>
                              <p className="text-xs text-blue-600">
                                {examEvent.exam_type}: {componentMarks.total} marks
                              </p>
                            </div>
                            
                            <div>
                              <Label className="text-xs">Exam Date</Label>
                              <Input type="date" className="mt-1" />
                            </div>
                            
                            <div>
                              <Label className="text-xs">Start Time</Label>
                              <Input type="time" defaultValue="09:00" className="mt-1" />
                            </div>
                            
                            <div>
                              <Label className="text-xs">Duration (min)</Label>
                              <Input type="number" defaultValue="180" className="mt-1" />
                            </div>
                            
                            <div>
                              <Label className="text-xs">Venue</Label>
                              <Input placeholder="Room A-101" className="mt-1" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Entry Tab */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Results Entry - {examEvent.exam_type} Component
              </CardTitle>
              <CardDescription>
                Enter marks for {examEvent.exam_type} component based on subject configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select onValueChange={(value) => {
                  const subject = subjects.find(s => s.id.toString() === value);
                  setSelectedSubject(subject || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject to enter results" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects
                      .filter(subject => getComponentStatus(subject, examEvent.exam_type))
                      .map((subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.subject_code} - {subject.subject_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {selectedSubject && (
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{selectedSubject.subject_code}</h4>
                          <p className="text-muted-foreground">{selectedSubject.subject_name}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {getComponentMarks(selectedSubject, examEvent.exam_type).total} Marks
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Passing: {getComponentMarks(selectedSubject, examEvent.exam_type).passing}
                          </div>
                        </div>
                      </div>
                      
                      <Button className="w-full">
                        Enter {examEvent.exam_type} Results for {selectedSubject.subject_code}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consolidated Results Tab */}
        <TabsContent value="consolidated" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Final Consolidated Results
                  </CardTitle>
                  <CardDescription>
                    Combined results from all exam components (IA + OR + ESE)
                  </CardDescription>
                </div>
                <Button onClick={generateConsolidatedResults} disabled={isLoading}>
                  <Calculator className="mr-2 h-4 w-4" />
                  {isLoading ? 'Generating...' : 'Generate Final Results'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {consolidatedResults.length > 0 ? (
                <div className="space-y-4">
                  {consolidatedResults.map((result, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <h4 className="font-semibold">{result.student_name}</h4>
                            <p className="text-sm text-muted-foreground">{result.roll_number}</p>
                          </div>
                          <div>
                            <div className="text-sm">IA: {result.ia_marks || 0}/{result.ia_total || 0}</div>
                            <div className="text-sm">OR: {result.or_marks || 0}/{result.or_total || 0}</div>
                            <div className="text-sm">ESE: {result.ese_marks || 0}/{result.ese_total || 0}</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold">
                              {result.total_marks}/{result.max_marks}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {((result.total_marks / result.max_marks) * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <Badge 
                              variant={result.final_status === 'PASS' ? 'default' : 'destructive'}
                              className="text-lg px-3 py-1"
                            >
                              {calculateFinalGrade(result.total_marks, result.max_marks)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Consolidated Results</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate final results by combining all exam components
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Exam Analytics & Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold">85%</div>
                        <div className="text-sm text-muted-foreground">Pass Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold">72.5</div>
                        <div className="text-sm text-muted-foreground">Average Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-8 w-8 text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold">12</div>
                        <div className="text-sm text-muted-foreground">A+ Grades</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveExamManager;
