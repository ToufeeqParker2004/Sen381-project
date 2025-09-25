import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  name?: string;
  identifier: string;
  avatar?: string;
  isAdmin: boolean;
  isTutor: boolean;
  tutorApplicationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
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
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!res.ok) return;

      const profileData = await res.json();
      console.log('Profile fetched:', profileData);

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

  const initializeUser = async (token: string) => {
    try {
      const decoded = jwtDecode<{ sub: string; email: string; roles: string[] }>(token);

      setUser({
        id: decoded.sub,
        identifier: decoded.email,
        name: '', // Will be replaced after fetching profile
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
      // Special-case Microsoft demo login (no backend)
      if (identifier === 'microsoft@belgiumcampus.edu' && password === 'microsoft') {
        setUser({
          id: 'microsoft',
          name: 'Microsoft User',
          identifier,
          avatar: '',
          isAdmin: true,
          isTutor: true,
          tutorApplicationStatus: 'approved',
        });
        return true;
      }

      // Normal backend login
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
