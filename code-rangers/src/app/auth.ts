import NextAuth from 'next-auth'

export const runtime = 'nodejs'

export const { auth, handlers } = NextAuth({
  providers: [],
  pages: {
    signIn: '/login'
  }
}) 