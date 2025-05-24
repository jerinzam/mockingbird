// app/dashboard/page.tsx
'use client';

import { useSession } from '@/app/providers';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MockingbirdHeader } from '@/components/mockingBirdHeader';
import Link from 'next/link';
import { FEATURE_FLAGS } from '@/config/featureFlags';
import { Tooltip } from '@/components/ui/tooltip';
import { useOrgContext } from '@/context/orgContext';

export default function DashboardPage() {
  const { session } = useSession();
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;
  const { isFeatureEnabled } = useOrgContext();

  useEffect(() => {
    if (!session) {
      router.push('/');
    }
  }, [session, router]);

  if (!session) return null;

  const isInterviewCreatorEnabled = isFeatureEnabled(FEATURE_FLAGS.interview_creator.key);
  const interviewCreatorTooltip = isInterviewCreatorEnabled 
    ? 'Create a new interview template'
    : FEATURE_FLAGS.interview_creator.disabledMessage;

  return (
    <div className="min-h-screen bg-gray-50">
      <MockingbirdHeader />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* My Interviews Card */}
          <Link 
            href={`/dashboard/organizations/${orgId}/entities`}
            className="bg-white p-6 rounded-lg border-2 border-black shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all"
          >
            <h2 className="text-xl font-bold mb-2">My Interviews</h2>
            <p className="text-gray-600 text-sm">Manage your created interviews</p>
          </Link>

          {/* Create Interview Card */}
          <Tooltip content={interviewCreatorTooltip}>
            <div className={`
              bg-white p-6 rounded-lg border-2 border-black 
              ${isInterviewCreatorEnabled 
                ? 'shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all cursor-pointer' 
                : 'shadow-[2px_2px_0_#000] opacity-50 cursor-not-allowed'
              }
            `}>
              {isInterviewCreatorEnabled ? (
                <Link href={`/dashboard/organizations/${orgId}/entities/create`}>
                  <h2 className="text-xl font-bold mb-2">Create Interview</h2>
                  <p className="text-gray-600 text-sm">Create a new interview template</p>
                </Link>
              ) : (
                <div>
                  <h2 className="text-xl font-bold mb-2">Create Interview</h2>
                  <p className="text-gray-600 text-sm">Create a new interview template</p>
                </div>
              )}
            </div>
          </Tooltip>

          {/* Analytics Card (placeholder for future feature) */}
          <div className="bg-white p-6 rounded-lg border-2 border-black shadow-[4px_4px_0_#000]">
            <h2 className="text-xl font-bold mb-2">Analytics</h2>
            <p className="text-gray-600 text-sm">Coming soon</p>
          </div>
        </div>
      </main>
    </div>
  );
}