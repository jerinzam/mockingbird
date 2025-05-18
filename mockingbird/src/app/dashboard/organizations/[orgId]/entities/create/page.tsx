// src/app/dashboard/entities/create/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { MockingbirdHeader } from '@/components/mockingBirdHeader';

export default function CreateEntityPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;

  const handleTypeSelect = (type: 'interview' | 'training') => {
    router.push(`/dashboard/organizations/${orgId}/entities/create/${type}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MockingbirdHeader />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Create New Entity
            </h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
              {/* Interview Card */}
              <button
                onClick={() => handleTypeSelect('interview')}
                className="relative block p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">Interview</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Create an AI-powered interview for candidates
                  </p>
                </div>
              </button>

              {/* Training Card */}
              <button
                onClick={() => handleTypeSelect('training')}
                className="relative block p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">Training</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Create an interactive training session
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}