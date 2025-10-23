import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EditRecordDialog } from '@/components/ui/EditRecordDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  Settings,
  Users,
  BookOpen,
  BarChart3,
  Shield,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Database,
  Flag,
  MessageSquare,
  TrendingUp,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Server,
  Zap,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ErrorRecord, ErrorResponse } from '@/types';
import apiClient from '@/services/api';
import { userService, User } from '@/services/userServices';

interface ForumPost {
  id: string;
  authorId: number;
  parent_post_id?: string | null;
  content: string;
  attachments?: string[];
  upvotes?: number;
  created_at?: string;
  title?: string | null;
  author?: string | null;
  tags?: string[];
  replies?: number;
  downvotes?: number;
  community?: string | null;
  timestamp?: string | null;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface FAQFormData {
  question: string;
  answer: string;
  category: string;
  color: string;
}

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

  // FAQ States
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqError, setFaqError] = useState<string | null>(null);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [faqForm, setFaqForm] = useState<FAQFormData>({
    question: '',
    answer: '',
    category: 'Getting Started',
    color: 'bg-blue-500'
  });

  const powerURL = "https://app.powerbi.com/view?r=eyJrIjoiZWNkNmVhYzQtNDliZC00YzFkLTljMTQtMmQ0ZThlZWM0YjU1IiwidCI6ImVhMWE5MDliLTY2MDAtNGEyNS04MmE1LTBjNmVkN2QwNTEzYiIsImMiOjl9&pageName=35a3420a0cb3b9bccc5e";

  // System Stats
  const systemStats = [
    { label: 'Total Users', value: '2,847', change: '+12%', icon: Users, color: 'text-primary' },
    { label: 'Active Tutors', value: '156', change: '+8%', icon: Shield, color: 'text-secondary' },
    { label: 'Total Topics', value: '1,243', change: '+15%', icon: MessageSquare, color: 'text-success' },
    { label: 'API Uptime', value: '99.9%', change: '0%', icon: Server, color: 'text-warning' },
  ];

  const [databaseTables, setDatabaseTables] = useState({
    users: [] as User[],
    tutors: [
      { id: 1, name: 'Prof. Adams', expertise: 'Mathematics', rating: 4.8, sessions: 234 },
      { id: 2, name: 'Dr. Brown', expertise: 'Physics', rating: 4.9, sessions: 189 },
      { id: 3, name: 'Prof. Garcia', expertise: 'Chemistry', rating: 4.7, sessions: 156 },
    ],
    topics: [
      { id: 1, title: 'Linear Algebra Help', author: 'Student A', replies: 12, views: 345 },
      { id: 2, title: 'Quantum Mechanics', author: 'Student B', replies: 8, views: 201 },
      { id: 3, title: 'Organic Chemistry Lab', author: 'Student C', replies: 15, views: 423 },
    ],
    messages: [
      { id: 1, from: 'User A', to: 'Tutor B', subject: 'Question about homework', date: '2024-01-15' },
      { id: 2, from: 'User C', to: 'Tutor D', subject: 'Session request', date: '2024-01-14' },
      { id: 3, from: 'User E', to: 'Tutor F', subject: 'Follow-up question', date: '2024-01-13' },
    ],
    reports: [
      { id: 1, type: 'Spam', reportedBy: 'User X', target: 'Post #123', status: 'Pending' },
      { id: 2, type: 'Harassment', reportedBy: 'User Y', target: 'User Z', status: 'Resolved' },
      { id: 3, type: 'Inappropriate Content', reportedBy: 'User W', target: 'Post #456', status: 'Under Review' },
    ],
    resources: [
      { id: 1, title: 'Calculus Notes.pdf', uploadedBy: 'Tutor A', size: '2.3 MB', downloads: 45 },
      { id: 2, title: 'Physics Lab Manual', uploadedBy: 'Tutor B', size: '5.1 MB', downloads: 78 },
      { id: 3, title: 'Chemistry Textbook', uploadedBy: 'Tutor C', size: '12.4 MB', downloads: 123 },
    ],
  });

  // Forum Posts State
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [forumLoading, setForumLoading] = useState(false);
  const [forumError, setForumError] = useState<string | null>(null);

  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // FAQ Categories and Colors
  const faqCategories = [
    'Getting Started',
    'Technical Support', 
    'AI Tutor',
    'Communication',
    'Account Management',
    'Billing & Payments',
    'Other'
  ];

  const faqColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500', 
    'bg-orange-500',
    'bg-red-500',
    'bg-indigo-500'
  ];

  // Fetch FAQs
  const fetchFAQs = async () => {
    try {
      setFaqLoading(true);
      setFaqError(null);
      
      const response = await fetch('http://localhost:9090/api/faqs',{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch FAQs: ${response.status}`);
      }
      
      const data = await response.json();
      setFaqs(data);
    } catch (err: any) {
      console.error('Error fetching FAQs:', err);
      setFaqError(err.message || 'Failed to fetch FAQs');
    } finally {
      setFaqLoading(false);
    }
  };

  // Create or Update FAQ
  const saveFAQ = async (formData: FAQFormData) => {
    try {
      setFaqError(null);
      
      const url = editingFaq 
        ? `http://localhost:9090/api/faqs/${editingFaq.id}`
        : 'http://localhost:9090/api/faqs';
      
      const method = editingFaq ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${editingFaq ? 'update' : 'create'} FAQ: ${response.status}`);
      }
      
      await fetchFAQs(); // Refresh the list
      setFaqDialogOpen(false);
      resetFaqForm();
      
    } catch (err: any) {
      console.error('Error saving FAQ:', err);
      setFaqError(err.message || `Failed to ${editingFaq ? 'update' : 'create'} FAQ`);
    }
  };

  // Delete FAQ
  const deleteFAQ = async (id: number) => {
    

    try {
      setFaqError(null);
      
      const response = await fetch(`http://localhost:9090/api/faqs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete FAQ: ${response.status}`);
      }
      
      await fetchFAQs(); // Refresh the list
      
    } catch (err: any) {
      console.error('Error deleting FAQ:', err);
      setFaqError(err.message || 'Failed to delete FAQ');
    }
  };

  // Reset FAQ form
  const resetFaqForm = () => {
    setFaqForm({
      question: '',
      answer: '',
      category: 'Getting Started',
      color: 'bg-blue-500'
    });
    setEditingFaq(null);
  };

  // Open FAQ dialog for editing
  const editFAQ = (faq: FAQ) => {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      color: faq.color
    });
    setFaqDialogOpen(true);
  };

  // Open FAQ dialog for creating
  const createFAQ = () => {
    resetFaqForm();
    setFaqDialogOpen(true);
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    fetchFAQs();
  }, []);

  // Fetch forum posts
  const fetchForumPosts = async () => {
    try {
      setForumLoading(true);
      setForumError(null);
      
      const token = localStorage.getItem("authToken");
      if (!token) {
        setForumError("Authentication token not found");
        return;
      }

      const response = await fetch("http://localhost:9090/ForumPosts", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch forum posts: ${response.status}`);
      }

      const data: ForumPost[] = await response.json();
      
      // Fetch additional data for each post (author names, reply counts)
      const postsWithDetails = await Promise.all(
        data.map(async (post) => {
          let authorName = null;
          let replies = 0;

          try {
            // Fetch author name
            const userRes = await fetch(`http://localhost:9090/student/${post.authorId}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
            
            if (userRes.ok) {
              const userData = await userRes.json();
              authorName = userData.name;
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }

          try {
            // Fetch reply count
            const commentsRes = await fetch(`http://localhost:9090/api/comments/post/${post.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            if (commentsRes.ok) {
              const comments = await commentsRes.json();
              replies = comments.length;
            }
          } catch (error) {
            console.error("Error fetching comments:", error);
          }

          return {
            ...post,
            author: authorName || `User ${post.authorId}`,
            replies,
            created_at: post.created_at || post.timestamp || new Date().toISOString(),
          };
        })
      );

      // Sort by creation date (newest first)
      postsWithDetails.sort(
        (a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      );

      setForumPosts(postsWithDetails);
    } catch (err: any) {
      console.error('Error fetching forum posts:', err);
      setForumError(err.message || 'Failed to fetch forum posts');
    } finally {
      setForumLoading(false);
    }
  };

  useEffect(() => {
    fetchForumPosts();
  }, []);

  // Delete forum post
  const deleteForumPost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this forum post? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setForumError("Authentication token not found");
        return;
      }

      const response = await fetch(`http://localhost:9090/ForumPosts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Forum post not found");
        }
        throw new Error(`Failed to delete forum post: ${response.status}`);
      }

      // Remove from local state
      setForumPosts(prev => prev.filter(post => post.id !== postId));
      
      setForumError(null);
    } catch (err: any) {
      console.error('Error deleting forum post:', err);
      setForumError(err.message || 'Failed to delete forum post');
    }
  };

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
          const { id, createdAt, password, ...updateData } = updatedRecord;
          console.log('Updating user with data:', updateData);
          
          const updatedUser = await userService.updateUser(id, updateData);
          
          setDatabaseTables(prev => ({
            ...prev,
            users: prev.users.map(user => 
              user.id === id ? updatedUser : user
            )
          }));
        } else {
          // Create new user - ALWAYS send the hash, ignore what user sees in UI
          const createUserData = {
            name: updatedRecord.name || '',
            email: updatedRecord.email || '',
            phoneNumber: updatedRecord.phoneNumber || '',
            bio: updatedRecord.bio || '',
            location: updatedRecord.location || '',
            password: '2YEJxmSRl/fL0L2MFoRlUjdZ5ec2kg+8+gdUh4WtePo=', // Always send the hash
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
      password: 'pass123', // Show "pass123" in UI but we'll override with hash in handleSaveRecord
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
      
      const response = await apiClient.get<ErrorResponse>(
        `/api/errors?page=${nextPage}&size=${pageSize}`
      );
      
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

  // Analytics Data
  const userActivityData = [
    { month: 'Jan', students: 400, tutors: 24 },
    { month: 'Feb', students: 450, tutors: 28 },
    { month: 'Mar', students: 520, tutors: 32 },
    { month: 'Apr', students: 580, tutors: 35 },
    { month: 'May', students: 650, tutors: 42 },
    { month: 'Jun', students: 720, tutors: 48 },
  ];

  const modulePopularityData = [
    { name: 'Mathematics', value: 400 },
    { name: 'Physics', value: 300 },
    { name: 'Chemistry', value: 200 },
    { name: 'Biology', value: 150 },
    { name: 'Computer Science', value: 350 },
  ];

  const COLORS = ['#000000', '#FFD500', '#FF4D4D', '#4CAF50', '#2196F3'];

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
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">CampusLearn™ Platform Administration</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Reports</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="forum">Forum</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* Dashboard Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="w-full aspect-[16/9] max-h-[90vh] rounded-2xl overflow-hidden">
            <iframe
              title="CampusLearn Analytics Dashboard"
              style={{ width: '100%', height: '100%', border: 'none' }}
              src={powerURL}
              allowFullScreen={true}
            ></iframe>
          </div>

          
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
                  {selectedTable === 'users' && (
                    <Button size="sm" onClick={handleCreateUser}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={handleExportCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Message */}
              {usersError && (
                <div className="bg-destructive/15 border border-destructive/50 text-destructive px-4 py-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    <span>{usersError}</span>
                  </div>
                </div>
              )}

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
              {usersLoading && selectedTable === 'users' && (
                <div className="flex justify-center items-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
                  </div>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    {selectedTable === 'users' && (
                      <>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Joined Date</TableHead>
                        <TableHead>Bio</TableHead>
                        <TableHead>Actions</TableHead>
                      </>
                    )}
                    {selectedTable === 'tutors' && (
                      <>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Expertise</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Sessions</TableHead>
                        <TableHead>Actions</TableHead>
                      </>
                    )}
                    {selectedTable === 'topics' && (
                      <>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Replies</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Actions</TableHead>
                      </>
                    )}
                    {selectedTable === 'messages' && (
                      <>
                        <TableHead>ID</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </>
                    )}
                    {selectedTable === 'reports' && (
                      <>
                        <TableHead>ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </>
                    )}
                    {selectedTable === 'resources' && (
                      <>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead>Actions</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {databaseTables[selectedTable as keyof typeof databaseTables].map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.id}</TableCell>
                      {selectedTable === 'users' ? (
                        <>
                          <TableCell>{row.name || 'N/A'}</TableCell>
                          <TableCell>{row.email || 'N/A'}</TableCell>
                          <TableCell>{row.phoneNumber || 'N/A'}</TableCell>
                          <TableCell>{row.location || 'N/A'}</TableCell>
                          <TableCell>{formatDate(row.createdAt)}</TableCell>
                          <TableCell className="max-w-[200px] truncate" title={row.bio}>
                            {row.bio || 'N/A'}
                          </TableCell>
                        </>
                      ) : (
                        Object.entries(row).slice(1).map(([key, value]) => (
                          <TableCell key={key}>
                            {String(value)}
                          </TableCell>
                        ))
                      )}
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Edit"
                            onClick={() => handleEditRecord(row)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Delete"
                            onClick={() => handleDeleteRecord(row)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
              {loading && (
                <div className="flex justify-center items-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading errors...</p>
                  </div>
                </div>
              )}
              
              {/* Error State */}
              {error && !loading && (
                <div className="bg-destructive/15 border border-destructive/50 text-destructive px-4 py-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    <strong>Error:</strong> {error}
                  </div>
                </div>
              )}
              
              {/* Success State */}
              {!loading && !error && (
                <div className="space-y-4">
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
                        {errors.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No errors found in the system
                            </TableCell>
                          </TableRow>
                        ) : (
                          errors.map((error) => (
                            <TableRow key={error.id} className="hover:bg-muted/50">
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
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Load More Button */}
                  {hasMore && (
                    <div className="flex justify-center pt-4">
                      <Button 
                        onClick={loadMoreErrors} 
                        disabled={loadingMore}
                        variant="outline"
                        className="min-w-[120px]"
                      >
                        {loadingMore ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Load More
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {/* No More Results */}
                  {!hasMore && errors.length > 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No more errors to load
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forum Tab */}
        <TabsContent value="forum" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Forum Management
                  </CardTitle>
                  <CardDescription>Manage all forum posts and content</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={fetchForumPosts}
                    disabled={forumLoading}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${forumLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Message */}
              {forumError && (
                <div className="bg-destructive/15 border border-destructive/50 text-destructive px-4 py-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    <span>{forumError}</span>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {forumLoading && (
                <div className="flex justify-center items-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading forum posts...</p>
                  </div>
                </div>
              )}

              {/* Forum Posts Table */}
              {!forumLoading && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title/Content</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Community</TableHead>
                        <TableHead>Replies</TableHead>
                        <TableHead>Upvotes</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {forumPosts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No forum posts found
                          </TableCell>
                        </TableRow>
                      ) : (
                        forumPosts.map((post) => (
                          <TableRow key={post.id} className="hover:bg-muted/50">
                            <TableCell className="font-mono text-xs">
                              {post.id.slice(0, 8)}...
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                <div className="font-medium text-sm">
                                  {post.title || 'No Title'}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {truncateText(post.content, 100)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{post.author}</div>
                                <div className="text-xs text-muted-foreground">
                                  ID: {post.authorId}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {post.community || (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {post.replies || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {post.upvotes || 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(post.created_at!)}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-[150px]">
                                {post.tags?.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                                {post.tags && post.tags.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{post.tags.length - 2}
                                  </Badge>
                                )}
                                {(!post.tags || post.tags.length === 0) && (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  title="Delete Post"
                                  onClick={() => deleteForumPost(post.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Management Tab */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    FAQ Management
                  </CardTitle>
                  <CardDescription>Manage frequently asked questions and their categories</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={fetchFAQs}
                    disabled={faqLoading}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${faqLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button size="sm" onClick={createFAQ}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add FAQ
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Message */}
              {faqError && (
                <div className="bg-destructive/15 border border-destructive/50 text-destructive px-4 py-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    <span>{faqError}</span>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {faqLoading && (
                <div className="flex justify-center items-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading FAQs...</p>
                  </div>
                </div>
              )}

              {/* FAQ Table */}
              {!faqLoading && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Answer</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faqs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No FAQs found. Create your first FAQ!
                          </TableCell>
                        </TableRow>
                      ) : (
                        faqs.map((faq) => (
                          <TableRow key={faq.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{faq.id}</TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                <div className="font-medium text-sm">
                                  {faq.question}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[250px]">
                                <div className="text-sm text-muted-foreground">
                                  {truncateText(faq.answer, 100)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {faq.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${faq.color}`}></div>
                                <span className="text-xs text-muted-foreground">
                                  {faq.color}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(faq.createdAt)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(faq.updatedAt)}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  title="Edit FAQ"
                                  onClick={() => editFAQ(faq)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  title="Delete FAQ"
                                  onClick={() => deleteFAQ(faq.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Record Dialog */}
      <EditRecordDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        record={selectedRecord}
        tableName={selectedTable}
        onSave={handleSaveRecord}
      />

      {/* FAQ Dialog */}
      <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFaq ? 'Edit FAQ' : 'Create New FAQ'}
            </DialogTitle>
            <DialogDescription>
              {editingFaq 
                ? 'Update the frequently asked question details.' 
                : 'Add a new frequently asked question to the knowledge base.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="Enter the question..."
                value={faqForm.question}
                onChange={(e) => setFaqForm({...faqForm, question: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                placeholder="Enter the answer..."
                value={faqForm.answer}
                onChange={(e) => setFaqForm({...faqForm, answer: e.target.value})}
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={faqForm.category} 
                  onValueChange={(value) => setFaqForm({...faqForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {faqCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select 
                  value={faqForm.color} 
                  onValueChange={(value) => setFaqForm({...faqForm, color: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {faqColors.map((color) => (
                      <SelectItem key={color} value={color}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color}`}></div>
                          <span>{color}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setFaqDialogOpen(false);
                resetFaqForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => saveFAQ(faqForm)}
              disabled={!faqForm.question.trim() || !faqForm.answer.trim()}
            >
              {editingFaq ? 'Update FAQ' : 'Create FAQ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}