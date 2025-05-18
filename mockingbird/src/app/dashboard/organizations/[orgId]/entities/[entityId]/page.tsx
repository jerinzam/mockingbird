'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
// import { InterviewSummary } from '@/components/interview/InterviewSummary';
import { MockingbirdHeader } from '@/components/mockingBirdHeader';
import { InviteManager } from '@/components/interview/InviteManager';
// import { InterviewSessionHistory } from '@/components/interview/InterviewSessionHistory';
import SessionDetailsPanel from '@/components/interview/SessionDetailsPanel';
import { EntitySessionHistory } from '@/components/entity/entitySessionHistory';
import { EntitySummary } from '@/components/entity/entitySummary';
import { EntityInviteManager } from '@/components/entity/entityInviteManager';

export const entityTypes = ['interview', 'training'] as const;
export const entityStatus = ['draft', 'published', 'licensed', 'invite-only'] as const;
export const entityVisibility = ['private', 'public', 'licensed'] as const;

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
    domain: string; // From domains enum
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
  };

  type EntityWithDetails = BaseEntity & {
    interview?: InterviewEntity;
    training?: TrainingEntity;
  };

export default function InterviewDashboardPage() {
  const { orgId, entityId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [entity, setEntity] = useState<EntityWithDetails | null>(null);
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
    const fetchEntity = async () => {
      try {
        const res = await fetch(`/api/dashboard/org/${orgId}/entities/${entityId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch entity');
        const data = await res.json();
        
        setEntity(data.data);
      } catch (err) {
        console.error('Failed to load entity:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntity();
  }, [entityId]);

  const handleTabChange = (nextTab: typeof tab) => {
    setTab(nextTab);
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('tab', nextTab);
    router.replace(`?${current.toString()}`);
  };

  const renderTabContent = () => {
    if (!entity) return null;
    const interview = entity.interview;
    const training = entity.training;
    switch (tab) {
      case 'details':
        return <EntitySummary entity={entity} />;
      case 'invites':
        return <EntityInviteManager entityId={entity.id} orgId={orgId?.toString() || ''} />;
      case 'sessions':
        return (
          <>
            <EntitySessionHistory
              entityId={entity.id}
              orgId={orgId?.toString() || ''}
              onSessionClick={session => setSelectedSession({ id: session.id.toString(), title: 'Session' })}
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

  if (!entity) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-red-600 font-mono">
        Entity not found or failed to load.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#222222] font-mono">
      <MockingbirdHeader />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{entity.title}</h1>
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
