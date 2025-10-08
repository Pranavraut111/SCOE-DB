import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Users, BookOpen } from "lucide-react";
import StudentEnrollmentManager from "../components/StudentEnrollmentManager";

interface ExamEvent {
  id: number;
  name: string;
  department: string;
  semester: number;
  start_date: string;
  end_date: string;
  exam_type: 'IA' | 'OR' | 'ESE' | 'PRACTICAL' | 'VIVA';
  academic_year: string;
}

const EnrollmentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [examEvent, setExamEvent] = useState<ExamEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const examEventId = searchParams.get('exam_event_id');
  const department = searchParams.get('department');
  const semester = searchParams.get('semester');

  useEffect(() => {
    if (examEventId) {
      fetchExamEvent();
    } else {
      // If no exam event ID, redirect to admin dashboard
      toast({
        title: "Missing Exam Event",
        description: "Please select an exam event first",
        variant: "destructive",
      });
      navigate('/admin');
    }
  }, [examEventId]);

  const fetchExamEvent = async () => {
    if (!examEventId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/exams/events/${examEventId}`);
      if (response.ok) {
        const data = await response.json();
        setExamEvent(data);
      } else {
        throw new Error('Failed to fetch exam event');
      }
    } catch (error) {
      console.error('Error fetching exam event:', error);
      toast({
        title: "Error",
        description: "Failed to load exam event details",
        variant: "destructive",
      });
      navigate('/admin');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!examEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="mt-20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Exam Event Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The requested exam event could not be found or has been removed.
              </p>
              <Button onClick={() => navigate('/admin')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Student Enrollment - {examEvent.name}
                </CardTitle>
                <CardDescription className="mt-2">
                  Manage student enrollments for {examEvent.department} - Semester {examEvent.semester}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(examEvent.start_date).toLocaleDateString()} - {new Date(examEvent.end_date).toLocaleDateString()}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {examEvent.exam_type}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Admin
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Student Enrollment Manager */}
        <StudentEnrollmentManager examEvent={examEvent} />
      </div>
    </div>
  );
};

export default EnrollmentPage;
