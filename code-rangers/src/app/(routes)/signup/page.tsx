'use client';

import { useState, useEffect } from 'react';
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from 'react-hot-toast';

interface ValidationErrors {
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

const Signup = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [passcode, setPasscode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const [formData, setFormData] = useState({
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

  const handleNextStep = () => {
    if (step === 1 && !role) {
      setError("Please select a role");
      return;
    }
    if ((role === "Instructor" || role === "Admin") && step === 2 && !passcode) {
      setError("Please enter the passcode");
      return;
    }
    if (step === 3 && (!firstName || !lastName || !email)) {
      setError("Please fill in all fields");
      return;
    }
    if (step === 4 && (password !== confirmPassword)) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key as keyof typeof formData]);
    });

    if (Object.keys(errors).length > 0) {
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
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Something went wrong');
      }

      toast.success('Account created successfully!');
      
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

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: `/api/auth/callback/google` });
  };

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
    validateField('username', formData.username);
    validateField('password', formData.password);
    validateField('confirmPassword', formData.confirmPassword);
  }, [formData]);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'username':
        if (!value) {
          newErrors.username = 'Username is required';
        } else if (value.length < 8) {
          newErrors.username = 'Username must be at least 8 characters long';
        } else {
          delete newErrors.username;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters long';
        } else if (!/[a-z]/.test(value)) {
          newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/[A-Z]/.test(value)) {
          newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          newErrors.password = 'Password must contain at least one special character';
        } else {
          delete newErrors.password;
        }
        calculatePasswordStrength(value);
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getPasswordStrengthColor = () => {
    const { score } = passwordStrength;
    if (score <= 1) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="font-sans min-h-screen flex items-center justify-center bg-gray-100">
      <Head>
        <title>Signup Page</title>
      </Head>
      <main className="max-w-6xl w-full flex shadow-lg">
        <div className="flex w-full">
          {/* Left Section */}
          <div className="bg-white p-10 flex-1 flex flex-col justify-center">
            <h1 className="text-2xl mb-4">SIGN UP</h1>
            <p className="mb-4">How to get started lorem ipsum dolor at?</p>
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">Select Role</option>
                    <option value="Student">Student</option>
                    <option value="Instructor">Instructor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              )}
              {step === 2 && (role === "Instructor" || role === "Admin") && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Passcode</label>
                  <input
                    type="text"
                    placeholder="Enter Passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              )}
              {step === 3 && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <button
                    type="button"
                    className="bg-white text-gray-800 border border-gray-300 p-2 rounded flex items-center justify-center mt-2"
                    onClick={handleGoogleSignIn}
                  >
                    <Image
                      src="/icon-google0.svg"
                      width={20}
                      height={20}
                      alt="Google Icon"
                      className="w-5 mr-2"
                      loading="eager"
                    />
                    Sign up with Google
                  </button>
                </>
              )}
              {step === 4 && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Profile Picture URL</label>
                    <input
                      type="text"
                      placeholder="Profile Picture URL"
                      value={profilePicture}
                      onChange={(e) => setProfilePicture(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Phone</label>
                    <input
                      type="text"
                      placeholder="Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Street</label>
                    <input
                      type="text"
                      placeholder="Street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">City</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">State</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">ZIP Code</label>
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                </>
              )}
              {error && <p className="text-red-500">{error}</p>}
              {success && <p className="text-green-500">{success}</p>}
              <div className="flex justify-between mt-4">
                {step > 1 && (
                  <button
                    type="button"
                    className="bg-gray-600 text-white p-2 rounded"
                    onClick={handlePreviousStep}
                  >
                    Previous
                  </button>
                )}
                {step < 4 && (
                  <button
                    type="button"
                    className="bg-indigo-600 text-white p-2 rounded"
                    onClick={handleNextStep}
                  >
                    Next
                  </button>
                )}
                {step === 4 && (
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white p-2 rounded"
                  >
                    Create Account
                  </button>
                )}
              </div>
            </form>
            <p className="mt-4">
              Already have an account? <a href="/login">Log in</a>
            </p>
          </div>

          {/* Right Section */}
          <div className="flex-1 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white flex flex-col justify-center items-center text-center p-10 relative">
            {/* Rectangle 3 */}
            <div className="w-52 h-24 bg-white rounded-lg absolute top-5 left-7"></div>

            {/* Rectangle 5 */}
            <div className="w-24 h-12 bg-white bg-opacity-50 rounded absolute bottom-12 right-7"></div>

            {/* Illustration - SVG Image (banner-1-10.svg) */}
            <Image
              className="w-64 h-auto relative mt-5"
              src="/image.png"
              width={300}
              height={300}
              alt="Banner 1"
              loading="eager"
            />

            {/* Text */}
            <h2 className="text-xl mt-5">
              Very good works are waiting for you Login Now!!!
            </h2>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;