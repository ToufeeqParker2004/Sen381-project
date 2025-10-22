import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditRecordDialog } from '@/components/ui/EditRecordDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, Users, BookOpen, BarChart3, Shield, Search, Plus, Edit, Trash2, Eye, AlertTriangle, Database, Flag, MessageSquare, TrendingUp, FileText, Download, CheckCircle, XCircle, Clock, Activity, Server, Zap } from 'lucide-react';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ErrorRecord, ErrorResponse } from '@/types';
import apiClient from '@/services/api';
import { userService, User } from '@/services/userServices';
export default function Admin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState('users');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record<string, any> | null>(null);
  const [errors, setErrors] = useState<ErrorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;
  const powerURL = "https://app.powerbi.com/view?r=eyJrIjoiZWNkNmVhYzQtNDliZC00YzFkLTljMTQtMmQ0ZThlZWM0YjU1IiwidCI6ImVhMWE5MDliLTY2MDAtNGEyNS04MmE1LTBjNmVkN2QwNTEzYiIsImMiOjl9&pageName=35a3420a0cb3b9bccc5e";

  // System Stats
  const systemStats = [{
    label: 'Total Users',
    value: '2,847',
    change: '+12%',
    icon: Users,
    color: 'text-primary'
  }, {
    label: 'Active Tutors',
    value: '156',
    change: '+8%',
    icon: Shield,
    color: 'text-secondary'
  }, {
    label: 'Total Topics',
    value: '1,243',
    change: '+15%',
    icon: MessageSquare,
    color: 'text-success'
  }, {
    label: 'API Uptime',
    value: '99.9%',
    change: '0%',
    icon: Server,
    color: 'text-warning'
  }];
  const [databaseTables, setDatabaseTables] = useState({
    users: [] as User[],
    tutors: [{
      id: 1,
      name: 'Prof. Adams',
      expertise: 'Mathematics',
      rating: 4.8,
      sessions: 234
    }, {
      id: 2,
      name: 'Dr. Brown',
      expertise: 'Physics',
      rating: 4.9,
      sessions: 189
    }, {
      id: 3,
      name: 'Prof. Garcia',
      expertise: 'Chemistry',
      rating: 4.7,
      sessions: 156
    }],
    topics: [{
      id: 1,
      title: 'Linear Algebra Help',
      author: 'Student A',
      replies: 12,
      views: 345
    }, {
      id: 2,
      title: 'Quantum Mechanics',
      author: 'Student B',
      replies: 8,
      views: 201
    }, {
      id: 3,
      title: 'Organic Chemistry Lab',
      author: 'Student C',
      replies: 15,
      views: 423
    }],
    messages: [{
      id: 1,
      from: 'User A',
      to: 'Tutor B',
      subject: 'Question about homework',
      date: '2024-01-15'
    }, {
      id: 2,
      from: 'User C',
      to: 'Tutor D',
      subject: 'Session request',
      date: '2024-01-14'
    }, {
      id: 3,
      from: 'User E',
      to: 'Tutor F',
      subject: 'Follow-up question',
      date: '2024-01-13'
    }],
    reports: [{
      id: 1,
      type: 'Spam',
      reportedBy: 'User X',
      target: 'Post #123',
      status: 'Pending'
    }, {
      id: 2,
      type: 'Harassment',
      reportedBy: 'User Y',
      target: 'User Z',
      status: 'Resolved'
    }, {
      id: 3,
      type: 'Inappropriate Content',
      reportedBy: 'User W',
      target: 'Post #456',
      status: 'Under Review'
    }],
    resources: [{
      id: 1,
      title: 'Calculus Notes.pdf',
      uploadedBy: 'Tutor A',
      size: '2.3 MB',
      downloads: 45
    }, {
      id: 2,
      title: 'Physics Lab Manual',
      uploadedBy: 'Tutor B',
      size: '5.1 MB',
      downloads: 78
    }, {
      id: 3,
      title: 'Chemistry Textbook',
      uploadedBy: 'Tutor C',
      size: '12.4 MB',
      downloads: 123
    }]
  });
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const usersData = await userService.getUsers();
      setDatabaseTables(prev => ({
        ...prev,
        users: usersData
      }));
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setUsersError(err.response?.data?.message || err.message || 'Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };
  const handleEditRecord = (record: Record<string, any>) => {
    setSelectedRecord(record);
    setEditDialogOpen(true);
  };
  const handleSaveRecord = async (updatedRecord: Record<string, any>) => {
    try {
      if (selectedTable === 'users') {
        if (updatedRecord.id) {
          // Update existing user - don't send password for updates
          const {
            id,
            createdAt,
            password,
            ...updateData
          } = updatedRecord;
          console.log('Updating user with data:', updateData);
          const updatedUser = await userService.updateUser(id, updateData);
          setDatabaseTables(prev => ({
            ...prev,
            users: prev.users.map(user => user.id === id ? updatedUser : user)
          }));
        } else {
          // Create new user - ALWAYS send the hash, ignore what user sees in UI
          const createUserData = {
            name: updatedRecord.name || '',
            email: updatedRecord.email || '',
            phoneNumber: updatedRecord.phoneNumber || '',
            bio: updatedRecord.bio || '',
            location: updatedRecord.location || '',
            password: '2YEJxmSRl/fL0L2MFoRlUjdZ5ec2kg+8+gdUh4WtePo=',
            // Always send the hash
            createdAt: new Date().toISOString()
          };
          console.log('Creating user with data:', createUserData);
          if (!createUserData.name || !createUserData.email) {
            setUsersError('Name and email are required fields');
            return;
          }
          const newUser = await userService.createUser(createUserData);
          setDatabaseTables(prev => ({
            ...prev,
            users: [...prev.users, newUser]
          }));
        }
      }
      setEditDialogOpen(false);
      setSelectedRecord(null);
      setUsersError(null);
    } catch (err: any) {
      console.error('Error saving record:', err);
      setUsersError(err.response?.data?.message || err.message || 'Failed to save record');
    }
  };
  const handleDeleteRecord = async (record: Record<string, any>) => {
    if (!confirm('Are you sure you want to delete this record?')) {
      return;
    }
    try {
      if (selectedTable === 'users') {
        await userService.deleteUser(record.id);

        // Update local state
        setDatabaseTables(prev => ({
          ...prev,
          users: prev.users.filter(user => user.id !== record.id)
        }));
      }
      // Add similar logic for other tables if needed
    } catch (err: any) {
      console.error('Error deleting record:', err);
      setUsersError('Failed to delete record');
    }
  };
  const handleCreateUser = () => {
    setSelectedRecord({
      name: '',
      email: '',
      phoneNumber: '',
      bio: '',
      location: '',
      password: 'pass123',
      // Show "pass123" in UI but we'll override with hash in handleSaveRecord
      createdAt: new Date().toISOString()
    });
    setEditDialogOpen(true);
  };
  useEffect(() => {
    const fetchErrors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<ErrorResponse>(`/api/errors?page=0&size=${pageSize}`);
        setErrors(response.data.errors);
        setHasMore(response.data.hasMore);
        setPage(0);
      } catch (err: any) {
        console.error('Error fetching errors:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch errors');
      } finally {
        setLoading(false);
      }
    };
    fetchErrors();
  }, []);
  const loadMoreErrors = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await apiClient.get<ErrorResponse>(`/api/errors?page=${nextPage}&size=${pageSize}`);
      setErrors(prev => [...prev, ...response.data.errors]);
      setHasMore(response.data.hasMore);
      setPage(nextPage);
    } catch (err: any) {
      console.error('Error loading more errors:', err);
      setError('Failed to load more errors');
    } finally {
      setLoadingMore(false);
    }
  };

  // Forum Posts Data
  const forumPosts = [{
    id: 1,
    title: 'Need help with Calculus',
    author: 'Student A',
    replies: 15,
    flags: 0,
    status: 'Active',
    date: '2024-01-15'
  }, {
    id: 2,
    title: 'Best study techniques?',
    author: 'Student B',
    replies: 23,
    flags: 2,
    status: 'Flagged',
    date: '2024-01-14'
  }, {
    id: 3,
    title: 'Physics tutoring recommendations',
    author: 'Student C',
    replies: 8,
    flags: 0,
    status: 'Active',
    date: '2024-01-13'
  }];

  // Analytics Data
  const userActivityData = [{
    month: 'Jan',
    students: 400,
    tutors: 24
  }, {
    month: 'Feb',
    students: 450,
    tutors: 28
  }, {
    month: 'Mar',
    students: 520,
    tutors: 32
  }, {
    month: 'Apr',
    students: 580,
    tutors: 35
  }, {
    month: 'May',
    students: 650,
    tutors: 42
  }, {
    month: 'Jun',
    students: 720,
    tutors: 48
  }];
  const modulePopularityData = [{
    name: 'Mathematics',
    value: 400
  }, {
    name: 'Physics',
    value: 300
  }, {
    name: 'Chemistry',
    value: 200
  }, {
    name: 'Biology',
    value: 150
  }, {
    name: 'Computer Science',
    value: 350
  }];
  const COLORS = ['#000000', '#FFD500', '#FF4D4D', '#4CAF50', '#2196F3'];

  // Audit Logs Data
  const auditLogs = [{
    id: 1,
    admin: 'Admin User',
    action: 'Suspended user',
    target: 'mike@campus.edu',
    timestamp: '2024-01-15 14:30',
    details: 'Violation of terms'
  }, {
    id: 2,
    admin: 'Admin User',
    action: 'Deleted post',
    target: 'Post #456',
    timestamp: '2024-01-15 12:15',
    details: 'Spam content'
  }, {
    id: 3,
    admin: 'Super Admin',
    action: 'Edited user role',
    target: 'jane@campus.edu',
    timestamp: '2024-01-14 09:45',
    details: 'Promoted to Tutor'
  }, {
    id: 4,
    admin: 'Admin User',
    action: 'Approved resource',
    target: 'Physics Notes.pdf',
    timestamp: '2024-01-14 08:20',
    details: 'Content verification'
  }];
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'pending':
      case 'under review':
        return 'bg-warning text-warning-foreground';
      case 'suspended':
      case 'flagged':
        return 'bg-destructive text-destructive-foreground';
      case 'resolved':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  const handleExportCSV = () => {
    const currentTableData = databaseTables[selectedTable as keyof typeof databaseTables];
    if (!currentTableData || currentTableData.length === 0) {
      return;
    }

    // Get headers from the first row keys
    const headers = Object.keys(currentTableData[0]);

    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    currentTableData.forEach((row: any) => {
      const values = headers.map(header => {
        const value = row[header];
        // Escape values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedTable}_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">CampusLearn™ Platform Administration</p>
        </div>
      </div>

      {/* Dashboard Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {systemStats.map(stat => {
        const Icon = stat.icon;
        return <Card key={stat.label} className="hover:shadow-custom-md transition-shadow">
              
            </Card>;
      })}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Reports</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="forum">Forum</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Dashboard Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="w-full aspect-[16/9] max-h-[90vh] rounded-2xl overflow-hidden">
            <iframe title="CampusLearn Analytics Dashboard" style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }} src={powerURL} allowFullScreen={true}></iframe>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Health Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="text-sm font-medium">Database</span>
                  <Badge className="bg-success text-success-foreground">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="text-sm font-medium">API Services</span>
                  <Badge className="bg-success text-success-foreground">Online</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="text-sm font-medium">File Storage</span>
                  <Badge className="bg-warning text-warning-foreground">Warning</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="text-sm font-medium">Auth System</span>
                  <Badge className="bg-success text-success-foreground">Online</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Tools Tab */}
        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Management
                  </CardTitle>
                  <CardDescription>View and edit database tables with CRUD functionality</CardDescription>
                </div>
                <div className="flex gap-2">
                  {selectedTable === 'users' && <Button size="sm" onClick={handleCreateUser}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>}
                  <Button size="sm" variant="outline" onClick={handleExportCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Message */}
              {usersError && <div className="bg-destructive/15 border border-destructive/50 text-destructive px-4 py-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    <span>{usersError}</span>
                  </div>
                </div>}

              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger>
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="tutors">Tutors</SelectItem>
                </SelectContent>
              </Select>

              {/* Loading State */}
              {usersLoading && selectedTable === 'users' && <div className="flex justify-center items-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
                  </div>
                </div>}

              <Table>
                <TableHeader>
                  <TableRow>
                    {selectedTable === 'users' && <>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Joined Date</TableHead>
                        <TableHead>Bio</TableHead>
                        <TableHead>Actions</TableHead>
                      </>}
                    {selectedTable === 'tutors' && <>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Expertise</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Sessions</TableHead>
                        <TableHead>Actions</TableHead>
                      </>}
                    {selectedTable === 'topics' && <>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Replies</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Actions</TableHead>
                      </>}
                    {selectedTable === 'messages' && <>
                        <TableHead>ID</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </>}
                    {selectedTable === 'reports' && <>
                        <TableHead>ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </>}
                    {selectedTable === 'resources' && <>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead>Actions</TableHead>
                      </>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {databaseTables[selectedTable as keyof typeof databaseTables].map((row: any) => <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.id}</TableCell>
                      {selectedTable === 'users' ? <>
                          <TableCell>{row.name || 'N/A'}</TableCell>
                          <TableCell>{row.email || 'N/A'}</TableCell>
                          <TableCell>{row.phoneNumber || 'N/A'}</TableCell>
                          <TableCell>{row.location || 'N/A'}</TableCell>
                          <TableCell>{formatDate(row.createdAt)}</TableCell>
                          <TableCell className="max-w-[200px] truncate" title={row.bio}>
                            {row.bio || 'N/A'}
                          </TableCell>
                        </> : Object.entries(row).slice(1).map(([key, value]) => <TableCell key={key}>
                            {String(value)}
                          </TableCell>)}
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" title="Edit" onClick={() => handleEditRecord(row)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Delete" onClick={() => handleDeleteRecord(row)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Errors & Alerts Tab */}
        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Errors Log
              </CardTitle>
              <CardDescription>
                Showing {errors.length} errors {hasMore && `(of ${errors.length}+)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Loading State */}
              {loading && <div className="flex justify-center items-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading errors...</p>
                  </div>
                </div>}
              
              {/* Error State */}
              {error && !loading && <div className="bg-destructive/15 border border-destructive/50 text-destructive px-4 py-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    <strong>Error:</strong> {error}
                  </div>
                </div>}
              
              {/* Success State */}
              {!loading && !error && <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px]">ID</TableHead>
                          <TableHead className="min-w-[150px]">Created At</TableHead>
                          <TableHead className="min-w-[200px]">Message</TableHead>
                          <TableHead className="min-w-[150px]">Endpoint</TableHead>
                          <TableHead className="min-w-[100px]">User ID</TableHead>
                          <TableHead className="min-w-[200px]">Stack Trace</TableHead>
                          <TableHead className="min-w-[150px]">Additional Info</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {errors.length === 0 ? <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No errors found in the system
                            </TableCell>
                          </TableRow> : errors.map(error => <TableRow key={error.id} className="hover:bg-muted/50">
                              <TableCell className="font-mono text-xs">
                                {error.id ? error.id.slice(0, 8) + '...' : 'N/A'}
                              </TableCell>
                              <TableCell className="text-xs">
                                {error.createdAt || "Invalid Date"}
                              </TableCell>
                              <TableCell className="max-w-[200px]">
                                <div className="text-sm line-clamp-2" title={error.message}>
                                  {error.message || 'N/A'}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-mono">
                                {error.endpoint || <span className="text-muted-foreground">—</span>}
                              </TableCell>
                              <TableCell className="text-sm">
                                {error.userId || <span className="text-muted-foreground">—</span>}
                              </TableCell>
                              <TableCell className="max-w-[200px]">
                                -
                              </TableCell>
                              <TableCell className="max-w-[150px]">
                                {error.additional_info}
                              </TableCell>
                            </TableRow>)}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Load More Button */}
                  {hasMore && <div className="flex justify-center pt-4">
                      <Button onClick={loadMoreErrors} disabled={loadingMore} variant="outline" className="min-w-[120px]">
                        {loadingMore ? <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            Loading...
                          </> : <>
                            <Plus className="h-4 w-4 mr-2" />
                            Load More
                          </>}
                      </Button>
                    </div>}
                  
                  {/* No More Results */}
                  {!hasMore && errors.length > 0 && <div className="text-center py-4 text-muted-foreground">
                      No more errors to load
                    </div>}
                </div>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports & Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Reports & Analytics
              </CardTitle>
              <CardDescription>Platform trends and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={userActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="students" fill="#000000" />
                      <Bar dataKey="tutors" fill="#FFD500" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Sessions</p>
                        <p className="text-2xl font-bold">1,234</p>
                      </div>
                      <Zap className="h-8 w-8 text-secondary" />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Session Duration</p>
                        <p className="text-2xl font-bold">45 min</p>
                      </div>
                      <Clock className="h-8 w-8 text-secondary" />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">User Satisfaction</p>
                        <p className="text-2xl font-bold">4.8/5</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Logs
              </CardTitle>
              <CardDescription>Track all admin actions for accountability</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map(log => <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.admin}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.target}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.timestamp}</TableCell>
                      <TableCell className="text-sm">{log.details}</TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Record Dialog */}
      <EditRecordDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} record={selectedRecord} tableName={selectedTable} onSave={handleSaveRecord} />
    </div>;
}