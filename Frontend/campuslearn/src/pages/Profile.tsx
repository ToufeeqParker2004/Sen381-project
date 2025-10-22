import React, { useState, useRef } from 'react';
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
import { useEffect } from 'react';
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

  const SUBJECTS = [
    'Mathematics',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Geography',
    'Economics',
    'Business Studies',
    'Accounting',
    'Engineering',
    'Statistics',
    'Psychology',
    'Other'
  ];

  const [subscribed, setSubscribed] = useState<boolean>(false);

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

    // Send confirmation email
    try {
      const response = await fetch('https://moikeoljuxygsrnuhfws.supabase.co/functions/v1/send-tutor-application-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaWtlb2xqdXh5Z3NybnVoZndzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNjkzNjMsImV4cCI6MjA3NTY0NTM2M30.yiIU8-5ECNVFJHgNmQK3TO4KSecjahi85wGNf9gC5Wo'}`,
        },
        body: JSON.stringify({
          name: user?.name || 'Student',
          email: user?.email || user?.identifier || '',
        }),
      });

      if (!response.ok) {
        console.error('Failed to send confirmation email');
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }

    updateUser({ tutorApplicationStatus: 'pending' });
    toast({
      title: 'Application Submitted',
      description: 'Your tutor application has been submitted for review. Check your email for confirmation.',
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
        setSubscribed(data.subscribed ?? false); // set default false if null
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
  }, []);
  

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
}


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
        {/* Profile Information */}
        <Card className="shadow-custom-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Manage your account details and preferences</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Avatar Section */}
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

            {/* Form Fields */}
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

        {/* Tutor Availability Management */}
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

        {/* Tutor Application */}
        {(!user.isTutor && user.tutorApplicationStatus !== 'pending' && !user.isAdmin) && (
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SUBJECTS.map(subject => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subject-${subject}`}
                          checked={tutorApplication.subjects.includes(subject)}
                          onCheckedChange={() => toggleSubject(subject)}
                        />
                        <label
                          htmlFor={`subject-${subject}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {subject}
                        </label>
                      </div>
                    ))}
                  </div>
                  {tutorApplication.subjects.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Selected subjects:</p>
                      <div className="flex flex-wrap gap-2">
                        {tutorApplication.subjects.map(subject => (
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

        {
  /* Account Security */
}
<Card className="shadow-custom-md border border-gray-200">
  <CardHeader className="pb-3">
    <CardTitle className="text-lg font-semibold text-gray-900">Security & Privacy</CardTitle>
    <CardDescription className="text-gray-600">Manage your account security settings</CardDescription>
  </CardHeader>
  <CardContent>
    <Button 
      variant="outline" 
      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 transition-colors"
      onClick={() => setIsChangePasswordOpen(true)}
    >
      Change Password
    </Button>
  </CardContent>
</Card>

{/* Change Password Modal */}
{isChangePasswordOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
          <button 
            onClick={() => setIsChangePasswordOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">Create a new secure password for your account</p>
      </div>
      
      {/* Form */}
      <form 
        className="p-6 space-y-5" 
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const newPassword = formData.get('newPassword');
          const confirmPassword = formData.get('confirmPassword');
          
          if (newPassword !== confirmPassword) {
            toast({
              title: 'Error',
              description: 'Passwords do not match.',
              variant: 'destructive',
            });
            return;
          }
          
          updatePassword(newPassword as string);
          setIsChangePasswordOpen(false);
        }}
      >
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-900 block">New Password</label>
          <input 
            type="password" 
            name="newPassword"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none"
            placeholder="Enter new password" 
            required 
          />
        </div>
        
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-900 block">Confirm Password</label>
          <input 
            type="password" 
            name="confirmPassword"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none"
            placeholder="Confirm new password" 
            required 
          />
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button" 
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            onClick={() => setIsChangePasswordOpen(false)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  </div>
)}

        {/* Notifications */}
        <Card className="shadow-custom-md">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <input
                type="checkbox"
                checked={subscribed}
                onChange={async (e) => {
                  const newValue = e.target.checked;
                  setSubscribed(newValue); // optimistic UI

                  try {
                    const response = await fetch('http://localhost:9090/notifications/subscribe', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                      },
                      body: JSON.stringify({ subscribed: newValue }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData?.error || 'Failed to update subscription');
                    }

                    toast({
                      title: 'Success',
                      description: `Notifications ${newValue ? 'enabled' : 'disabled'}.`,
                    });
                  } catch (err) {
                    setSubscribed(!newValue); // revert on failure
                    toast({
                      title: 'Error',
                      description: (err as Error).message,
                      variant: 'destructive',
                    });
                  }
                }}
              />


            </div>

            {/*
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <input type="checkbox" id="push-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <input type="checkbox" id="sms-notifications" />
            </div>
            */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;