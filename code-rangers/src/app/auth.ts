import NextAuth from "next-auth"
import { NextAuthConfig } from "next-auth"

export const runtime = 'nodejs';

export const authConfig: NextAuthConfig = {
  providers: [], // configured in route.ts
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/course');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
  },
} 