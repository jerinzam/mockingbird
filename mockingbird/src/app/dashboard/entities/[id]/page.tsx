// src/app/dashboard/entities/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MockingbirdHeader } from '@/components/mockingBirdHeader';
import { Entity } from '@/db/schema';
import { use } from 'react';

type EntityWithDetails = Entity & {
  interview?: any;
  training?: any;
};

// Helper function to safely format arrays
const formatArray = (arr: any[] | null | undefined) => {
  if (!arr || !Array.isArray(arr)) return 'None';
  return arr.length > 0 ? arr.join(', ') : 'None';
};

export default function EntityDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [entity, setEntity] = useState<EntityWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Unwrap params using React.use()
  const { id } = use(params);

  useEffect(() => {
    fetchEntity();
  }, [id]);

  const fetchEntity = async () => {
    try {
      const response = await fetch(`/api/entities/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setEntity(data.data);
      } else {
        setError(data.error || 'Failed to fetch entity');
      }
    } catch (error) {
      setError('An error occurred while fetching the entity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'draft' | 'published') => {
    try {
      const response = await fetch(`/api/entities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      if (data.success) {
        setEntity(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MockingbirdHeader />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MockingbirdHeader />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-500">{error || 'Entity not found'}</p>
            <button
              onClick={() => router.push('/dashboard/entities')}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Back to Entities
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MockingbirdHeader />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <button
                onClick={() => router.push('/dashboard/entities')}
                className="text-blue-600 hover:text-blue-800 mb-4"
              >
                ← Back to Entities
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{entity.title}</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => handleStatusChange(entity.status === 'draft' ? 'published' : 'draft')}
                className={`px-4 py-2 rounded-md ${
                  entity.status === 'published'
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {entity.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
              <button
                onClick={() => router.push(`/dashboard/entities/${id}/edit`)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              {/* Status and Type Badges */}
              <div className="flex space-x-4 mb-6">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  entity.type === 'interview' 
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {entity.type}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  entity.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {entity.status}
                </span>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600">{entity.description || 'No description provided'}</p>
              </div>

              {/* Type-specific Details */}
              {entity.type === 'interview' && entity.interview && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Interview Details</h2>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Domain</dt>
                        <dd className="mt-1 text-sm text-gray-900">{entity.interview.domain || 'Not specified'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Seniority Level</dt>
                        <dd className="mt-1 text-sm text-gray-900">{entity.interview.seniority || 'Not specified'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Duration</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {entity.interview.duration ? `${entity.interview.duration} minutes` : 'Not specified'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Key Skills</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatArray(entity.interview.key_skills)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {entity.type === 'training' && entity.training && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Training Details</h2>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Category</dt>
                        <dd className="mt-1 text-sm text-gray-900">{entity.training.category || 'Not specified'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Difficulty Level</dt>
                        <dd className="mt-1 text-sm text-gray-900">{entity.training.difficulty_level || 'Not specified'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Prerequisites</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatArray(entity.training.prerequisites)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Learning Objectives</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatArray(entity.training.learning_objectives)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Estimated Completion Time</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {entity.training.estimated_completion_time 
                            ? `${entity.training.estimated_completion_time} hours` 
                            : 'Not specified'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}