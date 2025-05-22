'use client';

import { useEffect, useRef, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Vapi from '@vapi-ai/web';
import { MockingbirdHeader } from '@/components/mockingBirdHeader';

interface Entity {
    id: number;
    title: string;
    description: string | null;
    type: 'interview' | 'training';
    status: string;
    visibility: string;
    vapi_agent_id: string | null;
    vapi_agent?: {
      id: number;
      name: string;
      vapi_agent_id: string;
      api_key: string;
    } | null;
    created_at: string;
    interview?: InterviewEntity;
    training?: TrainingEntity;
  }
  

interface InterviewEntity {
  domain: string;
  seniority: string;
  key_skills: string | null;
  duration: string | null;
}

interface TrainingEntity {
  category: string;
  difficulty_level: string;
  prerequisites: string | null;
  learning_objectives: string | null;
  estimated_completion_time: string | null;
}

interface Message {
  sender: 'assistant' | 'user';
  text: string;
  timestamp: Date;
}

interface VapiTranscriptMessage {
  type: 'transcript';
  transcriptType: 'final' | 'partial';
  transcript: string;
  role: 'user' | 'assistant';
}

interface PageProps {
  params: Promise<{ id: string; sessionId: string;}>;
}

export default function EntitySessionPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [isListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(0));
  const [hasValidToken, setHasValidToken] = useState(false);
  const vapiInstanceRef = useRef<Vapi | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);
  const [micReady, setMicReady] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    params.then(p => setSessionId(p.sessionId));
    params.then(p => setEntityId(p.id));
  }, [params]);

  useEffect(() => {
    
    if (!entityId || !sessionId) return;
    
    const fetchEntitySession = async () => {
      try {
        setIsLoading(true);
        const token = searchParams.get('token');
        const response = await fetch(`/api/entities/${entityId}/sessions/${sessionId}?token=${token || ''}`);
        
        if (!response.ok) {
          if (response.status === 403) {
            // Redirect to entity page if access is denied
            router.push(`/entities/${entityId}`);
            return;
          }
          throw new Error('Failed to fetch session');
        }

        const data = await response.json();
        setEntity(data.data.entity);
        setHasValidToken(data.hasValidToken);

        // If entity is private and token is invalid, redirect to entity page
        if (data.data.entity.visibility === 'private' && !data.hasValidToken) {
          router.push(`/entities/${entityId}`);
          return;
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
        router.push(`/entities/${entityId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntitySession();
  }, [entityId, sessionId, router, searchParams]);

  useEffect(() => {
    if (!entity || !sessionId || !hasValidToken) return;

    // FIX: Always stop any previous Vapi instance before initializing a new one
    if (vapiInstanceRef.current) {
      vapiInstanceRef.current.stop();
      vapiInstanceRef.current = null;
    }

    try {
      // Check if entity has a Vapi agent configured
      if (!entity.vapi_agent) {
        throw new Error('No Vapi agent configured for this entity');
      }

      // Initialize Vapi with the agent's API key
      vapiInstanceRef.current = new Vapi(entity.vapi_agent.api_key);
            
      // Set up event handlers
      vapiInstanceRef.current.on('message', (message: VapiTranscriptMessage) => {
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          setTranscript((prev) => [
            ...prev,
            {
              sender: message.role,
              text: message.transcript,
              timestamp: new Date(),
            },
          ]);
        }
      });
  
      vapiInstanceRef.current.on('volume-level', (level) => {
        setAudioLevels(Array(20).fill(level));
      });
  
      vapiInstanceRef.current.on('speech-start', () => setIsSpeaking(true));
      vapiInstanceRef.current.on('speech-end', () => setIsSpeaking(false));
      vapiInstanceRef.current.on('call-start', () => setMicReady(true));
      
      vapiInstanceRef.current.on('call-end', () => {
        if (isNavigatingRef.current) return;
        setIsSessionActive(false);
        setTimeout(() => {
            if (!isNavigatingRef.current) {
                isNavigatingRef.current = true;
                // Add token to review URL if it exists
                const reviewUrl = `/entities/${entityId}/session/${sessionId}/review`;
                const urlWithToken = token ? `${reviewUrl}?token=${token}` : reviewUrl;
                router.push(urlWithToken);
            }
        }, 100);
    });
  
      const assistantOverrides = {
        metadata: {
          entityId: entity.id,
          session_id: sessionId,
          vapi_agent_name: entity.vapi_agent.name,
        },
        variableValues: {
          entity_title: entity.title,
          entity_type: entity.type,
          ...(entity.type === 'interview' && entity.interview
            ? {
                interview_domain: entity.interview.domain,
                interview_duration: entity.interview.duration,
                interview_seniority: entity.interview.seniority,
                interview_keyskills: entity.interview.key_skills,
              }
            : {}),
          ...(entity.type === 'training' && entity.training
            ? {
                training_category: entity.training.category,
                training_difficulty: entity.training.difficulty_level,
                training_objectives: entity.training.learning_objectives,
                training_prerequisites: entity.training.prerequisites,
                training_estimated_time: entity.training.estimated_completion_time,
              }
            : {}),
        },
      };
  
      // Start the Vapi session with the agent's assistant ID
      vapiInstanceRef.current.start(entity.vapi_agent.vapi_agent_id, assistantOverrides);
    } catch (error) {
      console.error('Failed to initialize Vapi:', error);
      // You might want to show an error message to the user here
    }
  
    return () => {
      if (vapiInstanceRef.current) {
        vapiInstanceRef.current.stop();
        vapiInstanceRef.current = null;
      }
    };
  }, [entity, sessionId, router, entityId]);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isSessionActive) {
      timerId = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timerId);
  }, [isSessionActive]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  useEffect(() => {
    let animationId: number;
    const animate = () => {
      setAudioLevels((prev) =>
        prev.map(() => (isSpeaking ? Math.random() * 0.8 : isListening ? Math.random() * 0.5 : 0))
      );
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isSpeaking, isListening]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndSession = async () => {
    if (isNavigatingRef.current) return;
    try {
        isNavigatingRef.current = true;

        // FIX: Stop and nullify Vapi instance on manual session end
        if (vapiInstanceRef.current) {
            await vapiInstanceRef.current.stop();
            vapiInstanceRef.current = null;
        }

        // Add token to review URL if it exists
        const reviewUrl = `/entities/${entityId}/session/${sessionId}/review`;
        const urlWithToken = token ? `${reviewUrl}?token=${token}` : reviewUrl;
        
        router.push(urlWithToken);
    } catch (error) {
        console.error('Error ending session:', error);
        // Still include token in redirect even if there's an error
        const reviewUrl = `/entities/${entityId}/session/${sessionId}/review`;
        const urlWithToken = token ? `${reviewUrl}?token=${token}` : reviewUrl;
        router.push(urlWithToken);
    }
};


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4] text-[#222222] font-mono">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          <p className="mt-3 text-gray-600 text-xs">Loading entity session data...</p>
        </div>
      </div>
    );
  }

  if (!entity || (entity.visibility === 'private' && !hasValidToken)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f4f4] text-[#222222] font-mono">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 text-xs mb-4">You don't have permission to access this session.</p>
          <Link href={`/entities/${entityId}`} className="inline-block bg-yellow-300 border-2 border-black px-3 py-1.5 rounded-md shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all text-xs">
            Back to Entity
          </Link>
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f4f4] text-[#222222] font-mono">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Entity Not Found</h1>
          <p className="text-gray-600 text-xs mb-4">The entity you're looking for doesn't exist or has been removed.</p>
          <Link href="/entities" className="inline-block bg-yellow-300 border-2 border-black px-3 py-1.5 rounded-md shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all text-xs">
            Back to Entities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#222222] font-mono">
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/5">
            <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] rounded-lg overflow-hidden">
              <div className="p-6 text-center">
                <h2 className="text-xl font-bold mb-6">AI {entity.type === 'interview' ? 'Interviewer' : 'Trainer'}</h2>
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white text-3xl font-bold">AI</span>
                  </div>
                  {isSpeaking && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white py-1 px-3 rounded-full shadow-md">
                      <div className="flex items-center text-xs text-gray-700">
                        <div className="h-2 w-2 rounded-full bg-red-500 mr-1 animate-pulse"></div>
                        Speaking
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-end justify-center h-24 space-x-1 mb-6">
                  {audioLevels.map((level, i) => (
                    <div key={i} className="w-2 bg-blue-500 rounded-full transition-all duration-100" style={{ height: `${Math.max(4, level * 64)}px` }}></div>
                  ))}
                </div>
                <div className="text-center mb-6">
                  <div className="text-sm font-medium text-gray-500 mb-1">{entity.type === 'interview' ? 'Interview Topic' : 'Training Topic'}</div>
                  <div className="text-lg font-medium text-gray-900">{entity.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {entity.type === 'interview' && entity.interview
                      ? `${entity.interview.domain} • ${entity.interview.seniority}`
                      : entity.type === 'training' && entity.training
                      ? `${entity.training.category} • ${entity.training.difficulty_level}`
                      : ''}
                  </div>
                </div>
                {!micReady ? (
                  <div className="flex justify-center">
                    <button disabled className="px-6 py-3 bg-gray-300 text-gray-600 rounded-md flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 mr-2 text-gray-600" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Waiting for microphone...
                    </button>
                  </div>
                ) : (
                  <button onClick={handleEndSession} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md shadow transition-colors">
                    End Session
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-3/5">
            <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] rounded-lg overflow-hidden h-[600px] flex flex-col">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">{entity.type === 'interview' ? 'Interview Transcript' : 'Training Transcript'}</h2>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Recording
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {transcript.map((message, index) => {
                    const prev = transcript[index - 1];
                    const isNewSpeaker = !prev || prev.sender !== message.sender;
                    const isAssistant = message.sender === 'assistant';
                    const lineColor = isAssistant ? 'border-blue-500' : 'border-green-500';
                    if (!isNewSpeaker) {
                      return (
                        <p key={index} className={`border-l-2 ${lineColor} pl-3 text-gray-800 whitespace-pre-line leading-relaxed ml-5 mb-1`}>
                          {message.text}
                        </p>
                      );
                    }
                    return (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className={`font-medium ${isAssistant ? 'text-blue-700' : 'text-green-700'}`}>{isAssistant ? (entity.type === 'interview' ? 'Interviewer' : 'Trainer') : 'You'}</span>
                          <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className={`border-l-2 ${lineColor} pl-3 text-gray-800 whitespace-pre-line leading-relaxed`}>{message.text}</div>
                      </div>
                    );
                  })}
                  <div ref={transcriptEndRef} />
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600 flex items-center justify-between">
                <span>Transcript is being recorded</span>
                <span>Duration: {formatTime(elapsedTime)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}