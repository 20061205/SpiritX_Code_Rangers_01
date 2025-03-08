'use client';

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { getSession } from 'next-auth/react';
import { Session } from "next-auth";

const DashboardPage = () => {
  const router = useRouter();
  const [session_, setSession_] = useState<Session | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession(); // Getting the session
      if (!session) {
        router.push("/login"); // Redirecting to sign-in if no session
      } else {
        setSession_(session); // Setting the session to state
      }
    };

    checkSession(); // Calling the session check
  }, [router]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <>
      {session_ && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('/foliage.png')" }}>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black opacity-50"></div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center p-8 bg-white bg-opacity-90 rounded-lg shadow-lg w-100 h-100">
            {/* Logout Button in Top Right Corner */}
            <div className="absolute top-4 right-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition cursor-pointer"
              >
                Logout
              </button>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-gray-800">Hello, {session_.user?.username}!</h1>
            <p className="text-lg text-gray-600">Welcome back to your dashboard.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardPage;