import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export interface User {
  id: string;
  name?: string;
  identifier: string;
  email?: string;
  avatar?: string;
  isAdmin: boolean;
  isTutor: boolean;
  tutorApplicationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  location?: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch('http://localhost:9090/student/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!res.ok) return;

      const profileData = await res.json();
      setUser(prev => ({
        ...prev,
        name: profileData.name,
        avatar: profileData.avatar,
        tutorApplicationStatus: profileData.tutorApplicationStatus || 'none',
        location: profileData.location,
        phoneNumber: profileData.phoneNumber,
      }));
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const initializeUser = async (token: string) => {
    try {
      const decoded = jwtDecode<{ sub: string; email: string; roles: string[] }>(token);

      setUser({
        id: decoded.sub,
        identifier: decoded.email,
        email: decoded.email,
        name: '',
        avatar: '',
        isAdmin: decoded.roles.includes('ADMIN'),
        isTutor: decoded.roles.includes('TUTOR'),
        tutorApplicationStatus: 'none',
      });

      await fetchProfile(token);
    } catch (err) {
      console.error('Failed to decode token', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) initializeUser(token);
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      // Admin account - manual login
      if (identifier === 'admin@campus.edu' && password === 'admin123') {
        setUser({
          id: 'admin-user',
          name: 'Admin User',
          identifier,
          avatar: '',
          isAdmin: true,
          isTutor: false,
          tutorApplicationStatus: 'none',
        });
        return true;
      }

      // Student demo account
      if (identifier === 'student@campus.edu' && password === 'student123') {
        setUser({
          id: 'student-user',
          name: 'Demo Student',
          identifier,
          avatar: '',
          isAdmin: false,
          isTutor: false,
          tutorApplicationStatus: 'none',
        });
        return true;
      }

      // Tutor demo account
      if (identifier === 'tutor@campus.edu' && password === 'tutor123') {
        setUser({
          id: 'tutor-user',
          name: 'Demo Tutor',
          identifier,
          avatar: '',
          isAdmin: false,
          isTutor: true,
          tutorApplicationStatus: 'approved',
        });
        return true;
      }

      // Microsoft demo account
      if (identifier === 'microsoft@belgiumcampus.edu' && password === 'microsoft') {
        setUser({
          id: 'microsoft',
          name: 'Microsoft User',
          identifier,
          avatar: '',
          isAdmin: false,
          isTutor: true,
          tutorApplicationStatus: 'approved',
        });
        return true;
      }

      const res = await fetch('http://localhost:9090/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      const token = data.token;
      localStorage.setItem('authToken', token);
      await initializeUser(token);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    // Immediate local update (optimistic)
    setUser(prev => ({
      ...prev!,
      ...updates,
    }));

    try {
      const res = await fetch(`http://localhost:9090/student/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          ...user,
          ...updates,
          isTutor: updates.isTutor ?? user.isTutor,
          tutorApplicationStatus: updates.tutorApplicationStatus ?? user.tutorApplicationStatus,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      const updatedUser = await res.json();

      setUser(prev => ({
        ...prev!,
        ...updatedUser,
        isTutor: updatedUser.isTutor ?? prev!.isTutor,
        tutorApplicationStatus: updatedUser.tutorApplicationStatus ?? prev!.tutorApplicationStatus,
      }));
    } catch (error: any) {
      console.error('Error updating user:', error.message);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};