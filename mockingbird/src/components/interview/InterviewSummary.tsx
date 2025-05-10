'use client';

import React from 'react';

type InterviewSummaryProps = {
  interview: {
    id: number;
    title: string;
    description: string | null;
    domain: string;
    seniority: string;
    duration: string | null;
    key_skills: string | null;
    created_at: string;
  };
};

export const InterviewSummary: React.FC<InterviewSummaryProps> = ({ interview }) => {
  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] rounded-lg overflow-hidden">
      <div className="p-6 border-b-2 border-black">
        <h2 className="text-3xl font-bold tracking-tight mb-2">{interview.title}</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-300">
            {interview.domain}
          </span>
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded border border-purple-300">
            {interview.seniority}
          </span>
          {interview.duration && (
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-300">
              {interview.duration}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {interview.description && (
          <>
            <h3 className="text-lg font-bold mb-2">Description</h3>
            <p className="text-xs mb-4">{interview.description}</p>
          </>
        )}

        {interview.key_skills && (
          <>
            <h3 className="text-lg font-bold mb-2">Key Skills</h3>
            <div className="flex flex-wrap gap-1 mb-6">
              {interview.key_skills.split(',').map((skill, index) => (
                <span
                  key={index}
                  className="bg-gray-200 text-gray-700 text-[9px] px-1.5 py-0.5 rounded"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
