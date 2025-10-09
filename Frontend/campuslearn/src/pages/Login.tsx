import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import MicrosoftLoginModal from '@/components/ui/MicrosoftLoginModal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMicrosoftModal, setShowMicrosoftModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: 'Login Successful',
          description: 'Welcome to CampusLearn!',
        });
        
        // Get user data to check if admin
        const token = localStorage.getItem('authToken');
        if (token) {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          if (decoded.roles && decoded.roles.includes('ADMIN')) {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          navigate('/');
        }
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Login Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  };

  const handleMicrosoftLogin = () => {
    setShowMicrosoftModal(true);
  };

  const handleMicrosoftSuccess = async (email: string, password: string) => {
    // Microsoft login uses real database authentication
    const success = await login(email, password, true);
    
    if (success) {
      toast({
        title: 'Microsoft Login Successful',
        description: 'Welcome to CampusLearn!',
      });
      
      // Check if user is admin and redirect accordingly
      const token = localStorage.getItem('authToken');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        if (decoded.roles && decoded.roles.includes('ADMIN')) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    } else {
      toast({
        title: 'Microsoft Login Failed',
        description: 'Invalid credentials.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold text-3xl mr-4">
              BC
            </div>
            <div className="bg-orange-500 text-white px-4 py-2 rounded font-semibold text-lg">
              2
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">BELGIUM CAMPUS</h1>
          <p className="text-xl text-orange-400">iTversity</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-xl mr-3">
                BC
              </div>
              <div className="bg-orange-500 text-white px-3 py-1 rounded font-semibold">
                2
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">BELGIUM CAMPUS</h2>
            <p className="text-sm text-orange-500">iTversity</p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign in to your account</h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Username</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center">
                <Checkbox id="remember" className="h-4 w-4 text-blue-600" />
                <Label htmlFor="remember" className="ml-2 text-sm text-gray-600">Remember me</Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 px-4 rounded-md transition duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign in with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 flex items-center justify-center space-x-2"
              onClick={handleMicrosoftLogin}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
              </svg>
              <span>Microsoft Belgium Campus</span>
            </Button>

            
          </div>
        </div>
      </div>

      <MicrosoftLoginModal
        isOpen={showMicrosoftModal}
        onClose={() => setShowMicrosoftModal(false)}
        onSuccess={handleMicrosoftSuccess}
      />
    </div>
  );
};

export default Login;