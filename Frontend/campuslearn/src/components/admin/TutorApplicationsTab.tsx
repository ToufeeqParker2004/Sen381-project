import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Paperclip, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TutorApplication {
  id: number;
  studentName: string;
  studentEmail: string;
  subjects: string[];
  transcriptUrl: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedDate: string;
}

// Mock data
const mockApplications: TutorApplication[] = [
  {
    id: 1,
    studentName: 'John Anderson',
    studentEmail: 'john.anderson@campus.edu',
    subjects: ['Mathematics', 'Physics'],
    transcriptUrl: '/sample-transcript.pdf',
    status: 'pending',
    appliedDate: '2024-01-15',
  },
  {
    id: 2,
    studentName: 'Emily Davis',
    studentEmail: 'emily.davis@campus.edu',
    subjects: ['Chemistry', 'Biology'],
    transcriptUrl: '/sample-transcript.pdf',
    status: 'pending',
    appliedDate: '2024-01-14',
  },
  {
    id: 3,
    studentName: 'Michael Brown',
    studentEmail: 'michael.brown@campus.edu',
    subjects: ['Computer Science', 'Mathematics'],
    transcriptUrl: '/sample-transcript.pdf',
    status: 'accepted',
    appliedDate: '2024-01-12',
  },
  {
    id: 4,
    studentName: 'Sarah Wilson',
    studentEmail: 'sarah.wilson@campus.edu',
    subjects: ['English Literature', 'History'],
    transcriptUrl: '/sample-transcript.pdf',
    status: 'rejected',
    appliedDate: '2024-01-10',
  },
];

export default function TutorApplicationsTab() {
  const [applications, setApplications] = useState<TutorApplication[]>(mockApplications);
  const { toast } = useToast();

  const handleAccept = (id: number) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === id ? { ...app, status: 'accepted' as const } : app
      )
    );
    toast({
      title: 'Application Accepted',
      description: 'The tutor application has been accepted.',
    });
  };

  const handleReject = (id: number) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === id ? { ...app, status: 'rejected' as const } : app
      )
    );
    toast({
      title: 'Application Rejected',
      description: 'The tutor application has been rejected.',
      variant: 'destructive',
    });
  };

  const handleRemove = (id: number) => {
    setApplications(prev => prev.filter(app => app.id !== id));
    toast({
      title: 'Application Removed',
      description: 'The application has been permanently removed.',
    });
  };

  const handleViewTranscript = (transcriptUrl: string, studentName: string) => {
    // Open the PDF in a new tab
    const link = document.createElement('a');
    link.href = transcriptUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Opening Transcript',
      description: `Opening transcript for ${studentName}`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-success text-success-foreground">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tutor Applications</CardTitle>
        <CardDescription>Review and manage tutor applications from students</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Transcript</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">{application.studentName}</TableCell>
                <TableCell>{application.studentEmail}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {application.subjects.map((subject, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewTranscript(application.transcriptUrl, application.studentName)}
                  >
                    <Paperclip className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </TableCell>
                <TableCell>{application.appliedDate}</TableCell>
                <TableCell>{getStatusBadge(application.status)}</TableCell>
                <TableCell>
                  {application.status === 'pending' ? (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAccept(application.id)}
                        className="text-success hover:text-success hover:bg-success/10"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReject(application.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(application.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}