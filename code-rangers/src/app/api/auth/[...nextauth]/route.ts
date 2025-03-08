import User from '@/models/user';
import connectMongo from '@/lib/dbconfig';

import clientPromise from '@/lib/mongodb'; // Connect to MongoDB
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import bcrypt from 'bcryptjs';

interface Credentials {
  username: string;
  password: string;
}

interface UserType {
  _id: string;
  email: string;
  username: string;
  password: string;
  // enrolledCourses: string[];
  role: string;
}

const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Credentials | undefined) {
        await connectMongo();
        const user = await User.findOne({ username: credentials?.username }) as UserType | null;

        if (user && credentials?.password) {
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (isPasswordValid) {
            return {
              id: user._id.toString(),
              email: user.email,
              username: user.username,
              // enrolledCourses: user.enrolledCourses,
              role: user.role, // fetch the role from the database
            };
          }
        }

        throw new Error('Invalid username or password');
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise), // Use MongoDB for storing users
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // if (user) {
      //   token.role = (user as UserType).role;
      // }
      return token;
    },
    async session({ session, token }) {
      // if (session.user) {
      //   session.user.role = token.role;
      // }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(options);
export { handler as POST, handler as GET, options as authOptions };