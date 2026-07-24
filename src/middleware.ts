import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('aghaz-admin-auth')?.value;
  const { pathname } = request.nextUrl;

  let isAuthenticated = false;
  if (authCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(authCookie));
      isAuthenticated = !!parsed?.state?.token;
    } catch {
      // ignore invalid cookie values
    }
  }

  if (!isAuthenticated && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthenticated && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
