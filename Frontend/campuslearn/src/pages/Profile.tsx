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
import { User as UserIcon, Mail, Phone, MapPin, GraduationCap, LogOut, Upload } from 'lucide-react';
import type { User } from '@/context/AuthContext';
import { useEffect } from 'react';


const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(user?.avatar || '');
  const [photoPreview, setPhotoPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tutorApplication, setTutorApplication] = useState({
    subjects: '',
    qualifications: '',
    experience: '',
    availability: ''
  });

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

  const handleTutorApplication = () => {
    updateUser({ tutorApplicationStatus: 'pending' });
    toast({
      title: 'Application Submitted',
      description: 'Your tutor application has been submitted for review.',
    });
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

        {/* Tutor Application */}
        {(!user.isTutor && user.tutorApplicationStatus !== 'pending') && (
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
                <Label htmlFor="subjects">Subjects You Can Tutor</Label>
                <Input
                  id="subjects"
                  placeholder="e.g., Mathematics, Computer Science, Physics"
                  value={tutorApplication.subjects}
                  onChange={(e) => setTutorApplication({ ...tutorApplication, subjects: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <Textarea
                  id="qualifications"
                  placeholder="List your relevant qualifications and certifications"
                  value={tutorApplication.qualifications}
                  onChange={(e) => setTutorApplication({ ...tutorApplication, qualifications: e.target.value })}
                />
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
                <Textarea
                  id="availability"
                  placeholder="When are you available to tutor? (days, times, etc.)"
                  value={tutorApplication.availability}
                  onChange={(e) => setTutorApplication({ ...tutorApplication, availability: e.target.value })}
                />
              </div>

              <Button onClick={handleTutorApplication} className="w-full">
                Submit Tutor Application
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Account Security */}
        <Card className="shadow-custom-md">
          <CardHeader>
            <CardTitle>Security & Privacy</CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">Change Password</Button>
            <Button variant="outline" className="w-full">Two-Factor Authentication</Button>
            <Button variant="outline" className="w-full">Privacy Settings</Button>
          </CardContent>
        </Card>

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
