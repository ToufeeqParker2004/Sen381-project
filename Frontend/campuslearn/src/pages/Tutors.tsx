import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/services/api';
import { TutorWithStudent, Module } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen, Calendar, Clock, User, MapPin, Star, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import emailjs from '@emailjs/browser';


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

// Replace the entire sendBookingConfirmationEmail function with this:
const sendBookingConfirmationEmail = async (bookingDetails: {
  userEmail: string;
  studentName: string;
  tutorName: string;
  subject: string;
  date: string;
  time: string;
}) => {
  try {
    const templateParams = {
      to_email: bookingDetails.userEmail,
      student_name: bookingDetails.studentName,
      tutor_name: bookingDetails.tutorName,
      subject: bookingDetails.subject,
      date: bookingDetails.date,
      time: bookingDetails.time,
      duration: '60 minutes',
      status: 'pending',
      booking_date: new Date().toLocaleDateString(),
      // Add these to use in your template if needed:
      user_email: bookingDetails.userEmail,
      to_name: bookingDetails.studentName,
    };

    const result = await emailjs.send(
      'service_tlebz6m',
      'template_v4xkr7z',
      templateParams,
      'DbLbu0XllEUuRCyeU' // Add public key here too for security
    );
    
    console.log('Email sent successfully to:', bookingDetails.userEmail);
    return true;
  } catch (error) {
    console.error('Failed to send email to:', bookingDetails.userEmail, error);
    return false;
  }
};

