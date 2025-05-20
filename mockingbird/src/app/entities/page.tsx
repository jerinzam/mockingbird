'use client';

import { MockingbirdHeader } from '@/components/mockingBirdHeader';
import { EntityList } from '@/components/entity/entityList';

export default function EntitiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MockingbirdHeader />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Entities</h1>
          <p className="text-gray-600 text-sm mt-1">Browse available interview and training templates</p>
        </div>

        <EntityList 
          scope="public"
        />
      </main>
    </div>
  );
}