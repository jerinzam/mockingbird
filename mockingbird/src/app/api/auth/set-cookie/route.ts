import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

  const { token } = await req.json();
  console.log('Setting cookie XXXXXXXXX',token);
  const response = NextResponse.json({ success: true });

  // Get the host from the request
  const host = req.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  
  // For localhost, use the full host as domain
  // For production, use the root domain
  const domain = isLocalhost ? host : `.${host.split('.').slice(-2).join('.')}`;

  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    domain: "jerinzam."+domain,
    secure: !isLocalhost,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return response;
}