import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Student } from '@/types/student';
import { 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  BookOpen,
  ArrowLeft,
  IdCard,
  Home,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Key,
  Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import ExamNotifications from './ExamNotifications';

const StudentPortal = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleDownloadResult = async () => {
    if (!student) return;
    
    try {
      setIsLoading(true);
      
      // Fetch detailed result for this student
      const response = await axios.get(
        `/api/v1/results/detailed-result-sheet/${student.id}?academic_year=2025-26&semester=${student.current_semester || 2}`
      );
      
      if (response.data && response.data.subjects) {
        const data = response.data;
        const subjects = data.subjects;
        const summary = data.semester_summary;
        
        // Create CSV content - Simple table format
        const csvRows = [];
        
        // Add headers
        csvRows.push([
          'Roll Number',
          'Student Name',
          'Subject Code',
          'Subject Name',
          'Credits',
          'IA (Max: 20)',
          'Viva (Max: 20)',
          'ESE (Max: 60)',
          'Total',
          'Percentage',
          'Grade',
          'Status',
          'SGPA',
          'CGPA',
          'Result Class'
        ]);
        
        // Add subject rows
        subjects.forEach((subject: any, index: number) => {
          csvRows.push([
            index === 0 ? data.student.roll_number : '', // Roll number only on first row
            index === 0 ? data.student.name : '', // Name only on first row
            subject.subject_code,
            subject.subject_name,
            subject.credits,
            subject.components.IA?.marks_obtained || '-',
            subject.components.OR?.marks_obtained || '-',
            subject.components.ESE?.marks_obtained || '-',
            `${subject.total_marks_obtained}/${subject.total_max_marks}`,
            subject.percentage.toFixed(1) + '%',
            subject.grade,
            subject.is_pass ? 'Pass' : 'Fail',
            index === 0 ? summary.sgpa.toFixed(2) : '', // SGPA only on first row
            index === 0 ? summary.cgpa.toFixed(2) : '', // CGPA only on first row
            index === 0 ? summary.result_class : '' // Result class only on first row
          ]);
        });
        
        // Convert to CSV string
        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${student.roll_number}_result_sem${student.current_semester || 2}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "✅ Result Downloaded!",
          description: "Your result has been downloaded as CSV",
        });
      } else {
        toast({
          title: "No Results Found",
          description: "Your results haven't been published yet",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "❌ Download Failed",
        description: error.response?.data?.detail || "Failed to download result. Results may not be published yet.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Login required",
        description: "Please enter your institutional email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/v1/students/auth/login', {
        institutional_email: email,
        password: password
      });

      if (response.data.student) {
        setStudent(response.data.student);
        toast({
          title: "Login successful!",
          description: `Welcome, ${response.data.student.first_name} ${response.data.student.last_name}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.response?.data?.detail || "Incorrect email or password. Default password is 'Student@123'",
        variant: "destructive",
      });
      setStudent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        title: "All fields required",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "New password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post(`/api/v1/students/auth/change-password?student_id=${student?.id}`, {
        old_password: oldPassword,
        new_password: newPassword
      });

      toast({
        title: "Password changed!",
        description: "Your password has been updated successfully",
      });

      setShowChangePassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Password change failed",
        description: error.response?.data?.detail || "Could not change password. Please check your old password.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleLogout = () => {
    setStudent(null);
    setEmail('');
    setPassword('');
    setShowPassword(false);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
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
                  <h1 className="text-2xl font-bold text-foreground">SCOEFLOW CONNECT</h1>
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
          /* Login Section */
          <div className="max-w-md mx-auto space-y-6">
            <Card className="shadow-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Student Login</CardTitle>
                <CardDescription>
                  Enter your institutional email and password to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Institutional Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your institutional email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Default password: <code className="bg-muted px-1 py-0.5 rounded">Student@123</code>
                  </p>
                </div>
                <Button 
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-primary hover:bg-primary-hover"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Logging in...
                    </div>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Login
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
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>Use your institutional email address</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span>Default password is <code className="bg-muted px-1 py-0.5 rounded text-xs">Student@123</code></span>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Contact admin if you don't have your credentials or forgot your password
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
                    alt={`${student.first_name} ${student.last_name}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">
                      {student.first_name[0]}{student.last_name[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-bold text-foreground">
                    {student.first_name} {student.middle_name} {student.last_name}
                  </h2>
                  <p className="text-muted-foreground">{student.roll_number}</p>
                  <Badge variant="secondary" className="mt-1">
                    {student.state} - {student.department}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowChangePassword(true)}>
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
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
                        <p className="font-medium">{student.first_name} {student.middle_name} {student.last_name}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Mother's Name</Label>
                        <p className="font-medium">{student.mother_name}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Date of Birth</Label>
                        <p className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(student.date_of_birth).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Gender</Label>
                        <p className="font-medium capitalize">{student.gender}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Category</Label>
                        <p className="font-medium">{student.category?.toUpperCase()}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Phone Number</Label>
                        <p className="font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {student.phone}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Department</Label>
                        <p className="font-medium">{student.department}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Current Semester</Label>
                        <p className="font-medium">Semester {student.current_semester || 1}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Roll Number</Label>
                        <p className="font-medium">{student.roll_number}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Institutional Email</Label>
                        <p className="font-medium flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {student.institutional_email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Personal Email</Label>
                        <p className="font-medium flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {student.email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Admission Year</Label>
                        <p className="font-medium">{student.admission_year || 2024}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Exam Notifications */}
                <ExamNotifications
                  studentId={student.id}
                  studentName={`${student.first_name} ${student.middle_name} ${student.last_name}`}
                  rollNumber={student.roll_number}
                  department={student.department}
                  semester={student.current_semester || 1}
                />
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
                        {student.current_semester || 1}
                      </div>
                      <p className="text-sm text-muted-foreground">Current Semester</p>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-card rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {student.state}
                      </div>
                      <p className="text-sm text-muted-foreground">Academic Year</p>
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
                      <Label className="text-muted-foreground">Admission Number</Label>
                      <p className="font-medium">
                        {student.admission_number}
                      </p>
                    </div>
                    <div className="text-sm">
                      <Label className="text-muted-foreground">Student ID</Label>
                      <p className="font-medium">
                        #{student.id}
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start bg-green-50 hover:bg-green-100 border-green-200"
                      onClick={handleDownloadResult}
                      disabled={isLoading}
                    >
                      <Download className="mr-2 h-4 w-4 text-green-600" />
                      <span className="text-green-700 font-medium">Download Result</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setShowChangePassword(true)}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Support
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

      {/* Change Password Dialog */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password (minimum 8 characters)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="old-password">Current Password</Label>
              <Input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowChangePassword(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Change Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentPortal;
