import { useState } from 'react';
import { Users, Search, Mail, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Student {
  id: string;
  name: string;
  email: string;
  module: string;
  progress: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'at-risk';
  attendance: number;
}

export default function MyStudents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [students] = useState<Student[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@campus.edu',
      module: 'CS101',
      progress: 85,
      lastActive: '2 hours ago',
      status: 'active',
      attendance: 95,
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.c@campus.edu',
      module: 'CS102',
      progress: 72,
      lastActive: '1 day ago',
      status: 'active',
      attendance: 88,
    },
    {
      id: '3',
      name: 'Emma Davis',
      email: 'emma.d@campus.edu',
      module: 'CS101',
      progress: 45,
      lastActive: '5 days ago',
      status: 'at-risk',
      attendance: 65,
    },
    {
      id: '4',
      name: 'James Wilson',
      email: 'james.w@campus.edu',
      module: 'CS103',
      progress: 91,
      lastActive: '30 minutes ago',
      status: 'active',
      attendance: 98,
    },
  ]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.module.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'at-risk':
        return <Badge className="bg-destructive text-destructive-foreground">At Risk</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return null;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-success';
    if (progress >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  const activeStudents = students.filter(s => s.status === 'active').length;
  const atRiskStudents = students.filter(s => s.status === 'at-risk').length;
  const averageProgress = Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Students</h1>
        <p className="text-muted-foreground">Track and manage your students' progress</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2 mt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or module..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{student.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">{student.module}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Last active: {student.lastActive}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="icon">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}