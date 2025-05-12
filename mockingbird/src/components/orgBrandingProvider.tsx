'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function OrgBrandingProvider({
  children,
  orgSettings,
  session,
  org,
  isLoading = false,
  handleLogin,
  handleLogout,
}: {
  children: React.ReactNode;
  orgSettings: {
    branding?: {
      logoUrl?: string;
      primaryColor?: string;
      orgName?: string;
    };
  };
  session?: any; // Your session type
  org?: { id?: string; name?: string }; // Your org type
  isLoading?: boolean;
  handleLogin?: () => void;
  handleLogout?: () => void;
}) {
  console.log("inbrandingprovider XXXX",session,org)
  const branding = orgSettings?.branding || {};
  const primaryColor = branding.primaryColor || '#4F46E5';
  const pathname = usePathname();
  const router = useRouter();

  // Detect if this is the org landing page ("/[org]")
  const isLandingPage =false;// /^\/[^/]+\/?$/.test(pathname);

  // Detect if this is a subdomain (org) route
  // Assumes your org routes are like /[org]/...
  const isOrgRoute = true;///^\/[^/]+(\/|$)/.test(pathname);

  // Bird icon cycling (for main app only)
  const birdIcons = {
    faceRight: () => <span className="text-6xl">🐦</span>,
    faceLeft: () => <span className="text-6xl">🕊️</span>,
    faceUp: () => <span className="text-6xl">🪶</span>,
    faceDown: () => <span className="text-6xl">🦜</span>,
    happy: () => <span className="text-6xl">🐧</span>,
    sad: () => <span className="text-6xl">🦩</span>,
    flying: () => <span className="text-6xl">🦢</span>,
    sitting: () => <span className="text-6xl">🦉</span>,
    pixelRight: () => <span className="text-6xl">🐤</span>,
    pixelLeft: () => <span className="text-6xl">🐥</span>,
    colorful1: () => <span className="text-6xl">🦚</span>,
    colorful2: () => <span className="text-6xl">🦜</span>
  };
  const [currentIconKey, setCurrentIconKey] = useState<keyof typeof birdIcons>('faceRight');
  const BirdIcon = birdIcons[currentIconKey];
  const cycleIcon = () => {
    const keys = Object.keys(birdIcons) as Array<keyof typeof birdIcons>;
    const currentIndex = keys.indexOf(currentIconKey);
    const nextIndex = (currentIndex + 1) % keys.length;
    setCurrentIconKey(keys[nextIndex]);
  };

  // Dashboard click handler (optional, like MockingbirdHeader)
  const onDashboardClick = (e: React.MouseEvent) => {
   
    if (!session && handleLogin) {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#f9fafb' }}>
      <header className="sticky top-0 z-10 bg-white border-b-2 border-black shadow-[0_4px_0_#000] backdrop-blur-sm bg-opacity-90">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Left side - Logo/Brand/Bird */}
          <div className="flex items-center space-x-2">
            {/* Show company logo for subdomains/org routes, bird icon for main app */}
            {isOrgRoute && branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.orgName || 'Organization Logo'}
                className="h-10 w-10 rounded-full object-contain border-2"
                style={{ borderColor: primaryColor }}
              />
            ) : (
              <button 
                onClick={cycleIcon} 
                className="focus:outline-none hover:scale-110 transition-transform"
                title="Click to change bird icon"
              >
                <BirdIcon />
              </button>
            )}
            <h1 className="text-xl font-bold tracking-tight" style={{ color: primaryColor }}>
              {branding.orgName || 'Mockingbird'}
            </h1>
          </div>

          {/* Right side - Navigation */}
          {!isLandingPage && (
            <nav className="flex items-center space-x-4 text-xs">
              <Link href="/" className="relative group">
                <span className="absolute inset-0 bg-blue-200 opacity-0 group-hover:opacity-50 transition-opacity rounded"></span>
                <span className="relative">Home</span>
              </Link>
              <Link href="/training" className="relative group">
                <span className="absolute inset-0 bg-blue-200 opacity-0 group-hover:opacity-50 transition-opacity rounded"></span>
                <span className="relative">Training</span>
              </Link>
              <Link href="/interview" className="relative group">
                <span className="absolute inset-0 bg-blue-200 opacity-0 group-hover:opacity-50 transition-opacity rounded"></span>
                <span className="relative">Interviews</span>
              </Link>
              <Link href="/about" className="relative group">
                <span className="absolute inset-0 bg-blue-200 opacity-0 group-hover:opacity-50 transition-opacity rounded"></span>
                <span className="relative">About</span>
              </Link>

              {/* Dashboard Link */}
              <div className="h-4 w-px bg-gray-300 mx-2"></div>
              <Link 
                href="/dashboard"
                onClick={onDashboardClick}
                className={`relative group ${!session ? 'cursor-pointer' : ''}`}
              >
                <span className="absolute inset-0 bg-yellow-200 opacity-0 group-hover:opacity-50 transition-opacity rounded"></span>
                <span className="relative flex items-center">
                  Dashboard
                  {!session && (
                    <span className="ml-1 text-[10px] text-gray-500">(Login required)</span>
                  )}
                </span>
              </Link>

              {/* Org Settings Button */}
              {session && org && (
                <Link
                  href={`/dashboard/organizations/${org.id}/settings`}
                  className="px-3 py-1 border border-black text-[10px] font-bold rounded bg-blue-200 hover:bg-blue-300 transition-all"
                >
                  Org Settings
                </Link>
              )}

              {/* User Section */}
              {session ? (
                <>
                  <div className="h-4 w-px bg-gray-300 mx-2"></div>
                  <span className="px-3 py-1 bg-gray-100 border border-black rounded text-[10px] font-medium">
                    {org?.name ?? 'No Org'}
                  </span>
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="px-3 py-1 border border-black text-[10px] font-bold rounded bg-red-200 hover:bg-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Logging out...' : 'Logout'}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="px-3 py-1 border border-black text-[10px] font-bold rounded bg-yellow-300 hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              )}
            </nav>
          )}
        </div>
      </header>
      <main className="px-6 py-10 max-w-6xl mx-auto w-full">{children}</main>
    </div>
  );
}