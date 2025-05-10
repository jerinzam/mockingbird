// app/dashboard/interviews/page.tsx
'use client';

import { InterviewList } from '@/components/interview/InterviewList';
import { MockingbirdHeader } from '@/components/mockingBirdHeader';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Interview } from '@/components/interview/InterviewList';

export default function DashboardInterviewsPage() {
  const pathname = usePathname() || '';

  const renderActionButtons = (interview: Interview): ReactNode => (
    <div className="flex flex-col space-y-1.5">
      <Link
        href={`/dashboard/interviews/${interview.id}`}
        className="inline-block bg-green-500 text-white px-2.5 py-1 rounded text-[10px] font-bold 
          hover:bg-green-600 transition-colors"
      >
        Manage
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#222222] font-mono">
      <MockingbirdHeader />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6">
          <Link
            href="/dashboard/interviews"
            className={`px-4 py-2 text-sm font-medium rounded-md border-2 border-black
              ${pathname.startsWith('/dashboard/interviews') && !pathname.includes('/create') && !pathname.includes('/analytics')
                ? 'bg-yellow-300 shadow-[2px_2px_0_#000]' 
                : 'bg-white hover:bg-gray-50 shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000]'
              } transition-all`}
          >
            My Interviews
          </Link>
          <Link
            href="/dashboard/interviews/create"
            className={`px-4 py-2 text-sm font-medium rounded-md border-2 border-black
              ${pathname.includes('/dashboard/interviews/create')
                ? 'bg-yellow-300 shadow-[2px_2px_0_#000]'
                : 'bg-white hover:bg-gray-50 shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000]'
              } transition-all`}
          >
            Create
          </Link>
          <Link
            href="/dashboard/interviews/analytics"
            className={`px-4 py-2 text-sm font-medium rounded-md border-2 border-black
              ${pathname.includes('/dashboard/interviews/analytics')
                ? 'bg-yellow-300 shadow-[2px_2px_0_#000]'
                : 'bg-white hover:bg-gray-50 shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000]'
              } transition-all`}
          >
            Analytics
          </Link>
        </div>

        <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-black">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">My Interviews</h1>
            <p className="text-gray-600 text-xs">Manage your interview templates</p>
          </div>
          <Link
            href="/dashboard/interviews/create"
            className="flex items-center bg-yellow-300 border-2 border-black px-3 py-1.5 rounded-md 
              shadow-[3px_3px_0_#000] 
              hover:translate-x-[2px] hover:translate-y-[2px] 
              hover:shadow-[2px_2px_0_#000] 
              transition-all group text-xs"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1.5 group-hover:rotate-90 transition-transform" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Interview
          </Link>
        </div>

        <InterviewList 
          scope="user" 
          actionButtons={renderActionButtons}
        />
      </div>
    </div>
  );
}