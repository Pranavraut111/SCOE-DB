import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, X } from "lucide-react";

interface ExamEventFormProps {
  onEventCreated: (event: any) => void;
  onCancel: () => void;
  editingEvent?: any;
}

const ExamEventForm = ({ onEventCreated, onCancel, editingEvent }: ExamEventFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: editingEvent?.name || '',
    description: editingEvent?.description || '',
    exam_type: editingEvent?.exam_type || '',
    department: editingEvent?.department || '',
    semester: editingEvent?.semester?.toString() || '',
    academic_year: editingEvent?.academic_year || '',
    start_date: editingEvent?.start_date || '',
    end_date: editingEvent?.end_date || '',
    instructions: editingEvent?.instructions || '',
    passing_marks_percentage: editingEvent?.passing_marks_percentage?.toString() || '40'
  });

  const examTypes = [
    { value: 'mid_term', label: 'Mid-Term Examination' },
    { value: 'end_term', label: 'End-Term Examination' },
    { value: 'internal', label: 'Internal Assessment' },
    { value: 'practical', label: 'Practical Examination' },
    { value: 'viva', label: 'Viva Voce' },
    { value: 'project', label: 'Project Evaluation' }
  ];

  const departments = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering'
  ];

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateAcademicYear = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // If it's before June, we're in the previous academic year
    if (currentMonth < 5) {
      return `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
    } else {
      return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.exam_type || !formData.department || 
        !formData.semester || !formData.start_date || !formData.end_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        semester: parseInt(formData.semester),
        passing_marks_percentage: parseFloat(formData.passing_marks_percentage),
        academic_year: formData.academic_year || generateAcademicYear(),
        created_by: 'Admin' // This should come from auth context
      };

      const url = editingEvent ? `/api/v1/exams/events/${editingEvent.id}` : '/api/v1/exams/events/';
      const method = editingEvent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newEvent = await response.json();
        onEventCreated(newEvent);
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create exam event');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create exam event",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {editingEvent ? 'Edit Exam Event' : 'Create Exam Event'}
          </CardTitle>
          <CardDescription>
            {editingEvent ? 'Update examination event details' : 'Set up a new examination event for your institution'}
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Second Year Mid-Term Exams, Winter 2025"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="exam_type">Exam Type *</Label>
              <Select value={formData.exam_type} onValueChange={(value) => setFormData(prev => ({ ...prev, exam_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mid-Term Examination">Mid-Term Examination</SelectItem>
                  <SelectItem value="End-Term Examination">End-Term Examination</SelectItem>
                  <SelectItem value="Internal Assessment">Internal Assessment</SelectItem>
                  <SelectItem value="Practical Examination">Practical Examination</SelectItem>
                  <SelectItem value="Viva Voce">Viva Voce</SelectItem>
                  <SelectItem value="Project Evaluation">Project Evaluation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="semester">Semester *</Label>
              <Select value={formData.semester} onValueChange={(value) => handleInputChange('semester', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="academic_year">Academic Year</Label>
              <Input
                id="academic_year"
                value={formData.academic_year}
                onChange={(e) => handleInputChange('academic_year', e.target.value)}
                placeholder={generateAcademicYear()}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: YYYY-YY (e.g., 2024-25)
              </p>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Additional Settings */}
          <div>
            <Label htmlFor="passing_marks_percentage">Passing Marks Percentage</Label>
            <Input
              id="passing_marks_percentage"
              type="number"
              min="0"
              max="100"
              value={formData.passing_marks_percentage}
              onChange={(e) => handleInputChange('passing_marks_percentage', e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum percentage required to pass (default: 40%)
            </p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the exam event"
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Instructions */}
          <div>
            <Label htmlFor="instructions">General Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              placeholder="General instructions for students and supervisors"
              className="mt-1"
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  {editingEvent ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                editingEvent ? 'Update Exam Event' : 'Create Exam Event'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExamEventForm;
