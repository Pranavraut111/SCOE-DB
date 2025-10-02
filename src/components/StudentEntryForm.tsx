import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Student, BRANCHES, StudentCreate } from '@/types/student';
import { generateRollNumber, generatePersonalEmail } from '@/utils/studentUtils';
import { User, Save } from "lucide-react";
import api from '@/lib/api';


interface StudentEntryFormProps {
  onStudentAdded: () => void;
}

const StudentEntryForm = ({ onStudentAdded }: StudentEntryFormProps) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    gender: '',
    category: '',
    dateOfBirth: '',
    phoneNumber: '',
    branch: '',
    year: '',
    motherName: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const required = ['firstName', 'middleName', 'lastName', 'address', 'gender', 'category', 'dateOfBirth', 'phoneNumber', 'branch', 'year', 'motherName'];
    
    // Check required fields
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        errors[field] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // Date of birth validation
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const minAgeDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
      
      if (dob > minAgeDate) {
        errors.dateOfBirth = 'Student must be at least 10 years old';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim();
      const rollNumber = await generateRollNumber(formData.branch, formData.year);
      const personalEmail = generatePersonalEmail(fullName, rollNumber, formData.branch);
      
      const studentData: StudentCreate = {
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        email: personalEmail,
        phone: formData.phoneNumber,
        address: formData.address,
        gender: formData.gender as Student['gender'],
        date_of_birth: formData.dateOfBirth,
        admission_number: rollNumber, // Using roll number as admission number
        roll_number: rollNumber,
        category: formData.category,
        branch: formData.branch,
        year: formData.year as Student['year'],
        mother_name: formData.motherName,
        department: formData.branch,
        state: formData.year === '1' ? '1st Year' : 
               formData.year === '2' ? '2nd Year' : 
               formData.year === '3' ? '3rd Year' : 
               formData.year === '4' ? '4th Year' : `${formData.year} Year`,
        country: 'India',
        postal_code: '',
        institutional_email: personalEmail
      };

      // First save to backend
      const response = await api.students.create(studentData);
      
      // Then save to local storage for offline access
      const student: Student = {
        id: response.id.toString(),
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        email: personalEmail,
        phone: formData.phoneNumber,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender as Student['gender'],
        address: formData.address,
        state: formData.year === '1' ? '1st Year' : 
               formData.year === '2' ? '2nd Year' : 
               formData.year === '3' ? '3rd Year' : 
               formData.year === '4' ? '4th Year' : `${formData.year} Year`,
        country: 'India',
        admission_number: rollNumber,
        roll_number: rollNumber,
        institutional_email: personalEmail,
        department: formData.branch,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Additional fields
        category: formData.category,
        branch: formData.branch,
        year: formData.year,
        mother_name: formData.motherName,
        subjects: [],
        // Legacy fields
        rollNumber: rollNumber,
        personalEmail: personalEmail,
        name: fullName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        motherName: formData.motherName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Update local storage
      const students = JSON.parse(localStorage.getItem('campus_students') || '[]');
      students.push(student);
      localStorage.setItem('campus_students', JSON.stringify(students));
      
      toast({
        title: "Student added successfully!",
        description: `Roll Number: ${rollNumber} | Email: ${personalEmail}`,
      });

      // Reset form
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        address: '',
        gender: '',
        category: '',
        dateOfBirth: '',
        phoneNumber: '',
        branch: '',
        year: '',
        motherName: '',
      });
      
      onStudentAdded();
      
    } catch (error: any) {
      console.error('Error adding student:', error);
      let errorMessage = 'Failed to add student. Please try again.';
      
      if (error.response) {
        // Handle validation errors (422 Unprocessable Entity)
        if (error.response.status === 422 && error.response.data.detail) {
          const validationErrors: Record<string, string> = {};
          error.response.data.detail.forEach((err: any) => {
            const field = err.loc[err.loc.length - 1];
            validationErrors[field] = err.msg;
          });
          setFieldErrors(validationErrors);
          return; // Don't show toast, errors are displayed in the form
        }
        
        // Handle other error responses
        if (error.response.data && error.response.data.detail) {
          errorMessage = Array.isArray(error.response.data.detail) 
            ? error.response.data.detail.map((d: any) => d.msg || d).join('\n')
            : error.response.data.detail;
        } else if (error.response.status === 400) {
          errorMessage = 'Validation error. Please check your input.';
        } else if (error.response.status === 401) {
          errorMessage = 'Unauthorized. Please log in again.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      toast({
        title: "Error adding student",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Manually Add Students
          </CardTitle>
          <CardDescription>
            Enter student information below. Roll number and personal email will be auto-generated. Subjects can be managed later through Subject Master.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(fieldErrors).length > 0 && (
            <div className="mb-4 p-4 bg-destructive/10 text-destructive-foreground rounded-md">
              <h4 className="font-medium mb-2">Please fix the following errors:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {Object.entries(fieldErrors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  className={fieldErrors.firstName ? 'border-destructive' : ''}
                  required
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name *</Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                  placeholder="Enter middle name"
                  className={fieldErrors.middleName ? 'border-destructive' : ''}
                  required
                />
                {fieldErrors.middleName && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.middleName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  className={fieldErrors.lastName ? 'border-destructive' : ''}
                  required
                />
                {fieldErrors.lastName && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.lastName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherName">Mother's Name *</Label>
                <Input
                  id="motherName"
                  value={formData.motherName}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  placeholder="Enter mother's name"
                  className={fieldErrors.motherName ? 'border-destructive' : ''}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    // Only allow numbers and limit to 10 digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleInputChange('phoneNumber', value);
                  }}
                  placeholder="Enter 10-digit phone number"
                  className={fieldErrors.phoneNumber ? 'border-destructive' : ''}
                  required
                />
                {fieldErrors.phoneNumber && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.phoneNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  required
                >
                  <SelectTrigger className={fieldErrors.gender ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.gender && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                  required
                >
                  <SelectTrigger className={fieldErrors.category ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="obc">OBC</SelectItem>
                    <SelectItem value="sc">SC</SelectItem>
                    <SelectItem value="st">ST</SelectItem>
                    <SelectItem value="ews">EWS</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.category && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={fieldErrors.dateOfBirth ? 'border-destructive' : ''}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
                {fieldErrors.dateOfBirth && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.dateOfBirth}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch *</Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) => handleInputChange('branch', value)}
                  required
                >
                  <SelectTrigger className={fieldErrors.branch ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.branch && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.branch}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) => handleInputChange('year', value)}
                  required
                >
                  <SelectTrigger className={fieldErrors.year ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Year</SelectItem>
                    <SelectItem value="2">Second Year</SelectItem>
                    <SelectItem value="3">Third Year</SelectItem>
                    <SelectItem value="4">Fourth Year</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.year && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.year}</p>
                )}
              </div>

            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter full address"
                className={fieldErrors.address ? 'border-destructive' : ''}
                rows={3}
                required
              />
              {fieldErrors.address && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.address}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:bg-primary-hover"
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Adding Student...' : 'Add Student'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentEntryForm;