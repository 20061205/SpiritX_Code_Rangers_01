import { auth } from './app/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user
  const isOnDashboard = req.nextUrl.pathname.startsWith('/course')
  
  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }
  
  return null
}) 