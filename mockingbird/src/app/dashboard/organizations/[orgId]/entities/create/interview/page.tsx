// src/app/dashboard/organizations/orgid/entities/create/interview/page.tsx

'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MockingbirdHeader } from '@/components/mockingBirdHeader';

const domains = [
  'Web Development',
  'Frontend', 
  'Backend', 
  'Full Stack', 
  'Mobile', 
  'DevOps', 
  'Data Science', 
  'Machine Learning', 
  'Cloud', 
  'Security', 
  'QA',
  'AI/ML',
  'Blockchain',
  'UI/UX'
] as const;

const SENIORITY_LEVELS = [
  'Junior', 
  'Mid-Level', 
  'Senior', 
  'Lead', 
  'Executive'
] as const;

interface InterviewForm {
  title: string;
  description: string;
  domain: typeof domains[number];
  seniority: typeof SENIORITY_LEVELS[number];
  duration: string;
  key_skills: string[];
  isPrivate: boolean; // Added new field
  vapi_agent_id: number;
}

interface VapiAgent {
  id: number;
  name: string;
  vapi_agent_id: string;
  api_key: string;
}
export default function CreateInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agents, setAgents] = useState<VapiAgent[]>([]);
  const [formData, setFormData] = useState<InterviewForm>({
    title: '',
    description: '',
    domain: 'Frontend',
    seniority: 'Mid-Level',
    duration: '',
    key_skills: [],
    isPrivate: false, // Default to public
    vapi_agent_id: 0
  });

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`/api/dashboard/org/${orgId}/vapi-agents`);
        const data = await response.json();
        if (data.success) {
          setAgents(data.agents);
          // If there are agents, set the first one as default
          if (data.agents.length > 0) {
            setFormData(prev => ({ ...prev, vapi_agent_id: data.agents[0].id }));
          }
        }
      } catch (error) {
        console.error('Error fetching VAPI agents:', error);
      }
    };
    fetchAgents();
  }, [orgId]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/dashboard/org/${orgId}/entities/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'interview',
          ...formData,
          key_skills: formData.key_skills.join(','),
          visibility: formData.isPrivate ? 'private' : 'public'
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/dashboard/organizations/${orgId}/entities`);
      }
    } catch (error) {
      console.error('Error creating interview:', error);
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
              Create New Interview
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

              {/* Domain */}
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                  Domain
                </label>
                <select
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value as typeof domains[number] })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {domains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seniority */}
              <div>
                <label htmlFor="seniority" className="block text-sm font-medium text-gray-700">
                  Seniority Level
                </label>
                <select
                  id="seniority"
                  value={formData.seniority}
                  onChange={(e) => setFormData({ ...formData, seniority: e.target.value as typeof SENIORITY_LEVELS[number] })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {SENIORITY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration
                </label>
                <input
                  type="text"
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 45 mins"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Key Skills */}
              <div>
                <label htmlFor="key_skills" className="block text-sm font-medium text-gray-700">
                  Key Skills
                </label>
                <input
                  type="text"
                  id="key_skills"
                  value={formData.key_skills.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    key_skills: e.target.value.split(',').map(skill => skill.trim()) 
                  })}
                  placeholder="e.g., JavaScript, React, TypeScript"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Privacy Toggle */}
              <div className="flex items-center">
                <label htmlFor="isPrivate" className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      checked={formData.isPrivate}
                      onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`block w-14 h-8 rounded-full ${formData.isPrivate ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.isPrivate ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <div className="ml-3 text-gray-700 font-medium">
                    {formData.isPrivate ? 'Private' : 'Public'}
                  </div>
                </label>
              </div>

               {/* VAPI Agent Selection */}
               <div>
                <label htmlFor="vapi_agent_id" className="block text-sm font-medium text-gray-700">
                  VAPI Agent
                </label>
                <select
                  id="vapi_agent_id"
                  value={formData.vapi_agent_id}
                  onChange={(e) => setFormData({ ...formData, vapi_agent_id: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a VAPI Agent</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}