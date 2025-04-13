// app/interview/page.tsx
import Link from 'next/link';
import { getInterviews } from '../../index';
import { MockingbirdHeader } from '../components/mockingBirdHeader';

export const metadata = {
  title: 'Interview List | Mockingbird',
  description: 'Manage your AI-powered interviews with Mockingbird',
};

export default async function InterviewListPage() {
  const interviews = await getInterviews();

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

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#222222] font-mono">
      {/* Header */}
        <MockingbirdHeader />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-black">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Interviews</h1>
            <p className="text-gray-600 text-xs">Total Interviews: {interviews.length}</p>
          </div>
          <Link
            href="/interview/create"
            className="flex items-center bg-yellow-300 border-2 border-black px-3 py-1.5 rounded-md 
              shadow-[3px_3px_0_#000] 
              hover:translate-x-[2px] hover:translate-y-[2px] 
              hover:shadow-[2px_2px_0_#000] 
              transition-all group text-xs"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1.5 group-hover:rotate-90 transition-transform" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Interview
          </Link>
        </div>

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
                        <Link
                          href={`/interview/session/${interview.id}`}
                          className="inline-block bg-green-500 text-white px-2.5 py-1 rounded text-[10px] font-bold 
                            hover:bg-green-600 transition-colors"
                        >
                          Start Practice
                        </Link>
                        {/* Commented out View and Edit links
                        <div className="flex space-x-2 text-[10px]">
                          <Link
                            href={`/interview/${interview.id}`}
                            className="text-gray-500 hover:text-black hover:underline transition-colors"
                          >
                            View
                          </Link>
                          <Link
                            href={`/interview/${interview.id}/edit`}
                            className="text-gray-500 hover:text-black hover:underline transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                        */}
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
      </div>
    </div>
  );
}