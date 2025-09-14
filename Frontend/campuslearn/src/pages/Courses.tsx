import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  Star,
  Clock,
  Users,
  Search,
  Filter,
  MapPin,
  DollarSign,
} from 'lucide-react';

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const courses = [
    {
      id: 1,
      title: 'Advanced Calculus',
      description: 'Master calculus concepts with personalized tutoring',
      tutor: 'Dr. Sarah Wilson',
      rating: 4.9,
      students: 24,
      price: 45,
      duration: '1hr',
      subject: 'Mathematics',
      level: 'Advanced',
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      title: 'Data Structures & Algorithms',
      description: 'Comprehensive CS fundamentals for success',
      tutor: 'Prof. Mike Chen',
      rating: 4.8,
      students: 18,
      price: 55,
      duration: '1.5hr',
      subject: 'Computer Science',
      level: 'Intermediate',
      image: '/api/placeholder/300/200'
    },
    {
      id: 3,
      title: 'Organic Chemistry Lab',
      description: 'Hands-on chemistry practice and theory',
      tutor: 'Dr. Emma Rodriguez',
      rating: 4.7,
      students: 12,
      price: 40,
      duration: '2hr',
      subject: 'Chemistry',
      level: 'Intermediate',
      image: '/api/placeholder/300/200'
    },
  ];

  const tutors = [
    {
      id: 1,
      name: 'Dr. Sarah Wilson',
      subjects: ['Mathematics', 'Statistics'],
      rating: 4.9,
      sessions: 156,
      price: 45,
      availability: 'Available Now',
      location: 'Campus Library',
      image: '/api/placeholder/100/100'
    },
    {
      id: 2,
      name: 'Prof. Mike Chen',
      subjects: ['Computer Science', 'Programming'],
      rating: 4.8,
      sessions: 203,
      price: 55,
      availability: 'Available Tomorrow',
      location: 'CS Building',
      image: '/api/placeholder/100/100'
    },
    {
      id: 3,
      name: 'Dr. Emma Rodriguez',
      subjects: ['Chemistry', 'Biology'],
      rating: 4.7,
      sessions: 89,
      price: 40,
      availability: 'Available Friday',
      location: 'Science Lab',
      image: '/api/placeholder/100/100'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses & Tutors</h1>
          <p className="text-muted-foreground">Find the perfect learning opportunity</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <BookOpen className="mr-2 h-4 w-4" />
          Request New Tutor
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses, subjects, or tutors..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="computer-science">Computer Science</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="tutors">Find Tutors</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-custom-lg transition-shadow">
                <div className="aspect-video bg-gradient-subtle rounded-t-lg flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-primary" />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="mt-1">{course.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">{course.level}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Star className="mr-1 h-3 w-3 fill-current text-warning" />
                      {course.rating}
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      {course.students} students
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {course.duration}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={course.image} />
                        <AvatarFallback>{course.tutor.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{course.tutor}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${course.price}</p>
                      <p className="text-xs text-muted-foreground">per session</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button className="flex-1">Enroll Now</Button>
                    <Button variant="outline" size="icon">
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tutors" className="space-y-6">
          <div className="grid gap-6">
            {tutors.map((tutor) => (
              <Card key={tutor.id} className="hover:shadow-custom-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={tutor.image} />
                      <AvatarFallback className="text-lg">{tutor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{tutor.name}</h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tutor.subjects.map((subject) => (
                              <Badge key={subject} variant="outline" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">${tutor.price}</p>
                          <p className="text-xs text-muted-foreground">per hour</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Star className="mr-1 h-3 w-3 fill-current text-warning" />
                          {tutor.rating} ({tutor.sessions} sessions)
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {tutor.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {tutor.availability}
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 mt-4">
                        <Button className="bg-gradient-primary hover:opacity-90">
                          Book Session
                        </Button>
                        <Button variant="outline">
                          View Profile
                        </Button>
                        <Button variant="ghost" size="sm">
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}