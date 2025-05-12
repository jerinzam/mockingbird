'use client'
import { TrainingList } from '@/components/training/trainingList';
import { use } from 'react';

export default function OrgTrainingsPage({ params }: { params: Promise<{ org: string }> }) {
  // If you need to resolve org slug to orgId, do so here (e.g., via API call or context)
  const {org} = use(params); // Adjust if you need to fetch the actual orgId

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#222222] font-mono">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Trainings</h1>
        <p className="text-gray-600 text-xs mb-6">Manage your training modules</p>
        <TrainingList orgSlug={org} />
      </div>
    </div>
  );
}