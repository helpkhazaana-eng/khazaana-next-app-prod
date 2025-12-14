import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware - Admin routes are protected by Firebase Auth in AdminLayoutClient
// This middleware only handles general request processing
export default function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
