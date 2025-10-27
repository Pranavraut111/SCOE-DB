import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Download, Upload, CheckCircle, Users, AlertCircle, FileSpreadsheet } from "lucide-react";

interface ExamEvent {
  id: number;
  name: string;
  department: string;
  semester: number;
}

interface Subject {
  id: number;
  subject_code: string;
  subject_name: string;
  credits: number;
}

interface SubjectComponent {
  id: number;
  component_type: string;
  resolution: string;
  out_of_marks: number;
}

interface StudentMark {
  student_id: number;
  roll_number: string;
  student_name: string;
  marks_obtained: number;
  is_absent: boolean;
}

interface ComponentMarksEntryProps {
  examEvent: ExamEvent;
}

const ComponentMarksEntry = ({ examEvent }: ComponentMarksEntryProps) => {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [components, setComponents] = useState<SubjectComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<SubjectComponent | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSubjects();
    loadStudents();
  }, [examEvent.id]);

  const loadSubjects = async () => {
    try {
      // Load subjects from exam schedules (subjects that are scheduled for this exam)
      const response = await fetch(`/api/v1/exams/events/${examEvent.id}/schedules/`);
      if (response.ok) {
        const schedules = await response.json();
        const subjectList = schedules.map((s: any) => ({
          id: s.subject_id || s.subject?.id,
          subject_code: s.subject?.subject_code || s.subject?.code || 'N/A',
          subject_name: s.subject?.subject_name || s.subject?.name || 'Unknown',
          credits: s.subject?.credits || 0
        }));
        setSubjects(subjectList);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast({
        title: "Error",
        description: "Failed to load subjects. Make sure subjects are scheduled for this exam.",
        variant: "destructive"
      });
    }
  };

  const loadStudents = async () => {
    try {
      const response = await fetch('/api/v1/students/');
      if (response.ok) {
        const data = await response.json();
        const filtered = data.filter((s: any) => 
          s.department === examEvent.department && 
          s.current_semester === examEvent.semester
        );
        setStudents(filtered);
        
        // Initialize marks array
        const initialMarks = filtered.map((s: any) => ({
          student_id: s.id,
          roll_number: s.roll_number,
          student_name: `${s.first_name} ${s.last_name}`,
          marks_obtained: 0,
          is_absent: false
        }));
        setStudentMarks(initialMarks);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleSubjectChange = async (subjectId: string) => {
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    if (!subject) return;
    
    setSelectedSubject(subject);
    setSelectedComponent(null);
    
    // Load components for this subject
    try {
      const response = await fetch(`/api/v1/subjects/${subjectId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Subject data:', data);
        // Handle both possible response formats
        const componentsList = data.components || data.subject_components || [];
        setComponents(componentsList);
        
        if (componentsList.length === 0) {
          toast({
            title: "No Components Found",
            description: "This subject doesn't have components defined. Please add components in Subject Master first.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error loading components:', error);
      toast({
        title: "Error",
        description: "Failed to load components for this subject",
        variant: "destructive"
      });
    }
  };

  const handleComponentChange = (componentId: string) => {
    const component = components.find(c => c.id === parseInt(componentId));
    setSelectedComponent(component || null);
  };

  const handleMarksChange = (studentId: number, marks: string) => {
    setStudentMarks(prev => prev.map(sm => 
      sm.student_id === studentId 
        ? { ...sm, marks_obtained: parseFloat(marks) || 0 }
        : sm
    ));
  };

  const handleAbsentToggle = (studentId: number) => {
    setStudentMarks(prev => prev.map(sm => 
      sm.student_id === studentId 
        ? { ...sm, is_absent: !sm.is_absent, marks_obtained: sm.is_absent ? 0 : sm.marks_obtained }
        : sm
    ));
  };

  const handleSaveMarks = async () => {
    if (!selectedSubject || !selectedComponent) {
      toast({
        title: "Selection Required",
        description: "Please select both subject and component",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/results/marks/component/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: selectedSubject.id,
          subject_component_id: selectedComponent.id,
          exam_event_id: examEvent.id,
          marks_entries: studentMarks.map(sm => ({
            student_id: sm.student_id,
            marks_obtained: sm.marks_obtained,
            is_absent: sm.is_absent
          })),
          marks_entered_by: "admin"
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "✅ Marks Saved Successfully",
          description: `Saved marks for ${data.total} students`,
        });
      } else {
        throw new Error('Failed to save marks');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save marks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = [
      ['student_id', 'roll_number', 'student_name', 'marks_obtained', 'is_absent'],
      ...studentMarks.map(sm => [
        sm.student_id,
        sm.roll_number,
        sm.student_name,
        sm.marks_obtained,
        sm.is_absent ? 'true' : 'false'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marks_template_${selectedSubject?.subject_code || 'subject'}_${selectedComponent?.component_type || 'component'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleUploadCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      
      const updatedMarks = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
          student_id: parseInt(values[0]),
          roll_number: values[1],
          student_name: values[2],
          marks_obtained: parseFloat(values[3]) || 0,
          is_absent: values[4]?.toLowerCase() === 'true'
        };
      });

      setStudentMarks(updatedMarks);
      toast({
        title: "CSV Uploaded",
        description: `Loaded marks for ${updatedMarks.length} students`,
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Component-Based Marks Entry - {examEvent.name}
          </CardTitle>
          <CardDescription>
            Enter marks for IA1, IA2, Oral, ESE separately for {examEvent.department} - Semester {examEvent.semester}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Selection Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Select Subject & Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label>Component (IA, Oral, ESE)</Label>
              <Select 
                onValueChange={handleComponentChange}
                disabled={!selectedSubject || components.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select component" />
                </SelectTrigger>
                <SelectContent>
                  {components.map(component => (
                    <SelectItem key={component.id} value={component.id.toString()}>
                      {component.component_type} - {component.resolution} (Max: {component.out_of_marks})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedSubject && selectedComponent && (
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">
                  Entering marks for: {selectedSubject.subject_code} - {selectedComponent.component_type}
                </p>
                <p className="text-sm text-gray-600">
                  Maximum Marks: {selectedComponent.out_of_marks} | Students: {studentMarks.length}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSV Upload/Download */}
      {selectedSubject && selectedComponent && (
        <Card>
          <CardHeader>
            <CardTitle>CSV Upload/Download</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={handleDownloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleUploadCSV}
              className="hidden"
            />
          </CardContent>
        </Card>
      )}

      {/* Marks Entry Table */}
      {selectedSubject && selectedComponent && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Enter Marks</CardTitle>
                <CardDescription>
                  Enter marks for each student (Max: {selectedComponent.out_of_marks})
                </CardDescription>
              </div>
              <Button onClick={handleSaveMarks} disabled={loading}>
                <CheckCircle className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save All Marks'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3 text-left">Roll No</th>
                    <th className="p-3 text-left">Student Name</th>
                    <th className="p-3 text-center">Marks (/{selectedComponent.out_of_marks})</th>
                    <th className="p-3 text-center">Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {studentMarks.map((sm) => (
                    <tr key={sm.student_id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{sm.roll_number}</td>
                      <td className="p-3">{sm.student_name}</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min="0"
                          max={selectedComponent.out_of_marks}
                          value={sm.is_absent ? 0 : sm.marks_obtained}
                          onChange={(e) => handleMarksChange(sm.student_id, e.target.value)}
                          disabled={sm.is_absent}
                          className="w-24 mx-auto text-center"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={sm.is_absent}
                          onChange={() => handleAbsentToggle(sm.student_id)}
                          className="w-5 h-5 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!selectedSubject || !selectedComponent) && (
        <Card>
          <CardContent className="text-center py-12">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">Select a subject and component to start entering marks</p>
            <p className="text-sm text-gray-500">
              Choose which exam (IA1, IA2, Oral, ESE) you want to enter marks for
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComponentMarksEntry;
