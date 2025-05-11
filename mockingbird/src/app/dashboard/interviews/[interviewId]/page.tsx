'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { InterviewSummary } from '@/components/interview/InterviewSummary';
import { MockingbirdHeader } from '@/components/mockingBirdHeader';
import { InviteManager } from '@/components/interview/InviteManager';
import { InterviewSessionHistory } from '@/components/interview/InterviewSessionHistory';
import SessionDetailsPanel from '@/components/interview/SessionDetailsPanel';

type Interview = {
  id: number;
  title: string;
  description: string | null;
  domain: string;
  seniority: string;
  duration: string | null;
  key_skills: string | null;
  created_at: string;
};

export default function InterviewDashboardPage() {
  const { interviewId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<'details' | 'invites' | 'sessions'>('details');
  const [selectedSession, setSelectedSession] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    const activeTab = searchParams.get('tab');
    if (activeTab === 'details' || activeTab === 'invites' || activeTab === 'sessions') {
      setTab(activeTab);
    } else {
      setTab('details');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await fetch(`/api/interview/${interviewId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch interview');
        const data = await res.json();
        setInterview(data);
      } catch (err) {
        console.error('Failed to load interview:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId]);

  const handleTabChange = (nextTab: typeof tab) => {
    setTab(nextTab);
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('tab', nextTab);
    router.replace(`?${current.toString()}`);
  };

  const renderTabContent = () => {
    if (!interview) return null;

    switch (tab) {
      case 'details':
        return <InterviewSummary interview={interview} />;
      case 'invites':
        return <InviteManager interviewId={interview.id} />;
      case 'sessions':
        // return <InterviewSessionHistory interviewId={interview.id} />;
        return (
          <>
            <InterviewSessionHistory
              interviewId={interview.id}
              onSessionClick={session => setSelectedSession({ id: session.id, title: 'Session' })}
            />
            <SessionDetailsPanel
              open={!!selectedSession}
              session={selectedSession || undefined}
              onClose={() => setSelectedSession(null)}
            />
          </>
        )
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-gray-600 font-mono">
        Loading interview data...
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-red-600 font-mono">
        Interview not found or failed to load.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#222222] font-mono">
      <MockingbirdHeader />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{interview.title}</h1>
            {/* Optional: Add action buttons here */}
          </div>
          <div className="flex space-x-4 text-xs font-semibold border-b-2 border-black">
            <button
              onClick={() => handleTabChange('details')}
              className={`pb-2 px-2 ${
                tab === 'details' ? 'border-b-2 border-black text-black' : 'text-gray-400'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => handleTabChange('invites')}
              className={`pb-2 px-2 ${
                tab === 'invites' ? 'border-b-2 border-black text-black' : 'text-gray-400'
              }`}
            >
              Invites
            </button>
            <button
              onClick={() => handleTabChange('sessions')}
              className={`pb-2 px-2 ${
                tab === 'sessions' ? 'border-b-2 border-black text-black' : 'text-gray-400'
              }`}
            >
              Sessions
            </button>
          </div>
        </div>

        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
}
