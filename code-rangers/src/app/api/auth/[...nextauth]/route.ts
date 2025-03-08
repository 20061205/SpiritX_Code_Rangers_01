import { User } from '@/models/models';
import connectMongo from '@/lib/dbconfig';

import clientPromise from '@/lib/mongodb'; // Connect to MongoDB
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { GoogleProfile } from 'next-auth/providers/google';




interface Credentials {
  email: string;
  password: string;
}

interface UserType {
  _id: string;
  email: string;
  username: string;
  password: string;
  enrolledCourses: string[];
}

const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      profile(profile: GoogleProfile) {
        console.log(profile);
        return{
          ...profile,
          role: profile.role ?? 'student',
          id:profile.id.toString(),
          image: profile.picture,
        }
      },
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Credentials | undefined) {
        await connectMongo();
        const user = await User.findOne({ email: credentials?.email }) as UserType | null;

        if (user && credentials?.password === user.password) {
          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            enrolledCourses: user.enrolledCourses,
            role: 'student', // or fetch the role from the database if available
          };
        }

        throw new Error('Invalid email or password');
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise), // Use MongoDB for storing users
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
       // token._id = user.id;
        token.role=user.role;
      }
      return token;
    },
    async session({ session, token }) {
      
      if (session.user) session.user.role=token.role;
      return session;
    },
   
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(options);
export { handler as POST, handler as GET, options as authOptions };