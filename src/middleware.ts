import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('aghaz-admin-auth')?.value;
  const { pathname } = request.nextUrl;

  // Parse the cookie to check auth state
  let isAuthenticated = false;
  if (token) {
    try {
      const parsed = JSON.parse(token);
      isAuthenticated = !!parsed?.state?.token;
    } catch {
      // ignore
    }
  }

  // Redirect to login if not authenticated and not on login page
  if (!isAuthenticated && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if authenticated and on login page
  if (isAuthenticated && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
