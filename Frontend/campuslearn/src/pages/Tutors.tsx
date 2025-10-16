import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/services/api';
import { TutorWithStudent, Module } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface TutorWithModulesResponse {
  tutor: {
    id: number;
    studentId: number;
    created_at: string;
    studentEmail: string;
  };
  modules: Module[];
}

interface Booking {
  id: number;
  tutorId: number;
  startDatetime: string;
  endDatetime: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
}

export default function TutorsPage() {
  const { toast } = useToast();
  const [tutors, setTutors] = useState<TutorWithStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<{ [tutorId: number]: Date | null }>({});
  const [selectedModules, setSelectedModules] = useState<{ [tutorId: number]: string }>({});
  const [tutorBookings, setTutorBookings] = useState<{ [tutorId: number]: Booking[] }>({});
  const [loadingBookings, setLoadingBookings] = useState<{ [tutorId: number]: boolean }>({});
  const { user } = useAuth();

  // Fetch tutors and modules
  useEffect(() => {
    const fetchTutorsWithModules = async () => {
      try {
        setIsLoading(true);

        // Get tutors from /tutors endpoint
        const tutorsResponse = await apiClient.get('/tutors');
        const tutorData = tutorsResponse.data;

        const tutorsWithDetails = await Promise.all(
          tutorData.map(async (tutor: any) => {
            try {
              // Get modules for this tutor
              const modulesResponse = await apiClient.get(`/tutors/${tutor.id}/modules`);
              const modulesData: TutorWithModulesResponse = modulesResponse.data;
              
              // Get student details
              const studentResponse = await apiClient.get(`/student/${tutor.studentId}`);
              const student = studentResponse.data;
              const modules = modulesData.modules || [];

              return {
                tutorId: tutor.id,
                studentId: tutor.studentId,
                student,
                modules,
              };
            } catch (error) {
              console.error(`Failed to fetch data for tutor ${tutor.id}:`, error);

              // Fallback: just use basic tutor info
              return {
                tutorId: tutor.id,
                studentId: tutor.studentId,
                student: {
                  id: tutor.studentId,
                  name: tutor.studentEmail?.split('@')[0] || 'Unknown Tutor',
                  email: tutor.studentEmail || '',
                  bio: 'Bio not available',
                  location: 'Unknown',
                },
                modules: [],
              };
            }
          })
        );

        setTutors(tutorsWithDetails);
        const subjects = Array.from(new Set(tutorsWithDetails.flatMap(t => t.modules.map(m => m.module_name))));
        setAvailableSubjects(subjects);
      } catch (error: any) {
        console.error('Error fetching tutors:', error);
        toast({ 
          title: 'Error', 
          description: error.response?.data?.error || 'Failed to load tutors', 
          variant: 'destructive' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutorsWithModules();
  }, [toast]);

  // Fetch bookings for a specific tutor
  const fetchTutorBookings = async (tutorId: number) => {
    try {
      setLoadingBookings(prev => ({ ...prev, [tutorId]: true }));
      
      const bookingsResponse = await apiClient.get(`/api/bookings/tutor/${tutorId}`);
      const bookings = bookingsResponse.data.filter(
        (booking: Booking) => 
          booking.status === 'pending' || 
          booking.status === 'accepted' || 
          booking.status === 'completed'
      );
      
      setTutorBookings(prev => ({
        ...prev,
        [tutorId]: bookings
      }));
    } catch (error: any) {
      console.error(`Failed to fetch bookings for tutor ${tutorId}:`, error);
      // If fetching fails, ensure we at least have an empty array
      setTutorBookings(prev => ({
        ...prev,
        [tutorId]: []
      }));
    } finally {
      setLoadingBookings(prev => ({ ...prev, [tutorId]: false }));
    }
  };

  // Function to check if a time slot is available
  const isTimeSlotAvailable = (tutorId: number, date: Date) => {
    const hour = date.getHours();
    
    // Check if time is outside business hours (before 8am or after 8pm)
    if (hour < 8 || hour >= 20) {
      return false;
    }

    // Check for existing bookings
    const bookings = tutorBookings[tutorId] || [];
    const selectedTime = date.getTime();
    
    const hasConflict = bookings.some(booking => {
      try {
        const bookingStart = new Date(booking.startDatetime).getTime();
        const bookingEnd = new Date(booking.endDatetime).getTime();
        
        // Check if selected time conflicts with existing booking
        return selectedTime >= bookingStart && selectedTime < bookingEnd;
      } catch (e) {
        console.error('Error parsing booking time:', e);
        return false;
      }
    });

    return !hasConflict;
  };

  // Custom time filter for DatePicker
  const filterTime = (tutorId: number) => (time: Date) => {
    return isTimeSlotAvailable(tutorId, time);
  };

  // Handle calendar open - fetch latest bookings
  const handleCalendarOpen = async (tutorId: number) => {
    await fetchTutorBookings(tutorId);
  };

  const handleApply = async (tutorId: number) => {
    if (!user?.id) {
      toast({ title: 'Not logged in', description: 'Please log in to apply for a tutor.', variant: 'destructive' });
      return;
    }

    const start = selectedDates[tutorId];
    const selectedModule = selectedModules[tutorId];

    if (!selectedModule) {
      toast({ title: 'Select a module', description: 'Please choose a module before booking.', variant: 'destructive' });
      return;
    }

    if (!start) {
      toast({ title: 'Select a date', description: 'Please select a date and time for your session.', variant: 'destructive' });
      return;
    }

    // Check if selected time slot is available
    if (!isTimeSlotAvailable(tutorId, start)) {
      toast({ title: 'Time slot unavailable', description: 'This time slot is already booked. Please choose another time.', variant: 'destructive' });
      return;
    }

    const currentTutor = tutors.find(t => t.tutorId === tutorId);
    if (currentTutor && currentTutor.studentId === Number(user.id)) {
      toast({ title: 'Invalid booking', description: 'You cannot book a session with yourself.', variant: 'destructive' });
      return;
    }

    // --- Date & time restrictions ---
    const now = new Date();
    const oneWeekLater = new Date();
    const threeWeeksLater = new Date();
    oneWeekLater.setDate(now.getDate() + 7);
    threeWeeksLater.setDate(now.getDate() + 21);

    if (start < oneWeekLater) {
      toast({ title: 'Date too soon', description: 'Bookings must be scheduled at least 1 week in advance.', variant: 'destructive' });
      return;
    }

    if (start > threeWeeksLater) {
      toast({ title: 'Date too far ahead', description: 'You cannot book lessons more than 3 weeks in advance.', variant: 'destructive' });
      return;
    }

    const hour = start.getHours();
    if (hour < 8 || hour >= 20) {
      toast({ title: 'Invalid time', description: 'Bookings are only allowed between 08:00 and 20:00.', variant: 'destructive' });
      return;
    }

    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    // --- Send booking ---
    try {
      const response = await apiClient.post('/api/bookings', {
        tutorId,
        studentId: Number(user.id),
        startDatetime: start.toISOString(),
        endDatetime: end.toISOString(),
        status: 'pending',
        studentName: user.name || 'Student',
        subject: selectedModule,
      });

      toast({ title: 'Booking Sent!', description: `Your booking for ${selectedModule} with your tutor has been sent successfully.Please wait while it gets approved. View status in Dashboard.` });
      setSelectedDates(prev => ({ ...prev, [tutorId]: null }));
      setSelectedModules(prev => ({ ...prev, [tutorId]: '' }));

      // Refresh bookings to include the new one
      await fetchTutorBookings(tutorId);

    } catch (error: any) {
      console.error('Error applying for tutor:', error);
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to apply for tutor.', variant: 'destructive' });
    }
  };

  // Filter tutors
  const filteredTutors = tutors.filter(tutor => {
    if (!tutor.student) return false;
    const matchesSearch =
      searchQuery === '' ||
      tutor.student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.student.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.modules?.some(
        m =>
          m.module_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.module_code?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesSubject =
      selectedSubject === 'all' || tutor.modules?.some(m => m.module_name === selectedSubject);

    return matchesSearch && matchesSubject;
  });

  // --- Loading state ---
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

  // --- Render tutors ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Find Tutors</h1>
        <p className="text-muted-foreground">Connect with expert tutors for personalized learning</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tutors, subjects, modules, or specialties..."
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all" value="all">
                  All Subjects
                </SelectItem>
                {availableSubjects.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tutors List */}
      <div className="grid gap-6">
        {filteredTutors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tutors found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredTutors.map(tutor => (
            <Card key={tutor.tutorId} className="hover:shadow-custom-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-xl">{tutor.student?.name?.charAt(0) || 'T'}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{tutor.student?.name || 'Tutor'}</h3>
                        <p className="text-muted-foreground mt-1">{tutor.student?.bio || 'Bio not available'}</p>
                      </div>
                    </div>

                    {/* Modules */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Teaches:</h4>
                      <div className="flex flex-wrap gap-2">
                        {tutor.modules && tutor.modules.length > 0 ? (
                          tutor.modules.map((module, idx) => (
                            <Badge
                              key={`${module.id}-${idx}`}
                              variant={selectedModules[tutor.tutorId] === module.module_name ? 'default' : 'secondary'}
                              className={`text-xs cursor-pointer ${
                                selectedModules[tutor.tutorId] === module.module_name ? 'bg-blue-600 text-white' : ''
                              }`}
                              onClick={() =>
                                setSelectedModules(prev => ({ ...prev, [tutor.tutorId]: module.module_name }))
                              }
                            >
                              {module.module_name} ({module.module_code})
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No modules listed</p>
                        )}
                      </div>
                    </div>

                    {/* Booking */}
                    <div className="mt-4">
                      <DatePicker
                        selected={selectedDates[tutor.tutorId]}
                        onChange={(date: Date) => setSelectedDates(prev => ({ ...prev, [tutor.tutorId]: date }))}
                        onCalendarOpen={() => handleCalendarOpen(tutor.tutorId)}
                        showTimeSelect
                        timeIntervals={60}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        placeholderText="Select session start time"
                        className="border rounded-md p-2 w-full"
                        minDate={new Date()}
                        filterTime={filterTime(tutor.tutorId)}
                        injectTimes={[]}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Available times: 08:00 - 20:00. Booked slots are disabled.
                      </p>
                      {loadingBookings[tutor.tutorId] && (
                        <p className="text-xs text-blue-500 mt-1">Loading availability...</p>
                      )}
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <Button className="bg-gradient-primary hover:opacity-90" onClick={() => handleApply(tutor.tutorId)}>
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