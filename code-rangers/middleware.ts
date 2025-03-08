import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/course') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/course/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
} 