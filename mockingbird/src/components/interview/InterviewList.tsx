// app/components/interviewlist/interviewlist.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export interface Interview {
  id: string;
  title: string;
  description: string;
  domain: string;
  seniority: string;
  duration: string;
  key_skills: string;
}

type SeniorityLevel = 'Senior' | 'Mid-Level' | 'Junior' | 'Lead' | 'Executive' | 'default';

const getStatusColor = (seniority: string) => {
  const statusColors: Record<SeniorityLevel, { bg: string; text: string }> = {
    'Senior': { bg: 'bg-green-50 border-green-200', text: 'text-green-800 border-green-300' },
    'Mid-Level': { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800 border-blue-300' },
    'Junior': { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800 border-yellow-300' },
    'Lead': { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800 border-purple-300' },
    'Executive': { bg: 'bg-red-50 border-red-200', text: 'text-red-800 border-red-300' },
    'default': { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-800 border-gray-300' }
  };
  
  return statusColors[seniority as SeniorityLevel] || statusColors['default'];
};

interface InterviewListProps {
  scope?: 'public' | 'user';
  actionButtons?: (interview: Interview) => React.ReactNode;
}

export function InterviewList({ scope = 'public' }: InterviewListProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchInterviews() {
      try {
        const res = await fetch(`/api/interview?scope=${scope}`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch interviews');
        const data = await res.json();
        console.log("Interviews fetched", data.length);
        setInterviews(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load interviews');
      } finally {
        setLoading(false);
      }
    }
    fetchInterviews();
  }, [scope]);

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
            <th className="px-3 py-2 text-xs font-bold">Title</th>
            <th className="px-3 py-2 text-xs font-bold">Domain</th>
            <th className="px-3 py-2 text-xs font-bold">Seniority</th>
            <th className="px-3 py-2 text-xs font-bold">Skills</th>
            <th className="px-3 py-2 text-xs font-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {interviews.map((interview) => {
            const statusColor = getStatusColor(interview.seniority);
            return (
              <tr 
                key={interview.id} 
                className="border-t border-black hover:bg-gray-50 transition-colors"
              >
                <td className="px-3 py-2 text-xs text-gray-600">{interview.id}</td>
                <td className="px-3 py-2 text-xs font-medium">{interview.title}</td>
                <td className="px-3 py-2 text-xs text-gray-700">{interview.domain}</td>
                <td className="px-3 py-2 text-xs">
                  <span 
                    className={`
                      px-1.5 py-0.5 rounded-md border 
                      ${statusColor.bg} ${statusColor.text} 
                      text-[10px] font-semibold
                    `}
                  >
                    {interview.seniority}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {interview.key_skills?.split(',').map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 text-gray-700 text-[9px] px-1.5 py-0.5 rounded"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 text-xs">
                  <div className="flex flex-col space-y-1.5">
                    {scope === 'user' ? (
                      <Link
                        href={`/dashboard/interviews/${interview.id}`}
                        className="inline-block bg-green-500 text-white px-2.5 py-1 rounded text-[10px] font-bold 
                          hover:bg-green-600 transition-colors"
                      >
                        Manage
                      </Link>
                    ) : (
                      <Link
                        href={`/interview/${interview.id}`}
                        className="inline-block bg-green-500 text-white px-2.5 py-1 rounded text-[10px] font-bold 
                          hover:bg-green-600 transition-colors"
                      >
                        Start Practice
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {interviews.length === 0 && (
        <div className="text-center py-8 bg-gray-50">
          <p className="text-gray-600 text-sm mb-3">No interviews found</p>
          <Link
            href="/interview/create"
            className="inline-block bg-yellow-300 border-2 border-black px-3 py-1.5 rounded 
              shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-transform text-xs"
          >
            Create Your First Interview
          </Link>
        </div>
      )}
    </div>
  );
}