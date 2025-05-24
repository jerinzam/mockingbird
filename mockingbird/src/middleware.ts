// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSubdomain } from '@/utils/getSubDomain';
import { updateSession } from '@/utils/supabaseMiddleware';
import { featureFlagMiddleware } from './middleware/featureFlagMiddleware';

export async function middleware(req: NextRequest) {
  await updateSession(req);
  console.log('MIDDLEWARE TRIGGERED');
  
  // Check feature flags first
  const featureFlagResponse = await featureFlagMiddleware(req);
  if (featureFlagResponse) {
    return featureFlagResponse;
  }

  const res = NextResponse.next();
  const host = req.headers.get('host') || '';
  const subdomain = getSubdomain(host);
  const nextUrl = req.nextUrl;
  const pathname = nextUrl.pathname;

  // Skip processing for static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt')
  ) {
    return res;
  }

  // Handle subdomain routing
  if (subdomain && subdomain !== 'www') {
    console.log('MIDDLEWARE SUBDOMAIN:', { 
      host, 
      subdomain, 
      pathname: req.nextUrl.pathname 
    });
    return NextResponse.rewrite(new URL(`/${subdomain}${req.nextUrl.pathname}`, req.url));
  }

  console.log('MIDDLEWARE DETAILS:', { 
    host, 
    subdomain, 
    pathname: req.nextUrl.pathname 
  });

  return res;
}

export const config = {
  matcher: ['/:path*']
};