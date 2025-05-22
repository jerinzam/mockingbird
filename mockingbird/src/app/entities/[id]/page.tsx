'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MockingbirdHeader } from '@/components/mockingBirdHeader';
import { useSession } from '@/app/providers';
import { EntitySummary } from '@/components/entity/entitySummary';

export type BaseEntity = {  
    id: number;
    organization_id: string;
    type: 'interview' | 'training';
    title: string;
    description?: string;
    slug?: string;
    status: 'draft' | 'published' | 'licensed' | 'invite-only';
    visibility: 'private' | 'public' | 'licensed';
    vapi_agent_id: number;
    created_at: Date;
    created_by: string;
};

export type InterviewEntity = {
    id: number;
    entity_id: number;
    domain: string;
    seniority: 'Junior' | 'Mid-Level' | 'Senior' | 'Lead' | 'Executive';
    key_skills?: string;
    duration?: string;
};

export type TrainingEntity = {
    id: number;
    entity_id: number;
    category: string;
    difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    prerequisites?: string;
    learning_objectives?: string;
    estimated_completion_time?: string;
    duration?: string;
};

type EntityWithDetails = BaseEntity & {
    interview?: InterviewEntity;
    training?: TrainingEntity;
};

interface EntitySession {
    id: string;
    created_at: string;
    call_ended_reason: string | null;
    entity_id: number;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EntityDetailPage({ params }: PageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [entity, setEntity] = useState<EntityWithDetails | null>(null);
    const [entitySessions, setEntitySessions] = useState<EntitySession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showInvitePopup, setShowInvitePopup] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [hasValidToken, setHasValidToken] = useState(false);

    const session = useSession();
    const user = session.session?.user;
    const token = searchParams.get('token');
    const isLocked = entity?.visibility === 'private' && !hasValidToken;

    useEffect(() => {
        const fetchEntity = async () => {
            const { id: entityId } = await params;
            try {
                const response = await fetch(`/api/entities/${entityId}?token=${token || ''}`);

                if (!response.ok) throw new Error('Failed to fetch entity');

                const data = await response.json();
                setEntity(data.data);
                setHasValidToken(data.hasValidToken);

                if (user && data.owner === user.id) {
                    const sessionsResponse = await fetch(`/api/entities/${entityId}/sessions`, {
                        method: 'GET',
                        credentials: 'include',
                    });
                    const sessionsData = await sessionsResponse.json();
                    setEntitySessions(sessionsData);
                }
            } catch (error) {
                console.error('Failed to fetch entity:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntity();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params, searchParams]);

    const handleStartSession = async () => {
      const { id: entityId } = await params;
      const currentToken = token || inviteCode;
  
      if (entity?.visibility === 'private' && !hasValidToken) {
          setShowInvitePopup(true);
          return;
      }
  
      try {
          const res = await fetch(`/api/entities/${entityId}/sessions/start`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ entityId, token: currentToken })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          
          // Add token to session URL if it exists
          const sessionUrl = `/entities/${entityId}/session/${data.data.sessionId}`;
          const urlWithToken = currentToken ? `${sessionUrl}?token=${currentToken}` : sessionUrl;
          
          router.push(urlWithToken);
      } catch (err) {
          console.error(err);
          alert('Failed to start session.');
      }
  };
  
  const handleInviteSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setShowInvitePopup(false);
  
      // Verify the new invite code
      const { id: entityId } = await params;
      try {
          const response = await fetch(`/api/entities/${entityId}?token=${inviteCode}`);
          const data = await response.json();
          if (data.hasValidToken) {
              setHasValidToken(true);
              // Now start the session with the valid invite code
              handleStartSession();
          } else {
              alert('Invalid invite code');
          }
      } catch (error) {
          console.error('Failed to verify invite code:', error);
          alert('Failed to verify invite code');
      }
  };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4] text-[#222222] font-mono">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                    <p className="mt-3 text-gray-600 text-xs">Loading entity data...</p>
                </div>
            </div>
        );
    }

    if (!entity) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f4f4] text-[#222222] font-mono">
                <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-6 text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Entity Not Found</h1>
                    <p className="text-gray-600 text-xs mb-4">The entity you're looking for doesn't exist or has been removed.</p>
                    <Link href="/entities" className="inline-block bg-yellow-300 border-2 border-black px-3 py-1.5 rounded-md shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all text-xs">
                        Back to Entities
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
                        <EntitySummary entity={entity} />
                        
                        {entity.created_by === user?.id && entitySessions.length > 0 && (
                            <div className="mt-10">
                                <h3 className="text-lg font-bold mb-2">Previous Sessions</h3>
                                <ul className="space-y-2 text-xs">
                                    {entitySessions.map((session) => (
                                        <li key={session.id} className="border border-gray-300 rounded p-2 bg-white shadow-[2px_2px_0_#000]">
                                            <p><strong>Date:</strong> {new Date(session.created_at).toLocaleString()}</p>
                                            <p><strong>Call Ended:</strong> {session.call_ended_reason ?? 'Unknown'}</p>
                                            <Link href={`/entities/${entity.id}/session/${session.id}/review`} className="underline text-blue-600">
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
                                    {entity.type === 'interview' ? (
                                        <>
                                            This interview will last approximately {entity.interview?.duration}. 
                                            You'll be asked questions about {entity.interview?.domain} topics appropriate for a {entity.interview?.seniority} position.
                                        </>
                                    ) : (
                                        <>
                                            This training will last approximately {entity.training?.duration}. 
                                            You'll learn about {entity.training?.category} topics at {entity.training?.difficulty_level} level.
                                        </>
                                    )}
                                </p>
                                <button
                                    onClick={handleStartSession}
                                    className="w-full py-3 px-4 bg-yellow-300 border-2 border-black rounded-md shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all text-xs flex items-center justify-center gap-2"
                                >
                                    {isLocked ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            {entity.type === 'interview' ? 'Start Interview (Locked)' : 'Start Training (Locked)'}
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                            </svg>
                                            {entity.type === 'interview' ? 'Start Interview' : 'Start Training'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invite Code Popup */}
            {showInvitePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Enter Invite Code</h3>
                        <form onSubmit={handleInviteSubmit}>
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="Enter your invite code"
                                className="w-full p-2 border-2 border-black rounded mb-4 text-sm"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2 px-4 bg-yellow-300 border-2 border-black rounded-md shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all text-xs"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowInvitePopup(false)}
                                    className="flex-1 py-2 px-4 bg-gray-200 border-2 border-black rounded-md shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all text-xs"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}