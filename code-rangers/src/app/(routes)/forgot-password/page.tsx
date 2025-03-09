'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface PasswordStrength {
  score: number;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isLongEnough: boolean;
}

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'newPassword'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false,
    isLongEnough: false,
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    let score = 0;
    if (hasLower) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
    if (isLongEnough) score++;

    setPasswordStrength({
      score,
      hasLower,
      hasUpper,
      hasNumber,
      hasSpecial,
      isLongEnough,
    });
  };

  const getPasswordStrengthColor = () => {
    const { score } = passwordStrength;
    if (score <= 1) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('OTP sent to your email');
        setStep('otp');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }
    setStep('newPassword');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    // Password validation
    if (passwordStrength.score < 3) {
      toast.error('Please create a stronger password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset successfully');
        router.push('/login');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex min-h-screen bg-cover bg-center bg-no-repeat ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} style={{ backgroundImage: "url('/foliage.png')" }}>
      {/* Toggle Theme Button */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-4 right-4 p-2 rounded-full focus:outline-none"
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? (
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Left Section */}
      <div className={`w-1/2 flex items-center justify-center p-0 ${isDarkMode ? 'bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500' : 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300'} bg-opacity-75`}>
        <div className={`text-white bg-[url(/foliage.png)] bg-cover bg-center bg-no-repeat bg-opacity-50 p-8 rounded-lg w-full h-full`}>
        </div>
      </div>

      {/* Right Section */}
      <div className={`w-1/2 flex flex-col items-center justify-center p-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className={`mt-6 text-center text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Reset Password
            </h2>
          </div>

          {step === 'email' && (
            <form onSubmit={handleRequestOTP} className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300 focus:ring-gray-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none`}
                  placeholder="Enter your email"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-md ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-blue-600 text-white'} ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="mt-8 space-y-6">
              <div>
                <label htmlFor="otp" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300 focus:ring-gray-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none`}
                  placeholder="Enter OTP sent to your email"
                />
              </div>
              <button
                type="submit"
                className={`w-full py-2 rounded-md ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-blue-600 text-white'} hover:bg-blue-700`}
              >
                Verify OTP
              </button>
            </form>
          )}

          {step === 'newPassword' && (
            <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
              <div>
                <label htmlFor="newPassword" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      calculatePasswordStrength(e.target.value);
                    }}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300 focus:ring-gray-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} hover:opacity-80`}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password strength indicator */}
                <div className="mt-2">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <div className={`mt-2 grid grid-cols-2 gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className={`flex items-center ${
                      passwordStrength.hasLower ? (isDarkMode ? 'text-green-400' : 'text-green-600') : 'text-gray-400'
                    }`}>
                      <span>✓ Lowercase letter</span>
                    </div>
                    <div className={`flex items-center ${
                      passwordStrength.hasUpper ? (isDarkMode ? 'text-green-400' : 'text-green-600') : 'text-gray-400'
                    }`}>
                      <span>✓ Uppercase letter</span>
                    </div>
                    <div className={`flex items-center ${
                      passwordStrength.hasNumber ? (isDarkMode ? 'text-green-400' : 'text-green-600') : 'text-gray-400'
                    }`}>
                      <span>✓ Number</span>
                    </div>
                    <div className={`flex items-center ${
                      passwordStrength.hasSpecial ? (isDarkMode ? 'text-green-400' : 'text-green-600') : 'text-gray-400'
                    }`}>
                      <span>✓ Special character</span>
                    </div>
                    <div className={`flex items-center ${
                      passwordStrength.isLongEnough ? (isDarkMode ? 'text-green-400' : 'text-green-600') : 'text-gray-400'
                    }`}>
                      <span>✓ 8+ characters</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300 focus:ring-gray-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} hover:opacity-80`}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || passwordStrength.score < 3 || newPassword !== confirmPassword}
                className={`w-full py-2 rounded-md ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-blue-600 text-white'} ${
                  loading || passwordStrength.score < 3 || newPassword !== confirmPassword
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-blue-700'
                }`}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="text-center">
            <a
              href="/login"
              className={`font-medium ${isDarkMode ? 'text-gray-300 hover:text-gray-200' : 'text-blue-600 hover:text-blue-500'}`}
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 