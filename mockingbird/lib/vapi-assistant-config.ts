'use client';

import { config } from 'dotenv';
config({ path: '.env.local' });

export const vapiAssistantConfig = {
  name: 'Interviewer',
  voice: {
    model: 'eleven_flash_v2_5',
    voiceId: 'sarah',
    provider: '11labs',
    stability: 0.5,
    similarityBoost: 0.75
  },
  model: {
    model: 'gpt-4.5-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an AI Interviewer responsible for conducting the first-round screening of candidates.'
      }
    ],
    provider: 'openai',
    systemPrompt: ''
  },
  firstMessage: 'Hi there',
  endCallFunctionEnabled: true,
  endCallMessage: '',
  transcriber: {
    model: 'nova-3',
    language: 'en',
    provider: 'deepgram'
  },
  clientMessages: [],
  serverMessages: ['end-of-call-report', 'function-call'],
  hipaaEnabled: false,
  backchannelingEnabled: false,
  analysisPlan: {
    structuredDataPrompt: 'You are an AI Interviewer conducting a first-round screening interview...',
    structuredDataSchema: {
      type: 'object',
      properties: {
        'Recommended for Next Round?': {
          type: 'string',
          enum: ['yes', 'no']
        }
      },
      required: ['Recommended for Next Round?']
    },
    successEvaluationPrompt: 'You are an AI Interview Evaluator responsible for assessing the effectiveness of a Level 1 screening call...'
  },
  backgroundDenoisingEnabled: false,
  messagePlan: {
    idleMessages: ['Are you still there?']
  },
  startSpeakingPlan: {
    smartEndpointingEnabled: true
  },
  compliancePlan: {
    hipaaEnabled: false,
    pciEnabled: false
  }
};

export interface VapiAssistantConfig {
  name: string;
  voice: {
    model: string;
    voiceId: string;
    provider: string;
    stability: number;
    similarityBoost: number;
  };
  model: {
    model: string;
    provider: string;
    messages: {
      role: string;
      content: string;
    }[];
    systemPrompt: string;
  };
  firstMessage: string;
  endCallFunctionEnabled: boolean;
  endCallMessage: string;
  transcriber: {
    model: string;
    language: string;
    provider: string;
  };
  clientMessages: string[];
  serverMessages: string[];
  hipaaEnabled: boolean;
  backchannelingEnabled: boolean;
  analysisPlan: {
    structuredDataPrompt: string;
    structuredDataSchema: {
      type: string;
      properties: Record<string, { type: string; enum?: string[] }>;
      required: string[];
    };
    successEvaluationPrompt: string;
  };
  backgroundDenoisingEnabled: boolean;
  messagePlan: {
    idleMessages: string[];
  };
  startSpeakingPlan: {
    smartEndpointingEnabled: boolean;
  };
  compliancePlan: {
    hipaaEnabled: boolean;
    pciEnabled: boolean;
  };
}