import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Student } from '@/types/student';
import { getStudentsFromStorage } from '@/utils/studentUtils';
import { 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  BookOpen,
  Search,
  ArrowLeft,
  IdCard,
  Home
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentPortal = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search required",
        description: "Please enter your roll number or email to search",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const students = getStudentsFromStorage();
      const foundStudent = students.find(s => 
        s.rollNumber.toLowerCase() === searchQuery.toLowerCase() ||
        s.personalEmail.toLowerCase() === searchQuery.toLowerCase()
      );

      if (foundStudent) {
        setStudent(foundStudent);
        toast({
          title: "Student found!",
          description: `Welcome, ${foundStudent.name}`,
        });
      } else {
        toast({
          title: "Student not found",
          description: "Please check your roll number or email and try again",
          variant: "destructive",
        });
        setStudent(null);
      }
    } catch (error) {
      toast({
        title: "Search error",
        description: "Unable to search for student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setStudent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-campus-blue-light to-background">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">CampusConnect</h1>
                  <p className="text-sm text-muted-foreground">Student Portal</p>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!student ? (
          /* Search Section */
          <div className="max-w-md mx-auto space-y-6">
            <Card className="shadow-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Student Login</CardTitle>
                <CardDescription>
                  Enter your roll number or email address to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Roll Number or Email</Label>
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., 23CSE11234 or john.doe@student.college.edu"
                    className="text-center"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full bg-gradient-primary hover:bg-primary-hover"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Searching...
                    </div>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Access Dashboard
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <IdCard className="h-4 w-4 text-muted-foreground" />
                  <span>Use your college-issued roll number</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>Or your student email address</span>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Contact admin if you don't have your credentials
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Student Dashboard */
          <div className="space-y-6 animate-fade-in">
            {/* Header with student info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {student.photo ? (
                  <img 
                    src={student.photo} 
                    alt={student.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">
                      {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-bold text-foreground">{student.name}</h2>
                  <p className="text-muted-foreground">{student.rollNumber}</p>
                  <Badge variant="secondary" className="mt-1">
                    {student.year} - {student.branch}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" onClick={clearSearch}>
                <Search className="mr-2 h-4 w-4" />
                Search Again
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Full Name</Label>
                        <p className="font-medium">{student.name}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Mother's Name</Label>
                        <p className="font-medium">{student.motherName}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Date of Birth</Label>
                        <p className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(student.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Gender</Label>
                        <p className="font-medium">{student.gender}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Category</Label>
                        <p className="font-medium">{student.category?.toUpperCase()}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Phone Number</Label>
                        <p className="font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {student.phoneNumber}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Label className="text-muted-foreground">Address</Label>
                      <p className="font-medium flex items-start gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        {student.address}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Information */}
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Branch</Label>
                        <p className="font-medium">{student.branch}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Current Year</Label>
                        <p className="font-medium">{student.year}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Roll Number</Label>
                        <p className="font-medium">{student.rollNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Student Email</Label>
                        <p className="font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {student.personalEmail}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-muted-foreground">
                        Enrolled Subjects ({student.subjects.length})
                      </Label>
                      {student.subjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {student.subjects.map((subject, index) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-lg">
                              <p className="font-medium text-sm">{subject}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No subjects assigned yet</p>
                          <p className="text-sm">Contact your administrator to enroll in subjects</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats and Actions */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-gradient-card rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {student.subjects.length}
                      </div>
                      <p className="text-sm text-muted-foreground">Enrolled Subjects</p>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-card rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {student.year.charAt(0)}
                      </div>
                      <p className="text-sm text-muted-foreground">Current Year</p>
                    </div>

                    <div className="text-center p-4 bg-gradient-card rounded-lg">
                      <div className="text-lg font-bold text-primary mb-1">
                        {student.category?.toUpperCase()}
                      </div>
                      <p className="text-sm text-muted-foreground">Category</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Information */}
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Account Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <Label className="text-muted-foreground">Registration Date</Label>
                      <p className="font-medium">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm">
                      <Label className="text-muted-foreground">Last Updated</Label>
                      <p className="font-medium">
                        {new Date(student.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Support
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Update Profile
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BookOpen className="mr-2 h-4 w-4" />
                      View Timetable
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentPortal;