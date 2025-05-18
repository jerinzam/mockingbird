'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabaseClient';
import { useOrgContext } from '@/context/orgContext';

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

export function MockingbirdHeader() {
  const [currentIconKey, setCurrentIconKey] = useState<keyof typeof birdIcons>('faceRight');
  const { session } = useSession();
  const { org } = useOrgContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient()
  const cycleIcon = () => {
    const keys = Object.keys(birdIcons) as Array<keyof typeof birdIcons>;
    const currentIndex = keys.indexOf(currentIconKey);
    const nextIndex = (currentIndex + 1) % keys.length;
    setCurrentIconKey(keys[nextIndex]);
  };

  const BirdIcon = birdIcons[currentIconKey];

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`
        }
      });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDashboardClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b-2 border-black shadow-[0_4px_0_#000] backdrop-blur-sm bg-opacity-90">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left side - Logo and Brand */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={cycleIcon} 
            className="focus:outline-none hover:scale-110 transition-transform"
            title="Click to change bird icon"
          >
            <BirdIcon />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Mockingbird</h1>
        </div>

        {/* Right side - Navigation */}
        <nav className="flex items-center space-x-4 text-xs">
          {/* Public Navigation */}
          <Link href="/" className="relative group">
            <span className="absolute inset-0 bg-blue-200 opacity-0 group-hover:opacity-50 transition-opacity rounded"></span>
            <span className="relative">Home</span>
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
            href={`/dashboard/organizations/${org?.id}`}
            onClick={handleDashboardClick}
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
      </div>
    </header>
  );
}