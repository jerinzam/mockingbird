'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Entity } from '@/db/schema';

type EntityWithDetails = Entity & {
  interview?: any;
  training?: any;
};

interface EntityListProps {
  scope?: 'public' | 'user';
  actionButtons?: (entity: EntityWithDetails) => React.ReactNode;
}

export function EntityList({ scope = 'public' }: EntityListProps) {
  const [entities, setEntities] = useState<EntityWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchEntities() {
      try {
        const res = await fetch(`/api/entities/list?visibility=public`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch entities');
        const data = await res.json();
        if (data.success) {
          setEntities(data.data);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load entities');
      } finally {
        setLoading(false);
      }
    }
    fetchEntities();
  }, []);

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
      <table className="w-full text-left">
        <thead className="bg-[#e0e0e0] border-b-2 border-black">
          <tr>
            <th className="px-3 py-2 text-xs font-bold">ID</th>
            <th className="px-3 py-2 text-xs font-bold">Domain</th>
            <th className="px-3 py-2 text-xs font-bold">Seniority</th>
            <th className="px-3 py-2 text-xs font-bold">Skills</th>
            <th className="px-3 py-2 text-xs font-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entities.map((entity) => (
            <tr 
              key={entity.id} 
              className="border-t border-black hover:bg-gray-50 transition-colors"
            >
              <td className="px-3 py-2 text-xs">{entity.id}</td>
              <td className="px-3 py-2 text-xs">
                {entity.type === 'interview' && entity.interview?.domain}
                {entity.type === 'training' && entity.training?.category}
              </td>
              <td className="px-3 py-2 text-xs">
                {entity.type === 'interview' && entity.interview?.seniority}
                {entity.type === 'training' && entity.training?.difficulty_level}
              </td>
              <td className="px-3 py-2 text-xs">
                {entity.type === 'interview' && entity.interview?.skills?.join(', ')}
                {entity.type === 'training' && entity.training?.skills?.join(', ')}
              </td>
              <td className="px-3 py-2 text-xs">
                <div className="flex justify-center">
                    {scope === 'user' ? (
                    <Link
                        href={`/dashboard/entities/${entity.id}`}
                        className="inline-flex items-center justify-center bg-green-500 text-white px-3 py-1 rounded text-[10px] font-bold 
                        hover:bg-green-600 transition-colors min-w-[60px]"
                    >
                        Manage
                    </Link>
                    ) : (
                    <Link
                        href={`/entities/${entity.id}`}
                        className="inline-flex items-center justify-center bg-green-500 text-white px-3 py-1 rounded text-[10px] font-bold 
                        hover:bg-green-600 transition-colors min-w-[60px]"
                    >
                        View
                    </Link>
                    )}
                </div>
            </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {entities.length === 0 && (
        <div className="text-center py-8 bg-gray-50">
          <p className="text-gray-600 text-sm mb-3">No entities found</p>
          <Link
            href="/dashboard/entities/create"
            className="inline-block bg-yellow-300 border-2 border-black px-3 py-1.5 rounded 
              shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-transform text-xs"
          >
            Create Your First Entity
          </Link>
        </div>
      )}
    </div>
  );
}