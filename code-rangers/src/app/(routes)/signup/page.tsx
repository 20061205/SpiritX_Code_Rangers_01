'use client';


import { useState, useEffect } from 'react';

import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { toast } from 'react-hot-toast';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

interface PasswordStrength {
  score: number;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isLongEnough: boolean;
}

const SignupPage = () => {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false,
    isLongEnough: false,
  });

  // Check system preference for dark mode on mount
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Password strength calculation
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

  // Real-time validation
  useEffect(() => {
    validateForm(formData);
  }, [formData]);

  const validateForm = (data: FormData) => {
    const newErrors: ValidationErrors = {};

    if (!data.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!data.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!data.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!data.username) {
      newErrors.username = 'Username is required';
    } else if (data.username.length < 8) {
      newErrors.username = 'Username must be at least 8 characters long';
    }

    if (!data.password) {
      newErrors.password = 'Password is required';
    } else if (data.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/[a-z]/.test(data.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[A-Z]/.test(data.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    if (!data.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (data.confirmPassword !== data.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm(formData)) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();


      if (!response.ok) {
        // Handle specific error cases
        if (data.message === 'Email already registered') {
          setErrors(prev => ({
            ...prev,
            email: 'This email is already registered. Please use a different email.'
          }));
          toast.error('Email already registered');
          return;
        }
        
        if (data.message === 'Username already taken') {
          setErrors(prev => ({
            ...prev,
            username: 'This username is already taken. Please choose another one.'
          }));
          toast.error('Username already taken');
          return;
        }

        throw new Error(data.message || 'Something went wrong');
      }

      toast.success('Account created successfully!');

      // Show confirmation dialog
      const confirmed = window.confirm('Account created successfully! You will be redirected to the login page.');

      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signIn('google', {
        callbackUrl: '/',
        redirect: true
      });
    } catch (error) {
      toast.error('Failed to sign in with Google');
    }
  };

  const getPasswordStrengthColor = () => {
    const { score } = passwordStrength;
    if (score <= 1) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDarkMode 
        ? 'bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-900'
        : 'bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400'
    }`}>
      <div className="flex w-full max-w-6xl bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Left side - Image */}
        <div className={`hidden lg:block lg:w-1/2 relative ${
          isDarkMode ? 'bg-gray-900' : 'bg-blue-50'
        }`}>
          <div className="relative h-full flex flex-col items-center justify-center p-12">
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-teal-400 rounded-full opacity-20"></div>
            
            {/* Main image */}
            <Image
              src="/signup-illustration.svg"
              alt="Sign up illustration"
              width={400}
              height={400}
              className="relative z-10 max-w-md"
            />
            
            {/* Welcome text */}
            <div className="text-center mt-8 relative z-10">
              <h1 className={`text-3xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Welcome to Code Rangers
              </h1>
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Join our community of developers and start your journey
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className={`w-full lg:w-1/2 ${
          isDarkMode 
            ? 'bg-gray-800 text-white'
            : 'bg-white text-gray-900'
        } p-8 relative`}>
          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-opacity-80"
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

          <h2 className={`text-3xl font-bold text-center mb-8 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Create Account</h2>
          
          {/* Add Google Sign-up Button */}
          <button
            onClick={handleGoogleSignup}
            className={`w-full mb-6 py-3 px-4 border ${
              isDarkMode ? 'border-gray-600' : 'border-gray-300'
            } rounded-md shadow-sm flex items-center justify-center space-x-2 ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-white hover:bg-gray-50'
            } transition-colors`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className={isDarkMode ? 'text-white' : 'text-gray-700'}>
              Continue with Google
            </span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${
                isDarkMode ? 'border-gray-600' : 'border-gray-300'
              }`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${
                isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
              }`}>
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                      : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="First Name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                      : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Last Name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                    : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                    : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                      : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Create password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  } hover:opacity-80`}
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
              
              {/* Password strength indicator */}
              <div className="mt-2">
                <div className={`h-2 w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div className={`flex items-center ${
                    passwordStrength.hasLower 
                      ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                      : (isDarkMode ? 'text-gray-500' : 'text-gray-400')
                  }`}>
                    <span>✓ Lowercase letter</span>
                  </div>
                  <div className={`flex items-center ${
                    passwordStrength.hasUpper
                      ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                      : (isDarkMode ? 'text-gray-500' : 'text-gray-400')
                  }`}>
                    <span>✓ Uppercase letter</span>
                  </div>
                  <div className={`flex items-center ${
                    passwordStrength.hasNumber
                      ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                      : (isDarkMode ? 'text-gray-500' : 'text-gray-400')
                  }`}>
                    <span>✓ Number</span>
                  </div>
                  <div className={`flex items-center ${
                    passwordStrength.hasSpecial
                      ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                      : (isDarkMode ? 'text-gray-500' : 'text-gray-400')
                  }`}>
                    <span>✓ Special character</span>
                  </div>
                  <div className={`flex items-center ${
                    passwordStrength.isLongEnough
                      ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                      : (isDarkMode ? 'text-gray-500' : 'text-gray-400')
                  }`}>
                    <span>✓ 8+ characters</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                      : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  } hover:opacity-80`}
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
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400'
              } ${
                isLoading || Object.keys(errors).length > 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className={`mt-4 text-center text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Already have an account?{' '}
            <a href="/login" className={`${
              isDarkMode
                ? 'text-blue-400 hover:text-blue-300'
                : 'text-blue-600 hover:text-blue-500'
            }`}>
              Sign in
            </a>
          </p>
        </div>
      </div>

    </div>
  );
};


export default SignupPage;

