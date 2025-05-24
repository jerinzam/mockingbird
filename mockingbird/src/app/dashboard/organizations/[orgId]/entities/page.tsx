// src/app/dashboard/entities/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MockingbirdHeader } from '@/components/mockingBirdHeader';
import { Entity } from '@/db/schema';
import { useOrgContext } from '@/context/orgContext';
import { FEATURE_FLAGS } from '@/config/featureFlags';
import { Tooltip } from '@/components/ui/tooltip'; // You'll need to create this component

type EntityWithDetails = Entity & {
  interview?: any;
  training?: any;
};

export default function EntitiesPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;
  const [entities, setEntities] = useState<EntityWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'interview' | 'training'>('all');
  const { isFeatureEnabled } = useOrgContext();

  useEffect(() => {
    fetchEntities();
  }, [selectedType]);

  const fetchEntities = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (selectedType !== 'all') {
        queryParams.set('type', selectedType);
      }
      
      const response = await fetch(`/api/dashboard/org/${orgId}/entities?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setEntities(data.data);
      }
    } catch (error) {
      console.error('Error fetching entities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    if (!isFeatureEnabled(FEATURE_FLAGS.interview_creator.key)) {
      return; // Don't navigate if feature is disabled
    }
    router.push('/dashboard/entities/create');
  };

  const isCreateButtonDisabled = !isFeatureEnabled(FEATURE_FLAGS.interview_creator.key);
  const createButtonTooltip = isCreateButtonDisabled 
    ? FEATURE_FLAGS.interview_creator.disabledMessage 
    : 'Create a new entity';

  return (
    <div className="min-h-screen bg-gray-50">
      <MockingbirdHeader />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Entities</h1>
            <Tooltip content={createButtonTooltip}>
              <button
                onClick={handleCreateClick}
                disabled={isCreateButtonDisabled}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white 
                  ${isCreateButtonDisabled 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                Create New
              </button>
            </Tooltip>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2 rounded-md ${
                  selectedType === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedType('interview')}
                className={`px-4 py-2 rounded-md ${
                  selectedType === 'interview'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Interviews
              </button>
              <button
                onClick={() => setSelectedType('training')}
                className={`px-4 py-2 rounded-md ${
                  selectedType === 'training'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Trainings
              </button>
            </div>
          </div>

          {/* Entity List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : entities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No entities found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {entities.map((entity) => (
                <div
                  key={entity.id}
                  onClick={() => router.push(`/dashboard/organizations/${orgId}/entities/${entity.id}`)}
                  className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
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
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {entity.title}
                    </h3>
                    
                    <p className="text-sm text-gray-500 mb-4">
                      {entity.description}
                    </p>

                    {entity.type === 'interview' && entity.interview && (
                      <div className="text-sm text-gray-500">
                        <p>Domain: {entity.interview.domain}</p>
                        <p>Seniority: {entity.interview.seniority}</p>
                      </div>
                    )}

                    {entity.type === 'training' && entity.training && (
                      <div className="text-sm text-gray-500">
                        <p>Category: {entity.training.category}</p>
                        <p>Difficulty: {entity.training.difficulty_level}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}