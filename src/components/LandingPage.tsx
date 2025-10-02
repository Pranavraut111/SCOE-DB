import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, Settings, BookOpen, BarChart3, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Comprehensive student information system with photo uploads and data management"
    },
    {
      icon: BookOpen,
      title: "Subject Master",
      description: "Organize and manage academic subjects and course information"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Generate detailed reports and export student data in multiple formats"
    },
    {
      icon: Shield,
      title: "Secure Portal",
      description: "Role-based access control ensuring data security and privacy"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-campus-blue-light to-background">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/scoe-logo.png" 
                alt="SCOE Logo" 
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <GraduationCap className="h-8 w-8 text-primary hidden" />
              <h1 className="text-2xl font-bold text-foreground">SCOEFLOW CONNECT</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                About
              </Button>
              <Button variant="outline" size="sm">
                Contact
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Modern Campus
            <span className="text-primary"> Management System</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Streamline your educational institution with our comprehensive management platform.
            Manage students, subjects, and administrative tasks with ease and efficiency.
          </p>
          
          {/* Portal Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Card className="group hover:shadow-hover transition-all duration-300 cursor-pointer hover:-translate-y-1 w-full sm:w-80"
                  onClick={() => navigate('/admin')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Settings className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Admin Portal</CardTitle>
                <CardDescription className="text-base">
                  Manage students, subjects, and administrative functions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-primary hover:bg-primary-hover transition-all">
                  Access Admin Dashboard
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-hover transition-all duration-300 cursor-pointer hover:-translate-y-1 w-full sm:w-80"
                  onClick={() => navigate('/student')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <GraduationCap className="h-8 w-8 text-accent-foreground" />
                </div>
                <CardTitle className="text-2xl">Student Portal</CardTitle>
                <CardDescription className="text-base">
                  View your personal dashboard, subjects, and academic records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-accent text-accent-foreground hover:bg-accent/10">
                  Access Student Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Powerful Features for Modern Education
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Statistics Section */}
        <section className="text-center bg-card/50 rounded-lg p-8 shadow-card">
          <h3 className="text-2xl font-bold text-foreground mb-8">
            Trusted by Educational Institutions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Students Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Subjects Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">System Uptime</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 SCOEFLOW CONNECT. All rights reserved. Built for modern educational institutions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;