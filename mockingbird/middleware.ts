import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSubdomain } from '@/utils/getSubDomain';

export async function middleware(req: NextRequest) {
  console.log('MIDDLEWARE TRIGGEREDDDDDDDDDDDDDDDDDDD');
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  const host = req.headers.get('host') || '';
  const subdomain = getSubdomain(host);

  console.log('MIDDLEWARE:', { host, subdomain, pathname: req.nextUrl.pathname });

  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*']
};