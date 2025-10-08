import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Users, 
  FileText, 
  BarChart3, 
  CheckCircle,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
  AlertTriangle
} from "lucide-react";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  dependencies: string[];
  estimatedTime: string;
  responsible: string;
  icon: any;
}

const ExamWorkflowPlanner = () => {
  const [currentPhase, setCurrentPhase] = useState<'planning' | 'execution' | 'evaluation' | 'results'>('planning');

  const workflowSteps: WorkflowStep[] = [
    // Planning Phase
    {
      id: 'subject_setup',
      title: 'Subject Master Configuration',
      description: 'Configure subjects with components (IA: 20, OR: 25, ESE: 80), passing criteria, and weightages',
      status: 'completed',
      dependencies: [],
      estimatedTime: '2-3 days',
      responsible: 'Academic Office',
      icon: BookOpen
    },
    {
      id: 'academic_calendar',
      title: 'Academic Calendar Setup',
      description: 'Define exam dates, IA schedules, OR dates, and ESE periods for the semester',
      status: 'completed',
      dependencies: ['subject_setup'],
      estimatedTime: '1 day',
      responsible: 'Exam Cell',
      icon: Calendar
    },
    {
      id: 'student_eligibility',
      title: 'Student Eligibility Assessment',
      description: 'Import eligible students via Excel, check attendance criteria, and fee clearance',
      status: 'in_progress',
      dependencies: ['academic_calendar'],
      estimatedTime: '2-3 days',
      responsible: 'Exam Cell + Accounts',
      icon: Users
    },

    // Execution Phase - IA Exams
    {
      id: 'ia_scheduling',
      title: 'IA Exam Scheduling',
      description: 'Schedule IA exams for subjects with IA component enabled (20 marks)',
      status: 'pending',
      dependencies: ['student_eligibility'],
      estimatedTime: '1 day',
      responsible: 'Exam Cell',
      icon: Calendar
    },
    {
      id: 'ia_conduct',
      title: 'Conduct IA Exams',
      description: 'Conduct Internal Assessment exams, maintain attendance, handle malpractice',
      status: 'pending',
      dependencies: ['ia_scheduling'],
      estimatedTime: '1 week',
      responsible: 'Faculty + Exam Cell',
      icon: FileText
    },
    {
      id: 'ia_evaluation',
      title: 'IA Results Processing',
      description: 'Evaluate IA papers, enter marks, generate component-wise results',
      status: 'pending',
      dependencies: ['ia_conduct'],
      estimatedTime: '1 week',
      responsible: 'Faculty',
      icon: BarChart3
    },

    // Execution Phase - OR Exams
    {
      id: 'or_scheduling',
      title: 'OR Exam Scheduling',
      description: 'Schedule Oral/Practical exams for subjects with OR component (25 marks)',
      status: 'pending',
      dependencies: ['ia_evaluation'],
      estimatedTime: '1 day',
      responsible: 'Exam Cell',
      icon: Calendar
    },
    {
      id: 'or_conduct',
      title: 'Conduct OR Exams',
      description: 'Conduct Oral/Practical exams with external/internal examiners',
      status: 'pending',
      dependencies: ['or_scheduling'],
      estimatedTime: '3-5 days',
      responsible: 'Faculty + External Examiners',
      icon: Users
    },
    {
      id: 'or_evaluation',
      title: 'OR Results Processing',
      description: 'Process OR marks, validate with external examiner signatures',
      status: 'pending',
      dependencies: ['or_conduct'],
      estimatedTime: '2-3 days',
      responsible: 'Faculty + Exam Cell',
      icon: CheckCircle
    },

    // Execution Phase - ESE
    {
      id: 'ese_scheduling',
      title: 'ESE Exam Scheduling',
      description: 'Schedule End Semester Exams for all subjects with ESE component (80 marks)',
      status: 'pending',
      dependencies: ['or_evaluation'],
      estimatedTime: '2 days',
      responsible: 'Exam Cell',
      icon: Calendar
    },
    {
      id: 'ese_conduct',
      title: 'Conduct ESE Exams',
      description: 'Conduct semester-end theory exams with proper invigilation and security',
      status: 'pending',
      dependencies: ['ese_scheduling'],
      estimatedTime: '2-3 weeks',
      responsible: 'Exam Cell + Faculty',
      icon: FileText
    },
    {
      id: 'ese_evaluation',
      title: 'ESE Paper Evaluation',
      description: 'Evaluate ESE papers, double valuation, moderation process',
      status: 'pending',
      dependencies: ['ese_conduct'],
      estimatedTime: '2-3 weeks',
      responsible: 'Faculty + External Examiners',
      icon: BarChart3
    },

    // Results Phase
    {
      id: 'result_consolidation',
      title: 'Result Consolidation',
      description: 'Merge IA + OR + ESE marks, apply passing criteria, calculate final grades',
      status: 'pending',
      dependencies: ['ese_evaluation'],
      estimatedTime: '3-5 days',
      responsible: 'Exam Cell',
      icon: Award
    },
    {
      id: 'result_verification',
      title: 'Result Verification',
      description: 'Verify consolidated results, check passing criteria, handle grace marks',
      status: 'pending',
      dependencies: ['result_consolidation'],
      estimatedTime: '2-3 days',
      responsible: 'Exam Cell + HOD',
      icon: CheckCircle
    },
    {
      id: 'result_publication',
      title: 'Result Publication',
      description: 'Publish final results, generate transcripts, handle revaluation requests',
      status: 'pending',
      dependencies: ['result_verification'],
      estimatedTime: '1-2 days',
      responsible: 'Exam Cell',
      icon: FileText
    }
  ];

  const getPhaseSteps = (phase: string) => {
    switch (phase) {
      case 'planning':
        return workflowSteps.slice(0, 3);
      case 'execution':
        return workflowSteps.slice(3, 12);
      case 'evaluation':
        return workflowSteps.slice(12, 15);
      case 'results':
        return workflowSteps.slice(15);
      default:
        return [];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const phases = [
    { id: 'planning', name: 'Planning', icon: BookOpen, color: 'blue' },
    { id: 'execution', name: 'Execution', icon: Calendar, color: 'orange' },
    { id: 'evaluation', name: 'Evaluation', icon: BarChart3, color: 'purple' },
    { id: 'results', name: 'Results', icon: Award, color: 'green' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Complete Exam Management Workflow
          </CardTitle>
          <CardDescription>
            End-to-end exam management process from planning to result publication
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Phase Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              const isActive = currentPhase === phase.id;
              const isCompleted = phases.findIndex(p => p.id === currentPhase) > index;
              
              return (
                <div key={phase.id} className="flex items-center">
                  <Button
                    variant={isActive ? 'default' : isCompleted ? 'secondary' : 'outline'}
                    onClick={() => setCurrentPhase(phase.id as any)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {phase.name}
                  </Button>
                  {index < phases.length - 1 && (
                    <ArrowRight className="h-4 w-4 mx-4 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Phase Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{currentPhase} Phase</CardTitle>
          <CardDescription>
            {currentPhase === 'planning' && 'Setup and configuration steps before exam execution'}
            {currentPhase === 'execution' && 'Conducting IA, OR, and ESE exams in sequence'}
            {currentPhase === 'evaluation' && 'Paper evaluation and marks processing'}
            {currentPhase === 'results' && 'Result consolidation and publication'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getPhaseSteps(currentPhase).map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className="h-5 w-5 mt-1 text-primary" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{step.title}</h4>
                            <Badge className={getStatusColor(step.status)}>
                              {step.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">
                            {step.description}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Time: </span>
                              {step.estimatedTime}
                            </div>
                            <div>
                              <span className="font-medium">Responsible: </span>
                              {step.responsible}
                            </div>
                            <div>
                              <span className="font-medium">Dependencies: </span>
                              {step.dependencies.length > 0 ? step.dependencies.join(', ') : 'None'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Key Implementation Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Key Implementation Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Component-Based Scheduling</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Only schedule exams for enabled components</li>
                    <li>• IA exams: 20 marks, internal evaluation</li>
                    <li>• OR exams: 25 marks, practical/oral</li>
                    <li>• ESE exams: 80 marks, theory papers</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Result Consolidation</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Automatic component merging</li>
                    <li>• Passing criteria validation</li>
                    <li>• Grade calculation (A+, A, B+, etc.)</li>
                    <li>• Final transcript generation</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Excel Integration</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Student eligibility import</li>
                    <li>• Bulk result entry templates</li>
                    <li>• Component-wise mark sheets</li>
                    <li>• Final result export</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Quality Assurance</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Double valuation for ESE</li>
                    <li>• Moderation process</li>
                    <li>• Result verification workflow</li>
                    <li>• Revaluation handling</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamWorkflowPlanner;
