'use client';

import Link from 'next/link';
import { useState } from 'react';
import { birdIcons } from './birdIcons';

export function MockingbirdHeader() {
  const [currentIconKey, setCurrentIconKey] = useState<keyof typeof birdIcons>('faceRight');

  const cycleIcon = () => {
    const keys = Object.keys(birdIcons) as Array<keyof typeof birdIcons>;
    const currentIndex = keys.indexOf(currentIconKey);
    const nextIndex = (currentIndex + 1) % keys.length;
    setCurrentIconKey(keys[nextIndex]);
  };

  const BirdIcon = birdIcons[currentIconKey];

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
        <nav className="flex space-x-4 text-xs">
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
        </nav>
      </div>
    </header>
  );
}