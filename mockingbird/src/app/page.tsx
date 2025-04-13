'use client';

import { NextPage } from 'next';
import Link from 'next/link';

const HomePage: NextPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2] text-[#222222] font-mono">
      <div className="max-w-4xl w-full px-8 py-10 border-[3px] border-black rounded-[12px] bg-white shadow-[4px_4px_0_#000] text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">🐦 Mockingbird</h1>
        <p className="text-xl mb-10">AI-powered Interviews</p>

 
        <Link
          href="/interview"
          className="inline-block px-6 py-3 text-lg font-bold bg-yellow-300 border-2 border-black rounded-md 
            shadow-[3px_3px_0_#000] 
            hover:translate-x-[2px] hover:translate-y-[2px] 
            hover:shadow-[2px_2px_0_#000] 
            transition-transform"
        >
 
            View Interviews
          </Link>

        <footer className="mt-10 text-sm text-gray-600">
          <p>Made with ❤️ by the Mockingbird Team</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;