export default function TutorsPage() {
  const { toast } = useToast();
  const [tutors, setTutors] = useState<TutorWithStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [tutorBookings, setTutorBookings] = useState<{ [tutorId: number]: Booking[] }>({});
  const [loadingBookings, setLoadingBookings] = useState<{ [tutorId: number]: boolean }>({});
  const [bookingStep, setBookingStep] = useState<'dates' | 'times'>('dates');
  const { user } = useAuth();

  // Generate time slots from 8:00 to 20:00
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Fetch tutors and modules
  useEffect(() => {
    const fetchTutorsWithModules = async () => {
      try {
        setIsLoading(true);
        const tutorsResponse = await apiClient.get('/tutors');
        const tutorData = tutorsResponse.data;

        const tutorsWithDetails = await Promise.all(
          tutorData.map(async (tutor: any) => {
            try {
              const modulesResponse = await apiClient.get(`/tutors/${tutor.id}/modules`);
              const modulesData: TutorWithModulesResponse = modulesResponse.data;

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
              return {
                tutorId: tutor.id,
                studentId: tutor.studentId,
                student: {
                  id: tutor.studentId,
                  name: tutor.studentEmail?.split('@')[0] || 'Unknown Tutor',
                  email: tutor.studentEmail || '',
                  bio: 'Professional tutor with expertise in multiple subjects',
                  location: 'Remote',
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
      setTutorBookings(prev => ({
        ...prev,
        [tutorId]: []
      }));
    } finally {
      setLoadingBookings(prev => ({ ...prev, [tutorId]: false }));
    }
  };

  // Check if a time slot is available
  const isTimeSlotAvailable = (tutorId: number, date: Date, time: string) => {
    if (!date) return false;

    const [hours] = time.split(':');
    const slotDate = new Date(date);
    slotDate.setHours(parseInt(hours), 0, 0, 0);

    // Check business hours
    const hour = slotDate.getHours();
    if (hour < 8 || hour >= 20) {
      return false;
    }

    // Check for existing bookings
    const bookings = tutorBookings[tutorId] || [];
    const selectedTime = slotDate.getTime();

    const hasConflict = bookings.some(booking => {
      try {
        const bookingStart = new Date(booking.startDatetime).getTime();
        const bookingEnd = new Date(booking.endDatetime).getTime();

        return selectedTime >= bookingStart && selectedTime < bookingEnd;
      } catch (e) {
        console.error('Error parsing booking time:', e);
        return false;
      }
    });

    return !hasConflict;
  };

  // Handle tutor selection
  const handleTutorSelect = async (tutorId: number) => {
    setSelectedTutor(tutorId);
    setSelectedDate(null);
    setSelectedTime('');
    setSelectedModule('');
    setBookingStep('dates');
    await fetchTutorBookings(tutorId);
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime('');
    setBookingStep('times');
  };

  // Handle back to dates
  const handleBackToDates = () => {
    setBookingStep('dates');
    setSelectedTime('');
  };

  // Handle booking with email notification
  const handleBookSession = async () => {
    if (!user?.id) {
      toast({ title: 'Authentication Required', description: 'Please log in to book a session.', variant: 'destructive' });
      return;
    }

    if (!selectedTutor || !selectedDate || !selectedTime || !selectedModule) {
      toast({ title: 'Incomplete Information', description: 'Please select all required fields to proceed.', variant: 'destructive' });
      return;
    }

    const currentTutor = tutors.find(t => t.tutorId === selectedTutor);
    if (currentTutor && currentTutor.studentId === Number(user.id)) {
      toast({ title: 'Invalid Selection', description: 'You cannot book a session with yourself.', variant: 'destructive' });
      return;
    }

    // Date validation
    const now = new Date();
    const oneWeekLater = new Date();
    const threeWeeksLater = new Date();
    oneWeekLater.setDate(now.getDate() + 7);
    threeWeeksLater.setDate(now.getDate() + 21);

    if (selectedDate < oneWeekLater) {
      toast({ title: 'Scheduling Notice', description: 'Bookings must be scheduled at least 1 week in advance.', variant: 'destructive' });
      return;
    }

    if (selectedDate > threeWeeksLater) {
      toast({ title: 'Scheduling Notice', description: 'You cannot book lessons more than 3 weeks in advance.', variant: 'destructive' });
      return;
    }

    // Create datetime objects
    const [hours] = selectedTime.split(':');
    const start = new Date(selectedDate);
    start.setHours(parseInt(hours), 0, 0, 0);

    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    // Check availability
    if (!isTimeSlotAvailable(selectedTutor, selectedDate, selectedTime)) {
      toast({ title: 'Time Slot Unavailable', description: 'This time slot is already booked. Please choose another time.', variant: 'destructive' });
      return;
    }

    try {
      // Create the booking
      const response = await apiClient.post('/api/bookings', {
        tutorId: selectedTutor,
        studentId: Number(user.id),
        startDatetime: start.toISOString(),
        endDatetime: end.toISOString(),
        status: 'pending',
        studentName: user.name || 'Student',
        subject: selectedModule,
      });

      // Send email notification
      const tutor = tutors.find(t => t.tutorId === selectedTutor);
      const emailSent = await sendBookingConfirmationEmail({
        userEmail: user.email || '', // Using user's email from auth
        studentName: user.name || 'Student',
        tutorName: tutor?.student?.name || 'Tutor',
        subject: selectedModule,
        date: selectedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: selectedTime
      });

      // Show appropriate toast message based on email success
      toast({
        title: 'Booking Request Submitted',
        description: `Your session request for ${selectedModule} has been sent for approval. ${
          emailSent 
            ? 'A confirmation email has been sent to your email address.' 
            : 'Unable to send confirmation email, but your booking was submitted successfully.'
        }`
      });

      // Reset form
      setSelectedDate(null);
      setSelectedTime('');
      setSelectedModule('');
      setSelectedTutor(null);
      setBookingStep('dates');

      // Refresh bookings
      await fetchTutorBookings(selectedTutor);

    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Booking Failed',
        description: error.response?.data?.message || 'Unable to process your booking request. Please try again.',
        variant: 'destructive'
      });
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

  // Generate dates for the next 3 weeks
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 7; i <= 21; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const availableDates = generateAvailableDates();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/30 py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Academic Tutors</h1>
              <p className="text-gray-600 mt-2">Connect with qualified academic professionals</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading professional tutors...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Academic Tutors</h1>
          <p className="text-gray-600 mt-2">Connect with qualified academic professionals</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-2xl w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by tutor name, subject, or module code..."
                  className="pl-10 border-gray-300 focus:border-black"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-64 border-gray-300 focus:border-black">
                  <SelectValue placeholder="Filter by subject" />
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

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Tutors List */}
          <div className="xl:col-span-3 space-y-6">
            {filteredTutors.length === 0 ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tutors found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                </CardContent>
              </Card>
            ) : (
              filteredTutors.map(tutor => (
                <Card
                  key={tutor.tutorId}
                  className={`border border-gray-200 shadow-sm transition-all hover:shadow-md cursor-pointer ${selectedTutor === tutor.tutorId ? 'ring-2 ring-black bg-gray-50/20' : ''
                    }`}
                  onClick={() => handleTutorSelect(tutor.tutorId)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white font-semibold">
                          {tutor.student?.name?.charAt(0) || 'T'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">{tutor.student?.name || 'Professional Tutor'}</h3>
                              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                Available
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">
                              {tutor.student?.bio || 'Experienced academic tutor'}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{tutor.student?.location || 'Remote'}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${selectedTutor === tutor.tutorId ? 'rotate-90' : ''
                            }`} />
                        </div>

                        {/* Expertise */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Areas of Expertise</h4>
                          <div className="flex flex-wrap gap-2">
                            {tutor.modules && tutor.modules.length > 0 ? (
                              tutor.modules.map((module, idx) => (
                                <Badge
                                  key={`${module.id}-${idx}`}
                                  variant="secondary"
                                  className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 font-medium"
                                >
                                  {module.module_name}
                                  <span className="text-gray-500 ml-1">({module.module_code})</span>
                                </Badge>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">Expertise information coming soon</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Booking Panel */}
          <div className="xl:col-span-2">
            <div className="sticky top-8">
              {selectedTutor ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="text-center border-b border-gray-200 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Schedule Session</h3>
                        <p className="text-sm text-gray-600 mt-1">60-minute professional session</p>
                      </div>

                      {/* Selected Tutor */}
                      {(() => {
                        const tutor = tutors.find(t => t.tutorId === selectedTutor);
                        return tutor ? (
                          <div className="flex items-center gap-3 p-3 bg-gray-50/30 rounded-lg border border-gray-100">
                            <Avatar className="h-10 w-10 border border-gray-200">
                              <AvatarFallback className="bg-gray-100 text-gray-700 text-sm font-medium">
                                {tutor.student?.name?.charAt(0) || 'T'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{tutor.student?.name}</p>
                              <p className="text-xs text-gray-600 truncate">Academic Tutor</p>
                            </div>
                          </div>
                        ) : null;
                      })()}

                      {/* Module Selection */}
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-900">Select Subject</label>
                        <Select value={selectedModule} onValueChange={setSelectedModule}>
                          <SelectTrigger className="w-full border-gray-300 focus:border-black">
                            <SelectValue placeholder="Choose subject area" />
                          </SelectTrigger>
                          <SelectContent>
                            {(() => {
                              const tutor = tutors.find(t => t.tutorId === selectedTutor);
                              return tutor?.modules?.map(module => (
                                <SelectItem key={module.id} value={module.module_name}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{module.module_name}</span>
                                    <span className="text-xs text-gray-500">{module.module_code}</span>
                                  </div>
                                </SelectItem>
                              ));
                            })()}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date/Time Selection */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-gray-900">
                            {bookingStep === 'dates' ? 'Preferred Date' : 'Available Times'}
                          </label>
                          {bookingStep === 'times' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleBackToDates}
                              className="text-xs text-gray-600 hover:text-gray-900"
                            >
                              <ArrowLeft className="h-3 w-3 mr-1" />
                              Change date
                            </Button>
                          )}
                        </div>

                        {bookingStep === 'dates' ? (
                          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                            {availableDates.map((date, index) => (
                              <Button
                                key={index}
                                variant={selectedDate?.toDateString() === date.toDateString() ? "default" : "outline"}
                                className={`h-9 text-xs font-medium ${selectedDate?.toDateString() === date.toDateString()
                                  ? 'bg-black hover:bg-gray-800 text-white'
                                  : 'border-gray-300 hover:border-black'
                                  }`}
                                onClick={() => handleDateSelect(date)}
                              >
                                <Calendar className="h-3 w-3 mr-1" />
                                {date.toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-2 bg-gray-50 rounded border border-gray-200 text-center">
                              <p className="text-sm font-medium text-gray-900">
                                {selectedDate?.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                              {timeSlots.map(time => {
                                const isAvailable = isTimeSlotAvailable(selectedTutor, selectedDate, time);
                                return (
                                  <Button
                                    key={time}
                                    variant={selectedTime === time ? "default" : "outline"}
                                    disabled={!isAvailable}
                                    className={`h-9 text-xs font-medium ${selectedTime === time
                                      ? 'bg-black hover:bg-gray-800 text-white'
                                      : isAvailable
                                        ? 'border-gray-300 hover:border-black'
                                        : 'border-gray-200 text-gray-400'
                                      }`}
                                    onClick={() => setSelectedTime(time)}
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    {time}
                                  </Button>
                                );
                              })}
                            </div>
                            {loadingBookings[selectedTutor] && (
                              <p className="text-xs text-gray-600 font-medium">Checking availability...</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Booking Summary */}
                      {(selectedDate || selectedTime || selectedModule) && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Session Details</h4>
                          {selectedModule && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Subject:</span>
                              <span className="font-medium text-gray-900">{selectedModule}</span>
                            </div>
                          )}
                          {selectedDate && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Date:</span>
                              <span className="font-medium text-gray-900">
                                {selectedDate.toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                          {selectedTime && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Time:</span>
                              <span className="font-medium text-gray-900">{selectedTime}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium text-gray-900">60 minutes</span>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5"
                        onClick={handleBookSession}
                        disabled={!selectedDate || !selectedTime || !selectedModule}
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Request Session
                      </Button>

                      <p className="text-xs text-gray-500 text-center leading-relaxed">
                        All sessions require 1-week advance booking and are subject to tutor confirmation
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-sm text-center">
                  <CardContent className="p-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Tutor</h3>
                    <p className="text-gray-600 text-sm">Choose a qualified academic professional to schedule your session</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}