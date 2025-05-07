// File: app/interview/[interviewId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MockingbirdHeader } from '../../components/mockingBirdHeader';
import { useSession } from '@/app/providers';

interface Interview {
  id: number;
  title: string;
  description: string | null;
  domain: string;
  seniority: string;
  duration: string | null;
  key_skills: string | null;
  created_at: string;
  is_public?: boolean;
  owner: string
}

interface InterviewSession {
  id: string;
  created_at: string;
  call_ended_reason: string | null;
  interview_role_id: number;
}


interface PageProps {
  params: Promise<{ interviewId: string }>;
}

export default function InterviewDetailPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [interviewSessions, setInterviewSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const session = useSession();
  const user = session?.user;

  useEffect(() => {
    const fetchInterview = async () => {
      const { interviewId } = await params;
      const token = searchParams.get('token');
      try {
        const response = await fetch(`/api/interview/${interviewId}?token=${token || ''}`);

        if (response.status === 403) {
          setAccessDenied(true);
          return;
        }

        if (!response.ok) throw new Error('Failed to fetch interview');

        const data = await response.json();
        setInterview(data);

        // Fetch previous attempts if user is the owner
        if (user && data.owner === user.id) {
          const sessionsResponse = await fetch(`/api/interview/${interviewId}/sessions`,{
            method: 'GET',
            credentials: 'include', // ← MUST be set to include Supabase auth cookies
          });
          const sessionsData = await sessionsResponse.json();
          setInterviewSessions(sessionsData);
          console.log('Previous attempts:', sessionsData);
        }
        console.log(data.owner,user)

      } catch (error) {
        console.error('Failed to fetch interview:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterview();
  }, [params, searchParams]);

  const handleStartInterview = async () => {
    const { interviewId } = await params;
    const token = searchParams.get('token');

    try {
      const res = await fetch('/api/interview/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewId, token })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/interview/${interviewId}/session/${data.sessionId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to start session.');
    }
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4] text-[#222222] font-mono">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-6 text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 text-xs mb-4">
            This interview is private and requires a valid token for access.
          </p>
          <button
            onClick={() => router.push('/interview')}
            className="inline-block bg-yellow-300 border-2 border-black px-4 py-2 rounded-md shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all text-xs"
          >
            Go back to Interviews
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4] text-[#222222] font-mono">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          <p className="mt-3 text-gray-600 text-xs">Loading interview data...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f4f4] text-[#222222] font-mono">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Interview Not Found</h1>
          <p className="text-gray-600 text-xs mb-4">The interview  {`you're`} looking for {`doesn't`} exist or has been removed.</p>
          <Link href="/interview" className="inline-block bg-yellow-300 border-2 border-black px-3 py-1.5 rounded-md shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all text-xs">
            Back to Interviews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#222222] font-mono">
      <MockingbirdHeader />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-3/5">
            <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] rounded-lg overflow-hidden">
              <div className="p-6 border-b-2 border-black">
                <h2 className="text-3xl font-bold tracking-tight mb-2">{interview.title}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-300">{interview.domain}</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded border border-purple-300">{interview.seniority}</span>
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-300">{interview.duration}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2">Description</h3>
                <p className="text-xs mb-4">{interview.description}</p>
                <h3 className="text-lg font-bold mb-2">Key Skills</h3>
                <div className="flex flex-wrap gap-1 mb-6">
                  {interview.key_skills?.split(',').map((skill, index) => (
                    <span key={index} className="bg-gray-200 text-gray-700 text-[9px] px-1.5 py-0.5 rounded">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {interview.owner === user?.id && interviewSessions.length > 0 && (
              <div className="mt-10">
                <h3 className="text-lg font-bold mb-2"> Attempts</h3>
                <ul className="space-y-2 text-xs">
                  {interviewSessions.map((session) => (
                    <li key={session.id} className="border border-gray-300 rounded p-2 bg-white shadow-[2px_2px_0_#000]">
                      <p><strong>Date:</strong> {new Date(session.created_at).toLocaleString()}</p>
                      <p><strong>Call Ended:</strong> {session.call_ended_reason ?? 'Unknown'}</p>
                      <Link href={`/interview/${interview.id}/session/${session.id}/review`} className="underline text-blue-600">
                        View Session
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}



          </div>

          <div className="w-full lg:w-2/5 space-y-6">
            <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4">Ready to Begin?</h3>
                <p className="text-xs mb-6">
                  This interview will last approximately {interview.duration}. {`You'll`} be asked questions about {interview.domain} topics appropriate for a {interview.seniority} position.
                </p>
                <button
                  onClick={handleStartInterview}
                  className="w-full py-3 px-4 bg-yellow-300 border-2 border-black rounded-md shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all text-xs"
                >
                  Start Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
