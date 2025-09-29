import React, { useEffect, useState } from 'react';
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
import { useAuth } from '@/context/AuthContext';
import { Module, Student, TutorWithStudent } from '@/types';
import { getModules, getStudentById, getTutors } from '@/services/dataServices';



export default function TutorList() {

    const [tutors, setTutors] = useState<TutorWithStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTutors() {
      try {
        const tutorData = await getTutors();

        // 🔹 Get student details for each tutor
        const tutorsWithStudents = await Promise.all(
          tutorData.map(async (tutor) => {
            try {
              const student = await getStudentById(tutor.studentId);
              return { ...tutor, student };
            } catch (err) {
              console.error(`Failed to fetch student ${tutor.studentId}`, err);
              return { ...tutor };
            }
          })
        );

        setTutors(tutorsWithStudents);
      } catch (err) {
        console.error("Failed to fetch tutors", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTutors();
  }, []);



   const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    async function fetchModules() {
      try {
        const data = await getModules();
        setModules(data);
      } catch (err) {
        console.error("Failed to fetch modules", err);
      }
    }
    fetchModules();
  }, []);

   const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

   // Filter tutors based on search and subject
    const filteredTutors = tutors.filter((tutor) => {
      const matchesSearch = searchQuery === '' || 
        tutor.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       // tutor.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
       // tutor.specialties.some(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tutor.student.bio.toLowerCase().includes(searchQuery.toLowerCase());
  
      //const matchesSubject = selectedSubject === 'all' || 
       // tutor.subjects.some(subject => subject.toLowerCase().replace(' ', '-') === selectedSubject);
  
      return matchesSearch //&& matchesSubject;
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
                  {modules.map((m)=>(
                    <SelectItem value={m.module_name}>{m.module_name}</SelectItem>
                  ))}
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
            <Card key={tutor.student.id} className="hover:shadow-custom-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-20 w-20">
                    {/* <AvatarImage src={tutor.image} /> */}
                    <AvatarFallback className="text-xl">{tutor.student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{tutor.student.name}</h3>
                        <p className="text-muted-foreground mt-1">{tutor.student.bio}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {/* {tutor.subjects.map((subject) => (
                            <Badge key={subject} variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                          ))} */}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Specialties:</h4>
                      <div className="flex flex-wrap gap-1">
                        {/* {tutor.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))} */}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                         <Star className="mr-1 h-3 w-3 fill-current text-warning" />
                        {/* {tutor.rating} ({tutor.sessions} sessions)  */}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {tutor.student.Location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {/* {tutor.availability} */}
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
