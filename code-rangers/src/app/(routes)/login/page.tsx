'use client';

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { signIn } from "next-auth/react";

const LoginPage = () => {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();

    const username = e.currentTarget.username.value;
    const password = e.currentTarget.password.value;

    const result = await signIn("credentials", {
      redirect: false,
      username: username,
      password: password,
    });

    if (result?.error) {
      console.error(result.error);
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      router.push("/dashboard");
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`flex min-h-screen bg-cover bg-center bg-no-repeat ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} style={{ backgroundImage: "url('/foliage.png')" }}>
      {/* Toggle Theme Button */}
      <button
        onClick={toggleTheme}
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
            {/* <div className="flex items-center justify-center h-full">
              <h1 className="text-4xl font-bold mb-4 mx-auto text-center">
              Welcome Back to Code Rangers! 👋
              </h1>
            </div> */}
        </div>
      </div>

      {/* Right Section */}
      <div className={`w-1/2 flex flex-col items-center justify-center p-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-blue-800'}`}>
          LOG IN
        </h2>
        <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Welcome back! Please login to your account.
        </p>
        <form onSubmit={handleOnSubmit} className="w-full max-w-sm space-y-4">
          <div>
            <label
              htmlFor="username"
              className={`block font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300 focus:ring-gray-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none`}
              placeholder="Enter your username"
              required
            />
            {error === "No user found." && (
              <p className="text-red-500 text-sm">
                Username is invalid. Please try again.
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className={`block font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300 focus:ring-gray-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none`}
              placeholder="Enter your password"
              required
            />
            {error === "Invalid password" && (
              <p className="text-red-500 text-sm">
                Password is invalid. Please try again.
              </p>
            )}
          </div>
          {error === "Invalid username or password" && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}
          <button
            type="submit"
            className={`w-full py-2 rounded-md ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-blue-600 text-white'} ${loading ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'} transition`}
            disabled={loading}
          >
            {loading ? "Loading..." : "Log in"}
          </button>
        </form>

        <div className="flex flex-col items-center gap-4 mt-6">
          <a
            href="/forgot-password"
            className={`text-sm hover:underline ${isDarkMode ? 'text-gray-300' : 'text-blue-500'}`}
          >
            Forgot Password?
          </a>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            New user?{" "}
            <a href="/signup" className={`hover:underline ${isDarkMode ? 'text-gray-300' : 'text-blue-500'}`}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;