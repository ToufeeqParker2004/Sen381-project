import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { User as UserIcon, Mail, Phone, MapPin, GraduationCap, LogOut, Upload, FileText, ChevronDown } from 'lucide-react';
import type { User } from '@/context/AuthContext';
import { TimeSlotSelector } from '@/components/ui/TimeSlotSelector';
import { Checkbox } from '@/components/ui/checkbox';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(user?.avatar || '');
  const [photoPreview, setPhotoPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qualificationFileRef = useRef<HTMLInputElement>(null);
  const [qualificationFile, setQualificationFile] = useState<File | null>(null);
  const [tutorApplication, setTutorApplication] = useState({
    subjects: [] as string[],
    experience: '',
    availability: [] as Array<{ day: string; times: string[] }>
  });
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [hasPendingApplication, setHasPendingApplication] = useState<boolean>(false);

  useEffect(() => {
    const fetchModules = async () => {
      setIsLoadingModules(true);
      try {
        const response = await fetch('http://localhost:9090/modules', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch modules');
        }
        const data = await response.json();
        setAvailableModules(data.map((m: any) => m.module_name)); // Assuming backend returns ModuleDTO with module_name
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load modules from database.',
          variant: 'destructive',
        });
        setAvailableModules([]); // Fallback to empty
      } finally {
        setIsLoadingModules(false);
      }
    };
    fetchModules();
  }, [toast]);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotoPreview(result);
        setProfilePhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleQualificationUpload = () => {
    qualificationFileRef.current?.click();
  };

  const handleQualificationFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please select a PDF file.',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a PDF smaller than 10MB.',
          variant: 'destructive',
        });
        return;
      }
      setQualificationFile(file);
      toast({
        title: 'File selected',
        description: `${file.name} is ready to upload.`,
      });
    }
  };

  const handleSaveProfile = () => {
    const firstNameInput = (document.getElementById('firstName') as HTMLInputElement).value;
    const lastNameInput = (document.getElementById('lastName') as HTMLInputElement).value;
    const emailInput = (document.getElementById('email') as HTMLInputElement).value;
    const phoneInput = (document.getElementById('phone') as HTMLInputElement).value;
    const locationInput = (document.getElementById('location') as HTMLInputElement).value;

    const updates: Partial<User> = {
      name: `${firstNameInput} ${lastNameInput}`.trim(),
      email: emailInput,
      phoneNumber: phoneInput,
      location: locationInput,
    };

    updateUser(updates);
    setIsEditing(false);
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.',
    });
  };

  const toggleSubject = (subject: string) => {
    setTutorApplication(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleTutorApplication = async () => {
    // Validate all required fields
    if (tutorApplication.subjects.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please select at least one subject you can tutor.',
        variant: 'destructive',
      });
      return;
    }

    if (!qualificationFile) {
      toast({
        title: 'Missing Information',
        description: 'Please upload your most recent transcript.',
        variant: 'destructive',
      });
      return;
    }

    if (!tutorApplication.experience.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please describe your teaching/tutoring experience.',
        variant: 'destructive',
      });
      return;
    }

    if (tutorApplication.availability.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please add at least one availability time slot.',
        variant: 'destructive',
      });
      return;
    }

    const availabilityJson = {
      availability: tutorApplication.availability.map(slot => ({
        day: slot.day,
        start: slot.times[0].split('-')[0],
        end: slot.times[0].split('-')[1]
      }))
    };

    const formData = new FormData();
    formData.append('studentId', user!.id);
    const trimmedSubjects = tutorApplication.subjects.map(subject => subject.trim());
    trimmedSubjects.forEach(subject => formData.append('modules', subject)); // Send as multiple modules parameters to map to List<String>
    formData.append('experienceDescription', tutorApplication.experience);
    formData.append('availabilityJson', JSON.stringify(availabilityJson));
    formData.append('applicationTranscript', qualificationFile);
    formData.append('status', 'PENDING');

    try {
      const response = await fetch('http://localhost:9090/api/tutoring-applications', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit tutor application');
      }

      // Update local state to hide the form
      setHasPendingApplication(true);

      toast({
        title: 'Application Submitted',
        description: 'Your tutor application has been submitted for review.',
      });

      // Reset form
      setTutorApplication({
        subjects: [],
        experience: '',
        availability: [],
      });
      setQualificationFile(null);
      if (qualificationFileRef.current) {
        qualificationFileRef.current.value = '';
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while submitting your application.',
        variant: 'destructive',
      });
    }
  };

  const getTutorStatusBadge = () => {
    if (user?.isTutor) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Active Tutor</Badge>;
    }

    switch (user?.tutorApplicationStatus) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Application Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Application Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Application Rejected</Badge>;
      default:
        return null;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch('http://localhost:9090/notifications/subscribed', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch subscription status');

        const data = await res.json();
        setSubscribed(data.subscribed ?? false);
      } catch (err) {
        console.error('Failed to fetch subscription status', err);
        toast({
          title: 'Error',
          description: 'Could not fetch subscription status.',
          variant: 'destructive',
        });
      }
    };

    fetchSubscription();
  }, [toast]);

  useEffect(() => {
    const checkPendingApplication = async () => {
      if (!user || user.isAdmin || user.isTutor) return;

      try {
        const response = await fetch('http://localhost:9090/api/tutoring-applications', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const applications = await response.json();
          const userApplication = applications.find((app: any) => 
            app.student?.id === parseInt(user.id) && app.status?.toLowerCase() === 'pending'
          );
          setHasPendingApplication(!!userApplication);
        }
      } catch (error) {
        console.error('Failed to check pending application', error);
      }
    };

    checkPendingApplication();
  }, [user]);

  const updatePassword = async (newPassword: string) => {
    try {
      const response = await fetch(`http://localhost:9090/student/updatePassword/${Number(user.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Password updated successfully.',
        });
      } else {
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
        } catch {
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Profile & Settings</h1>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-custom-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Manage your account details and preferences</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={photoPreview || user.avatar} alt="Profile" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {photoPreview && (
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <div className="flex gap-2">
                  {user.isAdmin && <Badge variant="secondary">Admin</Badge>}
                  {getTutorStatusBadge()}
                </div>
                <Button size="sm" variant="outline" className="gap-2" onClick={handlePhotoUpload}>
                  <Upload className="h-4 w-4" />
                  Change Photo
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={user.name.split(' ')[0]} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={user.name.split(' ')[1] || ''} disabled={!isEditing} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={user.email} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue={user.phoneNumber || ''} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Campus Location</Label>
                <Input id="location" defaultValue={user.location || ''} disabled={!isEditing} />
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing || photoPreview ? (
                <>
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setPhotoPreview('');
                      setProfilePhoto(user.avatar || '');
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {user.isTutor && (
          <Card className="shadow-custom-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Tutor Availability
              </CardTitle>
              <CardDescription>Manage your tutoring availability schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tutor-availability">Update Your Availability</Label>
                <TimeSlotSelector
                  value={tutorApplication.availability}
                  onChange={(slots) => {
                    setTutorApplication({ ...tutorApplication, availability: slots });
                    toast({
                      title: 'Availability Updated',
                      description: 'Your tutoring schedule has been updated.',
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {!user.isAdmin && !user.isTutor && !hasPendingApplication && (
          <Card className="shadow-custom-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Become a Tutor
              </CardTitle>
              <CardDescription>Apply to become a tutor and help other students succeed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subjects You Can Tutor (Select Multiple)</Label>
                <Card className="p-4">
                  {isLoadingModules ? (
                    <p>Loading modules...</p>
                  ) : availableModules.length === 0 ? (
                    <p>No modules available. Please contact support.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableModules.map((module) => (
                        <div key={module} className="flex items-center space-x-2">
                          <Checkbox
                            id={module}
                            checked={tutorApplication.subjects.includes(module)}
                            onCheckedChange={() => toggleSubject(module)}
                          />
                          <label
                            htmlFor={module}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {module}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  {tutorApplication.subjects.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Selected subjects:</p>
                      <div className="flex flex-wrap gap-2">
                        {tutorApplication.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualifications">Most Recent Transcript (PDF)</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleQualificationUpload}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {qualificationFile ? 'Change PDF' : 'Upload PDF'}
                  </Button>
                  {qualificationFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="truncate max-w-[200px]">{qualificationFile.name}</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={qualificationFileRef}
                  onChange={handleQualificationFileChange}
                  accept=".pdf"
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  Upload your most recent academic transcript as a PDF (max 10MB)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Teaching/Tutoring Experience</Label>
                <Textarea
                  id="experience"
                  placeholder="Describe your teaching or tutoring experience"
                  value={tutorApplication.experience}
                  onChange={(e) => setTutorApplication({ ...tutorApplication, experience: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <TimeSlotSelector
                  value={tutorApplication.availability}
                  onChange={(slots) => setTutorApplication({ ...tutorApplication, availability: slots })}
                />
              </div>

              <Button onClick={handleTutorApplication} className="w-full">
                Submit Tutor Application
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Other sections like Security & Privacy and Notifications */}
        {/* ... (keep the rest of the template code as is) */}
      </div>
    </div>
  );
};

export default Profile;