import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/context/AuthContext';

interface TutorApplication {
  id: string;
  studentName: string;
  studentEmail: string;
  subjects: string[];
  experienceDescription: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedDate: string;
  availability?: Array<{ day: string; start: string; end: string }>;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TutorApplicationsTab() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.isAdmin) {
      fetchApplications();
    } else {
      console.log('User is not an admin:', user);
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      console.log('Fetching applications with token:', token.substring(0, 10) + '...');

      const response = await fetch('http://localhost:9090/api/tutoring-applications', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Fetch error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(errorData.message || `Failed to fetch applications: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received applications:', data);

      const mappedApplications: TutorApplication[] = data.map((app: any) => {
        // Parse malformed modules array (e.g., ["\"Math\"", "\"Physics\""])
        let subjects: string[] = [];
        try {
          subjects = app.modules.map((mod: string) => JSON.parse(mod.replace(/\\"/g, '"')));
        } catch (e) {
          console.warn('Failed to parse modules for application:', app.id, e);
          subjects = app.modules || [];
        }

        // Log status for debugging
        console.log('Raw status for application', app.id, ':', app.status);
        const mappedStatus = app.status?.toLowerCase() || 'pending';
        console.log('Mapped status for application', app.id, ':', mappedStatus);

        // Log availability for debugging
        console.log('Availability for application', app.id, ':', app.availabilityJson?.availability);

        if (!app.student || !app.status) {
          console.warn('Invalid application data:', app);
        }
        return {
          id: app.id || 'unknown',
          studentName: app.student?.name || 'Unknown',
          studentEmail: app.student?.email || 'N/A',
          subjects,
          experienceDescription: app.experienceDescription || 'N/A',
          status: mappedStatus as 'pending' | 'accepted' | 'rejected',
          appliedDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A',
          availability: app.availabilityJson?.availability || [],
        };
      });

      setApplications(mappedApplications);
      console.log('Mapped applications:', mappedApplications);
    } catch (error: any) {
      console.error('Fetch applications failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load tutor applications.',
        variant: 'destructive',
      });
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`http://localhost:9090/api/tutoring-applications/${id}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to accept application');
      }

      setApplications(prev =>
        prev.map(app =>
          app.id === id ? { ...app, status: 'accepted' } : app
        )
      );
      toast({
        title: 'Application Accepted',
        description: 'The tutor application has been accepted.',
      });
      await fetchApplications();
    } catch (error: any) {
      console.error('Accept application failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept the application.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`http://localhost:9090/api/tutoring-applications/${id}/decline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to decline application');
      }

      setApplications(prev =>
        prev.map(app =>
          app.id === id ? { ...app, status: 'rejected' } : app
        )
      );
      toast({
        title: 'Application Rejected',
        description: 'The tutor application has been rejected.',
        variant: 'destructive',
      });
      await fetchApplications();
    } catch (error: any) {
      console.error('Reject application failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject the application.',
        variant: 'destructive',
      });
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`http://localhost:9090/api/tutoring-applications/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete application');
      }

      setApplications(prev => prev.filter(app => app.id !== id));
      toast({
        title: 'Application Removed',
        description: 'The application has been permanently removed.',
      });
      await fetchApplications();
    } catch (error: any) {
      console.error('Delete application failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete the application.',
        variant: 'destructive',
      });
    }
  };

  const handleViewTranscript = async (id: string, studentName: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`http://localhost:9090/api/tutoring-applications/${id}/transcript`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch transcript URL');
      }

      const url = await response.text();
      window.open(url, '_blank', 'noopener,noreferrer');

      toast({
        title: 'Opening Transcript',
        description: `Opening transcript for ${studentName}`,
      });
    } catch (error: any) {
      console.error('View transcript failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to open transcript.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-success text-success-foreground">Accepted</Badge>;
      case 'rejected':
      case 'declined': // Handle both 'rejected' and 'declined' for robustness
        return <Badge className="bg-destructive text-destructive-foreground">Declined</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      default:
        console.warn('Unexpected status value:', status);
        return <Badge className="bg-muted text-muted-foreground">Unknown</Badge>;
    }
  };

  const renderAvailability = (availability: TutorApplication['availability']) => {
    const dayMap = DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {} as Record<string, string[]>);

    availability?.forEach(slot => {
      if (dayMap[slot.day]) {
        dayMap[slot.day].push(`${slot.start}-${slot.end}`);
      }
    });

    return DAYS_OF_WEEK.map(day => (
      <TableCell
        key={day}
        className={`p-2 text-xs rounded text-center ${
          dayMap[day].length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
        }`}
      >
        <div className="font-medium">{day}</div>
        <span style={{ whiteSpace: 'nowrap' }}>
          {dayMap[day].length > 0 ? dayMap[day].join(', ') : 'N/A'}
        </span>
      </TableCell>
    ));
  };

  if (!user?.isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Only administrators can view tutor applications.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

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
              <TableHead>Experience</TableHead>
              {DAYS_OF_WEEK.map(day => (
                <TableHead key={day} className="text-center">{day}</TableHead>
              ))}
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
                <TableCell>{application.experienceDescription}</TableCell>
                {renderAvailability(application.availability)}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewTranscript(application.id, application.studentName)}
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