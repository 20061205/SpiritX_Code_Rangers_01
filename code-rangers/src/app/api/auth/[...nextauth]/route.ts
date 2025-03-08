import connectMongo from '@/lib/dbconfig';
import clientPromise from '@/lib/mongodb';
import NextAuth, { 
  NextAuthOptions, 
  DefaultSession 
} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { GoogleProfile } from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import User from '@/models/user';

// Extend the built-in session types
declare module 'next-auth' {
  interface User extends NextAuthUser {
    role?: string;
    username?: string;
  }
  
  interface Session {
    user: {
      role?: string;
      username?: string;
    } & DefaultSession['user']
  }
}

export const runtime = 'nodejs';

const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      profile(profile: GoogleProfile) {
        return {
          ...profile,
          role: profile.role ?? 'student',
          id: profile.sub,
          image: profile.picture,
        }
      },
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please provide both email and password');
          }

          await connectMongo();

          // Find user by email
          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          
          if (!user) {
            throw new Error('No user found with this email');
          }

          // Compare passwords
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          // Return user without password
          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            username: user.username,
            role: user.role || 'student'
          };
        } catch (error: any) {
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(options);
export { handler as GET, handler as POST, options as authOptions };