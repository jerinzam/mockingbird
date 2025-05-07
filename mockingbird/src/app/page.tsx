'use client';
import { NextPage } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

const HomePage: NextPage = () => {
  const [code, setCode] = useState(['', '', '', '', '', '', '', '']);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus next input
      if (value !== '' && index < 7) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        if (nextInput) nextInput.focus();
      }

      // Auto-submit when all digits are filled
      if (value !== '' && index === 7) {
        const isComplete = newCode.every(digit => digit !== '');
        if (isComplete) {
          // Auto-submit the form when all digits are complete
          document.getElementById('interview-form')?.dispatchEvent(
            new Event('submit', { cancelable: true, bubbles: true })
          );
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const interviewCode = code.join('');
    console.log('Submitting interview code:', interviewCode);
    // Here you would redirect to the interview session
    // window.location.href = `/interview/${interviewCode}`;
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
    });
    if (error) {
      console.error('Google login error:', error.message);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 bg-[#f2f2f2] text-[#222222] font-mono">
      {/* Left Section - 8/12 of the space */}
      <div className="md:col-span-8 flex items-center justify-center p-6 border-r-4 border-black bg-yellow-50">
        <div className="w-full max-w-xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-center">🐦 Mockingbird</h1>
          <p className="text-xl md:text-2xl mb-6 text-center">AI-powered Interview Practice</p>
          
          <div className="w-16 h-1 bg-black mx-auto mb-6"></div>
          
          <p className="text-base md:text-lg mb-8 text-center">
            Practice, get feedback, and improve your interview skills with our AI-powered mock interview platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/interview"
              className="inline-block px-6 py-3 text-lg font-bold bg-yellow-300 border-4 border-black rounded-md 
                shadow-[6px_6px_0_#000] 
                hover:translate-x-[3px] hover:translate-y-[3px] 
                hover:shadow-[3px_3px_0_#000] 
                transition-all duration-200"
            >
              Start Practice
            </Link>
            <Link
              href="/about"
              className="inline-block px-6 py-3 text-lg font-bold bg-white border-4 border-black rounded-md 
                shadow-[6px_6px_0_#000] 
                hover:translate-x-[3px] hover:translate-y-[3px] 
                hover:shadow-[3px_3px_0_#000] 
                transition-all duration-200"
            >
              How It Works
            </Link>
          </div>
          
          <footer className="mt-8 text-sm text-gray-600 text-center">
            <p className="mb-1">Made with ❤️ by the Mockingbird Team</p>
            <p>© {new Date().getFullYear()} Mockingbird AI</p>
          </footer>
        </div>
      </div>
      
      {/* Right Panel - 4/12 of the space */}
      <div className="md:col-span-4 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm bg-yellow-50 border-4 border-black p-6 rounded-lg shadow-[8px_8px_0_#000]">
          <div className="w-12 h-1 bg-black mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-6 text-center">Get Started</h2>
          
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-yellow-300 text-black py-3 px-4 rounded-md border-4 border-black shadow-[4px_4px_0_#000] 
              hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000]
              transition-all duration-200 mb-6 text-md font-bold flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#000000" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#000000" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#000000" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#000000" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Login with Google
          </button>
          
          <div className="flex items-center my-4">
            <div className="flex-grow border-t-2 border-dashed border-gray-600"></div>
            <span className="px-4 text-gray-700 text-sm font-bold">OR</span>
            <div className="flex-grow border-t-2 border-dashed border-gray-600"></div>
          </div>
          
          <form id="interview-form" className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center">
              <label className="font-bold text-sm">Enter Interview Code:</label>
              <div className="relative ml-2">
                <button 
                  type="button"
                  className="text-gray-700 hover:text-black"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  aria-label="Interview code information"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </button>
                {showTooltip && (
                  <div className="absolute z-10 bg-black text-white text-xs rounded py-1 px-2 w-48 -left-20 bottom-6 shadow-lg">
                    Enter your 8-digit code to access your specific interview session that {`you've`} been invited to.
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between gap-1">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-7 h-10 text-center border-b-4 border-black bg-transparent 
                    focus:outline-none focus:border-yellow-500 text-lg font-bold"
                />
              ))}
            </div>
            {/* Start button removed as requested */}
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/help" className="text-xs text-gray-600 hover:text-gray-800">
              Need help?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
