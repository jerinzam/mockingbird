'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface TrainingEntity {
  entities: {
    id: number;
    title: string;
    description: string | null;
    type: string;
    status: string;
    organization_id: number;
    slug: string | null;
    vapi_agent_id: string | null;
    created_at: string;
    created_by: string;
  };
  training_entities: {
    id: number;
    entity_id: number;
    category: string;
    difficulty_level: string;
    prerequisites: string | null;
    learning_objectives: string | null;
    estimated_completion_time: string | null;
  };
}

export default function TrainingPage() {
  const router = useRouter();
  const params = useParams();
  const trainingId = params?.trainingId as string;
  const org = params?.org as string;
  const [training, setTraining] = useState<TrainingEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trainingId || !org) return;
    const fetchTraining = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/organizations/${org}/trainings/${trainingId}`);
        if (!res.ok) throw new Error('Failed to fetch training');
        const { data, success } = await res.json();
        
        if (!success || !data) {
          throw new Error('Failed to fetch training data');
        }
        
        setTraining(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTraining();
  }, [trainingId, org]);
  
  const startTrainingSession = async () => {
    if (!training?.entities.id) return;
    try {
      const res = await fetch(`/api/organizations/${org}/entities/${training.entities.id}/sessions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId: training.entities.id,
          type: 'training'
        })
      });
      const data = await res.json();
      console.log('Data:', data);
      if (!res.ok) throw new Error(data.error);
      router.push(`/entities/${training.entities.id}/sessions/${data.data.sessionId}`);
    } catch (err: any) {
      alert('Failed to start training session.');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading training...</div>
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-600 font-bold mb-2">Training Not Found</div>
        <Link href="/trainings" className="text-blue-600 underline">Back to Trainings</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{training.entities.title}</h1>
      <div className="mb-2 text-gray-700">
        {training.training_entities.category} &bull; {training.training_entities.difficulty_level}
      </div>
      <div className="mb-4">{training.entities.description}</div>
      {training.training_entities.learning_objectives && (
        <div className="mb-4">
          <strong>Learning Objectives:</strong>
          <div>{training.training_entities.learning_objectives}</div>
        </div>
      )}
      {training.training_entities.prerequisites && (
        <div className="mb-4">
          <strong>Prerequisites:</strong>
          <div>{training.training_entities.prerequisites}</div>
        </div>
      )}
      {training.training_entities.estimated_completion_time && (
        <div className="mb-4">
          <strong>Estimated Completion Time:</strong>
          <div>{training.training_entities.estimated_completion_time}</div>
        </div>
      )}
      <button
        onClick={startTrainingSession}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Start Training Session
      </button>
    </div>
  );
}