// app/interviews/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { MockingbirdHeader } from '@/components/mockingBirdHeader';
import { InterviewList } from '@/components/interview/InterviewList';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await fetch('/api/interview?scope=public');
        if (!response.ok) throw new Error('Failed to fetch interviews');
        const data = await response.json();
        setInterviews(data);
      } catch (error) {
        console.error('Error fetching interviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <MockingbirdHeader />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Interviews</h1>
          <p className="text-gray-600 text-sm mt-1">Browse available interview templates</p>
        </div>

        <InterviewList 
          scope="public"
        />
      </main>
    </div>
  );
}