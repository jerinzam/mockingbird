'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { birdIcons } from './birdIcons';
import { supabase } from '@/utils/supabaseClient';

export function MockingbirdHeader() {
  const [currentIconKey, setCurrentIconKey] = useState<keyof typeof birdIcons>('faceRight');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const cycleIcon = () => {
    const keys = Object.keys(birdIcons) as Array<keyof typeof birdIcons>;
    const currentIndex = keys.indexOf(currentIconKey);
    const nextIndex = (currentIndex + 1) % keys.length;
    setCurrentIconKey(keys[nextIndex]);
  };

  const BirdIcon = birdIcons[currentIconKey];

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) console.error('Failed to fetch user:', error.message);
      setUserEmail(user?.email ?? null);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout failed:', error.message);
      return;
    }

    // Refresh or redirect after logout
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b-2 border-black shadow-[0_4px_0_#000] backdrop-blur-sm bg-opacity-90">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
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

        <nav className="flex items-center space-x-4 text-xs">
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

          {userEmail && (
            <>
              <span className="ml-4 px-3 py-1 bg-gray-100 border border-black rounded text-[10px] font-medium">
                {userEmail}
              </span>
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1 border border-black text-[10px] font-bold rounded bg-red-200 hover:bg-red-300 transition-all"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
