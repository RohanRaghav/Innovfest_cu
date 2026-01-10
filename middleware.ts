import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/register', '/api/auth'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = token.role;
  const isAdmin = userRole === 'ADMIN';
  const isZonalHead = userRole === 'ZONAL_HEAD';
  const isCampusAmbassador = userRole === 'CAMPUS_AMBASSADOR';

  if (pathname.startsWith('/admin')) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  if (pathname.startsWith('/zonal')) {
    if (!(isAdmin || isZonalHead)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  if (pathname.startsWith('/ca')) {
    if (!(isAdmin || isZonalHead || isCampusAmbassador)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  if (pathname.startsWith('/api/admin')) {
    if (!isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  if (pathname.startsWith('/api/zonal')) {
    if (!(isAdmin || isZonalHead)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  if (pathname.startsWith('/api/ca')) {
    if (!(isAdmin || isZonalHead || isCampusAmbassador)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
