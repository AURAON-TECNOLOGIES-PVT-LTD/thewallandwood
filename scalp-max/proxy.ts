import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = ['/dashboard'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this path needs protection
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isLoginPage = pathname === '/dashboard/login';

  if (!isProtected || isLoginPage) return NextResponse.next();

  const session = request.cookies.get('dashboard_session')?.value;

  if (session !== 'authenticated') {
    const loginUrl = new URL('/dashboard/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
