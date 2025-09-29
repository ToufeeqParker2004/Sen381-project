import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  MessageCircle,
} from 'lucide-react';

export default function Tutors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const tutors = [
    {
      id: 1,
      name: 'Dr. Sarah Wilson',
      subjects: ['Mathematics', 'Statistics'],
      rating: 4.9,
      sessions: 156,
      availability: 'Available Now',
      location: 'Campus Library',
      image: '/api/placeholder/100/100',
      bio: 'PhD in Mathematics with 10+ years of teaching experience',
      specialties: ['Calculus', 'Linear Algebra', 'Statistics']
    },
    {
      id: 2,
      name: 'Prof. Mike Chen',
      subjects: ['Computer Science', 'Programming'],
      rating: 4.8,
      sessions: 203,
      availability: 'Available Tomorrow',
      location: 'CS Building',
      image: '/api/placeholder/100/100',
      bio: 'Software Engineer turned educator, specializing in algorithms',
      specialties: ['Data Structures', 'Algorithms', 'Python', 'JavaScript']
    },
    {
      id: 3,
      name: 'Dr. Emma Rodriguez',
      subjects: ['Chemistry', 'Biology'],
      rating: 4.7,
      sessions: 89,
      availability: 'Available Friday',
      location: 'Science Lab',
      image: '/api/placeholder/100/100',
      bio: 'Research scientist with expertise in organic chemistry',
      specialties: ['Organic Chemistry', 'Biochemistry', 'Lab Techniques']
    },
    {
      id: 4,
      name: 'Dr. James Anderson',
      subjects: ['Physics', 'Engineering'],
      rating: 4.9,
      sessions: 134,
      availability: 'Available Today',
      location: 'Physics Building',
      image: '/api/placeholder/100/100',
      bio: 'Theoretical physicist with industry experience',
      specialties: ['Quantum Mechanics', 'Thermodynamics', 'Electromagnetism']
    },
  ];

  // Filter tutors based on search and subject
  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch = searchQuery === '' || 
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tutor.specialties.some(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tutor.bio.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubject === 'all' || 
      tutor.subjects.some(subject => subject.toLowerCase().replace(' ', '-') === selectedSubject);

    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Find Tutors</h1>
          <p className="text-muted-foreground">Connect with expert tutors for personalized learning</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <BookOpen className="mr-2 h-4 w-4" />
          Become a Tutor
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tutors, subjects, or specialties..."
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
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="statistics">Statistics</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tutors List */}
      <div className="grid gap-6">
        {filteredTutors.map((tutor) => (
          <Card key={tutor.id} className="hover:shadow-custom-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={tutor.image} />
                  <AvatarFallback className="text-xl">{tutor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{tutor.name}</h3>
                      <p className="text-muted-foreground mt-1">{tutor.bio}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tutor.subjects.map((subject) => (
                          <Badge key={subject} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Specialties:</h4>
                    <div className="flex flex-wrap gap-1">
                      {tutor.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
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
                  
                  <div className="flex space-x-3 mt-6">
                    <Button className="bg-gradient-primary hover:opacity-90">
                      Book Session
                    </Button>
                    <Button variant="outline">
                      View Profile
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}