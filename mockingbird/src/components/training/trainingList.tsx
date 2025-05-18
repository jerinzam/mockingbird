'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export interface Training {
  entities: {
    id: number;
    organization_id: number;
    type: string;
    title: string;
    description: string;
    status: string;
    visibility: string;
    created_at: string;
    created_by: string;
  };
  training_entities: {
    id: number;
    entity_id: number;
    category: string;
    difficulty_level: string;
    prerequisites: string;
    learning_objectives: string;
    estimated_completion_time: string;
  };
}

interface TrainingListProps {
    orgSlug: string;
}

export function TrainingList({ orgSlug }: TrainingListProps) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrainings() {
      try {
        const res = await fetch(`/api/organizations/${orgSlug}/trainings`);
        if (!res.ok) throw new Error('Failed to fetch trainings');
        const { data } = await res.json();
        console.log('Training data:', data);
        setTrainings(data);
      } catch (err) {
        setError('Failed to load trainings');
      } finally {
        setLoading(false);
      }
    }
    fetchTrainings();
  }, [orgSlug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 bg-white border-2 border-black rounded-lg">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] rounded-lg overflow-hidden">
      {trainings.length > 0 ? (
        <table className="w-full text-left">
          <thead className="bg-[#e0e0e0] border-b-2 border-black">
            <tr>
              <th className="px-3 py-2 text-xs font-bold">ID</th>
              <th className="px-3 py-2 text-xs font-bold">Title</th>
              <th className="px-3 py-2 text-xs font-bold">Category</th>
              <th className="px-3 py-2 text-xs font-bold">Difficulty</th>
              <th className="px-3 py-2 text-xs font-bold">Status</th>
              <th className="px-3 py-2 text-xs font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
          {trainings.map((training) => (
  <tr key={training.entities.id} className="border-t border-black hover:bg-gray-50 transition-colors">
    <td className="px-3 py-2 text-xs text-gray-600">{training.entities.id}</td>
    <td className="px-3 py-2 text-xs font-medium">{training.entities.title}</td>
    <td className="px-3 py-2 text-xs text-gray-700">{training.training_entities.category}</td>
    <td className="px-3 py-2 text-xs">{training.training_entities.difficulty_level}</td>
    <td className="px-3 py-2 text-xs">{training.entities.status}</td>
    <td className="px-3 py-2 text-xs">
      <Link
        href={`./trainings/${training.entities.id}`}
        className="inline-block bg-blue-500 text-white px-2.5 py-1 rounded text-[10px] font-bold hover:bg-blue-600 transition-colors"
      >
        View
      </Link>
    </td>
  </tr>
))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-8 bg-gray-50">
          <p className="text-gray-600 text-sm mb-3">No trainings found</p>
          <Link
            href="./trainings/create"
            className="inline-block bg-yellow-300 border-2 border-black px-3 py-1.5 rounded shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-transform text-xs"
          >
            Create Your First Training
          </Link>
        </div>
      )}
    </div>
  );
}