// src/app/dashboard/entities/create/training/page.tsx

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MockingbirdHeader } from '@/components/mockingBirdHeader';

const DIFFICULTY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert'
] as const;

interface TrainingForm {
  title: string;
  description: string;
  category: string;
  difficulty_level: typeof DIFFICULTY_LEVELS[number];
  prerequisites: string;
  learning_objectives: string;
  estimated_completion_time: string;
}

export default function CreateTrainingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TrainingForm>({
    title: '',
    description: '',
    category: '',
    difficulty_level: 'Beginner',
    prerequisites: '',
    learning_objectives: '',
    estimated_completion_time: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/entities/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'training',
          ...formData
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.push('/dashboard/entities');
      }
    } catch (error) {
      console.error('Error creating training:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MockingbirdHeader />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Create New Training
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Difficulty Level */}
              <div>
                <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700">
                  Difficulty Level
                </label>
                <select
                  id="difficulty_level"
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value as typeof DIFFICULTY_LEVELS[number] })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {DIFFICULTY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prerequisites */}
              <div>
                <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-700">
                  Prerequisites
                </label>
                <textarea
                  id="prerequisites"
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Learning Objectives */}
              <div>
                <label htmlFor="learning_objectives" className="block text-sm font-medium text-gray-700">
                  Learning Objectives
                </label>
                <textarea
                  id="learning_objectives"
                  value={formData.learning_objectives}
                  onChange={(e) => setFormData({ ...formData, learning_objectives: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Estimated Completion Time */}
              <div>
                <label htmlFor="estimated_completion_time" className="block text-sm font-medium text-gray-700">
                  Estimated Completion Time
                </label>
                <input
                  type="text"
                  id="estimated_completion_time"
                  value={formData.estimated_completion_time}
                  onChange={(e) => setFormData({ ...formData, estimated_completion_time: e.target.value })}
                  placeholder="e.g., 2 hours"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Training'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}