import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth.config';
import { decideWhereAnAppVisitorMustGo } from '@/lib/app-visit';

const { auth } = NextAuth(authConfig);

export const proxy = auth((request) => {
  const destination = decideWhereAnAppVisitorMustGo(request.auth);

  if (destination) {
    return NextResponse.redirect(new URL(destination, request.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/app/:path*'],
};
