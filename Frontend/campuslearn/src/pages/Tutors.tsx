import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/services/api';
import { TutorWithStudent, Module } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen, Filter, Star, MapPin, Clock, MessageCircle } from 'lucide-react';

interface TutorWithModulesResponse {
  tutor: {
    id: number;
    studentId: number;
    created_at: string;
    studentEmail: string;
  };
  modules: Module[];
}

export default function TutorsPage() {
  const { toast } = useToast();
  const [tutors, setTutors] = useState<TutorWithStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // Fetch tutors with their modules and student details
  useEffect(() => {
    const fetchTutorsWithModules = async () => {
      try {
        setIsLoading(true);
        
        // Step 1: Get all tutors
        const tutorsResponse = await apiClient.get('/tutors');
        const tutorData = tutorsResponse.data;
        
        console.log('Raw tutors response:', tutorData);

        // Step 2: For each tutor, fetch their modules and student details
        const tutorsWithDetails = await Promise.all(
          tutorData.map(async (tutor: any) => {
            try {
              // Get tutor modules from the dedicated endpoint
              const modulesResponse = await apiClient.get(`/tutors/${tutor.id}/modules`);
              const modulesData: TutorWithModulesResponse = modulesResponse.data;
              
              console.log(`Tutor ${tutor.id} modules response:`, modulesData);

              // Get student details
              const studentResponse = await apiClient.get(`/student/${tutor.studentId}`);
              const student = studentResponse.data;

              // Extract modules from the response
              const modules = modulesData.modules || [];

              return {
                tutorId: tutor.id,
                studentId: tutor.studentId,
                student: student,
                modules: modules
              };
            } catch (error) {
              console.error(`Failed to fetch data for tutor ${tutor.id}:`, error);
              
              // Fallback: try to get student details even if modules fail
              try {
                const studentResponse = await apiClient.get(`/student/${tutor.studentId}`);
                const student = studentResponse.data;
                
                return {
                  tutorId: tutor.id,
                  studentId: tutor.studentId,
                  student: student,
                  modules: []
                };
              } catch (studentError) {
                console.error(`Failed to fetch student ${tutor.studentId}:`, studentError);
                
                return {
                  tutorId: tutor.id,
                  studentId: tutor.studentId,
                  student: { 
                    id: tutor.studentId,
                    name: tutor.studentEmail?.split('@')[0] || 'Unknown Tutor',
                    email: tutor.studentEmail || '',
                    bio: 'Bio not available',
                    location: 'Unknown'
                  },
                  modules: []
                };
              }
            }
          })
        );
        
        console.log('Final tutors with all data:', tutorsWithDetails);
        setTutors(tutorsWithDetails);

        // Extract unique subjects for filter dropdown
        const subjects = Array.from(
          new Set(
            tutorsWithDetails.flatMap(tutor => 
              tutor.modules.map(module => module.module_name)
            )
          )
        );
        setAvailableSubjects(subjects);

      } catch (error) {
        console.error('Error fetching tutors:', error);
        toast({ 
          title: 'Error', 
          description: 'Failed to load tutors', 
          variant: 'destructive' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutorsWithModules();
  }, [toast]);

  // Filter tutors based on search and subject
  const filteredTutors = tutors.filter((tutor) => {
    if (!tutor.student) return false;
    
    const matchesSearch = searchQuery === '' || 
      tutor.student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.student.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.modules?.some(module => 
        module.module_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.module_code?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesSubject = selectedSubject === 'all' || 
      tutor.modules?.some(module => module.module_name === selectedSubject);

    return matchesSearch && matchesSubject;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Find Tutors</h1>
            <p className="text-muted-foreground">Connect with expert tutors for personalized learning</p>
          </div>
          <Button disabled className="bg-gradient-primary hover:opacity-90">
            <BookOpen className="mr-2 h-4 w-4" />
            Become a Tutor
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading tutors and modules...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find Tutors</h1>
        <p className="text-muted-foreground">Connect with expert tutors for personalized learning</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tutors, subjects, modules, or specialties..."
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
                <SelectItem key="all" value="all">All Subjects</SelectItem>
                {availableSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
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

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredTutors.length} of {tutors.length} tutors
        {searchQuery && ` for "${searchQuery}"`}
        {selectedSubject !== 'all' && ` in ${selectedSubject}`}
      </div>

      {/* Tutors List */}

      <div className="grid gap-6">
        {filteredTutors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tutors found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedSubject !== 'all' 
                  ? 'Try adjusting your search criteria or filters' 
                  : 'No tutors available at the moment'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTutors.map((tutor) => (
            <Card key={tutor.tutorId} className="hover:shadow-custom-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-xl">
                      {tutor.student?.name?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {tutor.student?.name || 'Tutor'}
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          {tutor.student?.bio || 'Bio not available'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Display Modules */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Teaches:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {tutor.modules && tutor.modules.length > 0 ? (
                          tutor.modules.map((module) => (
                            <Badge key={module.moduleId} variant="secondary" className="text-xs">
                              {module.module_name} ({module.module_code})
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No modules listed</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Star className="mr-1 h-3 w-3 fill-current text-warning" />
                        {/* Rating will go here when available */}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {tutor.student?.location || 'Location not specified'}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {/* Availability will go here when available */}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-6">
                      <Button className="bg-gradient-primary hover:opacity-90">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Apply for Tutor
                      </Button>
                    </div>
                  </div>
   
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}