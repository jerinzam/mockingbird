import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSubdomain } from '@/utils/getSubDomain';
// import { createClient } from '@/utils/supabaseServer';
import { updateSession } from '@/utils/supabaseMiddleware';


export async function middleware(req: NextRequest) {
  await updateSession(req)
  console.log('MIDDLEWARE TRIGGERED');
  const res = NextResponse.next();
  
  // try {
    // Manually log and parse cookies to debug
    const cookieHeader = req.cookies.getAll();
    // console.log('Cookies:', cookieHeader);
        // Create a Supabase client
        // const supabase = createClient()

        // Refresh the session if needed
        // const { data: { session }, error } = supabase.auth.getSession()
    // const supabase = createMiddlewareClient({ req, res });
    
    // // Add error handling for session retrieval
    // let session = null;
    // try {
    //   const { data } = await supabase.auth.getSession();
    //   session = data.session;
    //   console.log('MIDDLEWARE SESSION:', session ? 'Session exists' : 'No session');
    // } catch (sessionError) {
    //   console.error('Session retrieval error:', sessionError);
    // }

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
  // } catch (error) {
  //   console.error('Middleware Error:', error);
    
  //   // Log full error details
  //   if (error instanceof Error) {
  //     console.error('Error Name:', error.name);
  //     console.error('Error Message:', error.message);
  //     console.error('Error Stack:', error.stack);
  //   }

  //   // Optionally, you can return a response or rethrow
  //   return NextResponse.next();
  // }
}

export const config = {
  matcher: ['/:path*']
};