'use client';

import React from 'react';
import { BaseEntity, InterviewEntity, TrainingEntity } from '@/app/dashboard/organizations/[orgId]/entities/[entityId]/page';


// type BaseEntity = {
//     id: number;
//     organization_id: string;
//     type: 'interview' | 'training';
//     title: string;
//     description?: string;  // Changed from string | null to string | undefined
//     slug?: string;
//     status: 'draft' | 'published' | 'licensed' | 'invite-only';
//     visibility: 'private' | 'public' | 'licensed';
//     vapi_agent_id: number;
//     created_at: Date;
//     created_by: string;
//   };

// type InterviewEntity = {
//   domain: string;
//   seniority: 'Junior' | 'Mid-Level' | 'Senior' | 'Lead' | 'Executive';
//   key_skills: string | null;
//   duration: string | null;
// };

// type TrainingEntity = {
//   category: string;
//   difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
//   prerequisites: string | null;
//   learning_objectives: string | null;
//   estimated_completion_time: string | null;
// };

type EntitySummaryProps = {
  entity: BaseEntity & {
    interview?: InterviewEntity;
    training?: TrainingEntity;
  };
};

export const EntitySummary: React.FC<EntitySummaryProps> = ({ entity }) => {

  const getStatusColor = (status: BaseEntity['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'licensed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'invite-only':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getVisibilityColor = (visibility: BaseEntity['visibility']) => {
    switch (visibility) {
      case 'public':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'licensed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    
    <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] rounded-lg overflow-hidden">
      <div className="p-6 border-b-2 border-black">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl font-bold tracking-tight">{entity.title}</h2>
          <div className="flex gap-2">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded border ${getStatusColor(entity.status)}`}>
              {entity.status}
            </span>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded border ${getVisibilityColor(entity.visibility)}`}>
              {entity.visibility}
            </span>
          </div>
        </div>
        {entity.type === 'interview' && entity.interview && (
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-300">
              {entity.interview.domain}
            </span>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded border border-purple-300">
              {entity.interview.seniority}
            </span>
            {entity.interview.duration && (
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-300">
                {entity.interview.duration}
              </span>
            )}
          </div>
        )}

        {entity.type === 'training' && entity.training && (
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-300">
              {entity.training.category}
            </span>
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded border border-orange-300">
              {entity.training.difficulty_level}
            </span>
            {entity.training.estimated_completion_time && (
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-300">
                {entity.training.estimated_completion_time}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="p-6">
        {entity.description && (
          <>
            <h3 className="text-lg font-bold mb-2">Description</h3>
            <p className="text-xs mb-4">{entity.description}</p>
          </>
        )}

        {entity.type === 'interview' && entity.interview?.key_skills && (
          <>
            <h3 className="text-lg font-bold mb-2">Key Skills</h3>
            <div className="flex flex-wrap gap-1 mb-6">
              {entity.interview.key_skills.split(',').map((skill, index) => (
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

        {entity.type === 'training' && entity.training && (
          <>
            {entity.training.prerequisites && (
              <>
                <h3 className="text-lg font-bold mb-2">Prerequisites</h3>
                <p className="text-xs mb-4">{entity.training.prerequisites}</p>
              </>
            )}
            {entity.training.learning_objectives && (
              <>
                <h3 className="text-lg font-bold mb-2">Learning Objectives</h3>
                <p className="text-xs mb-4">{entity.training.learning_objectives}</p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};