// app/about/page.tsx
import Link from 'next/link';
import { MockingbirdHeader } from '../components/mockingBirdHeader';

export const metadata = {
  title: 'About Mockingbird | AI Interview Practice',
  description: 'Learn about Mockingbird, the AI-powered mock interview platform that helps you prepare for job interviews.',
};

const birdIcons = {
  // Basic facing right
  faceRight: () => <span className="text-6xl">🐦</span>,
  
  // Facing left
  faceLeft: () => <span className="text-6xl">🕊️</span>,
  
  // Facing up
  faceUp: () => <span className="text-6xl">🪶</span>,
  
  // Facing down
  faceDown: () => <span className="text-6xl">🦜</span>,
  
  // Stylized versions
  happy: () => <span className="text-6xl">🐧</span>,
  sad: () => <span className="text-6xl">🦩</span>,
  flying: () => <span className="text-6xl">🦢</span>,
  sitting: () => <span className="text-6xl">🦉</span>,
  
  // Pixel-style approximations
  pixelRight: () => <span className="text-6xl">🐤</span>,
  pixelLeft: () => <span className="text-6xl">🐥</span>,
  
  // Colorful variations
  colorful1: () => <span className="text-6xl">🦚</span>,
  colorful2: () => <span className="text-6xl">🦜</span>
};

export default function AboutPage() {
  return (
    <div className="h-screen overflow-hidden bg-[#f4f4f4] text-[#222222] font-mono flex flex-col">
      {/* Header */}
      <MockingbirdHeader />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex justify-center items-center p-4">
        <div className="max-w-4xl w-full">
          {/* About Card */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-6 mb-6">
            <h1 className="text-2xl font-bold text-black mb-3 text-center">About Mockingbird</h1>
            <p className="text-[#222222] text-sm mb-3 text-center">
              Mockingbird was founded in 2024 with a simple mission: make interview preparation 
              accessible to everyone. We saw that many candidates struggle with interviews not 
              because they lack skills, but because they {`don't`} have enough practice.
            </p>
            <p className="text-[#222222] text-sm text-center">
              Our AI-powered platform simulates realistic interview experiences, providing 
              candidates with the opportunity to practice answering common questions and 
              receive immediate feedback.
            </p>
          </div>

          {/* Team Section */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-6">
            <h2 className="text-xl font-bold text-black mb-4 text-center">Meet Our Team</h2>
            
            <div className="grid grid-cols-3 gap-6">
              {/* CEO */}
              <div className="text-center">
                <div className="w-28 h-28 mx-auto mb-2 flex items-center justify-center">
                  {birdIcons.colorful1()}
                </div>
                <h3 className="text-base font-bold text-black">Peacock</h3>
                <p className="text-xs font-bold text-blue-600 mb-1">CEO & Founder</p>
              </div>

              {/* CTO */}
              <div className="text-center">
                <div className="w-28 h-28 mx-auto mb-2 flex items-center justify-center">
                  {birdIcons.sitting()}
                </div>
                <h3 className="text-base font-bold text-black">Owl</h3>
                <p className="text-xs font-bold text-yellow-600 mb-1">CTO</p>
              </div>

              {/* Head of Product */}
              <div className="text-center">
                <div className="w-28 h-28 mx-auto mb-2 flex items-center justify-center">
                  {birdIcons.flying()}
                </div>
                <h3 className="text-base font-bold text-black">Swan</h3>
                <p className="text-xs font-bold text-red-600 mb-1">Head of Product</p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-6 pt-4 border-t-2 border-gray-200 text-center">
              <Link href="/interview" className="inline-block bg-yellow-300 border-2 border-black px-6 py-2 shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000] transition-all text-sm font-bold">
                Try a Mock Interview
              </Link>
              <p className="text-xs text-[#444444] mt-3">© 2025 Mockingbird. All rights reserved.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}