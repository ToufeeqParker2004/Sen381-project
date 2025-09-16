import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

interface User {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
  isTutor: boolean;
  tutorApplicationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const profileData = await res.json();

      setUser(prev => ({
        ...prev,
        name: profileData.name,
        avatar: profileData.avatar,
        tutorApplicationStatus: profileData.tutorApplicationStatus || 'none',
      }));
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) initializeUser(token);
  }, []);

  const initializeUser = async (token: string) => {
    try {
      const decoded = jwtDecode<{ sub: string; email: string; roles: string[] }>(token);

      // Set initial user flags from JWT roles
      setUser({
        id: decoded.sub,
        email: decoded.email,
        name: '', // will be filled after profile fetch
        avatar: '', // will be filled after profile fetch
        isAdmin: decoded.roles.includes('ADMIN'),
        isTutor: decoded.roles.includes('TUTOR'),
        tutorApplicationStatus: 'none', // default until profile fetch
      });

      // Fetch additional profile info from backend
      await fetchProfile(token);
    } catch (err) {
      console.error('Failed to decode token', err);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:9090/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;

      const token = await res.text();
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

  const updateUser = (updates: Partial<User>) => {
    if (user) setUser({ ...user, ...updates });
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
