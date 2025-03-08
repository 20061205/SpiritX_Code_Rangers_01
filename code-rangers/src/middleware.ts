import NextAuth from 'next-auth';
import { authConfig } from './app/auth';

export const runtime = 'nodejs';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 