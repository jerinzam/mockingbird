'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Vapi from '@vapi-ai/web';
import { MockingbirdHeader } from '../../../../components/mockingBirdHeader';

interface Interview {
  id: number;
  title: string;
  description: string | null;
  domain: string;
  seniority: string;
  duration: string | null;
  key_skills: string | null;
  created_at: string;
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
  params: Promise<{ interviewId:string,sessionId: string }>;
}

export default function InterviewSessionPage({ params }: PageProps) {
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInterviewActive, setIsInterviewActive] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [isListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(0));
  const vapiInstanceRef = useRef<Vapi | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);
  const [micReady, setMicReady] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [interviewId, setInterviewId] = useState<string>('');

  useEffect(() => {
    params.then(p => setSessionId(p.sessionId));
    params.then(p => setInterviewId(p.interviewId));
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;
    const fetchInterviewSession = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/interview/session/${sessionId}`);
        if (!response.ok) throw new Error('Failed to fetch session');
        const data = await response.json();
        setInterview(data.interview);
      } catch (error) {
        console.error('Failed to fetch session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInterviewSession();
  }, [sessionId]);

  useEffect(() => {
    if (vapiInstanceRef.current || !interview || !sessionId) return;
    try {
      vapiInstanceRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY || '');
      vapiInstanceRef.current.on('message', (message: VapiTranscriptMessage) => {
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          setTranscript((prev) => [...prev, {
            sender: message.role,
            text: message.transcript,
            timestamp: new Date(),
          }]);
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
        setIsInterviewActive(false);
        setTimeout(() => {
          if (!isNavigatingRef.current) {
            isNavigatingRef.current = true;
            router.push(`/interview/${interview.id}/session/${sessionId}/review`);
          }
        }, 100);
      });

      const assistantOverrides = {
        metadata: {
          interviewId: interview.id,
          session_id: sessionId
        },
        variableValues: {
          interview_title: interview.title,
          interview_domain: interview.domain,
          interview_duration: interview.duration,
          interview_seniority: interview.seniority,
          interview_keyskills: interview.key_skills
        }
      };
      vapiInstanceRef.current.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, assistantOverrides);

    } catch (error) {
      console.error('Failed to initialize Vapi:', error);
    }
    return () => {
      if (vapiInstanceRef.current) {
        vapiInstanceRef.current.stop();
        vapiInstanceRef.current = null;
      }
    };
  }, [interview, sessionId, router]);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isInterviewActive) {
      timerId = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timerId);
  }, [isInterviewActive]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  useEffect(() => {
    let animationId: number;
    const animate = () => {
      setAudioLevels((prev) => prev.map(() => (isSpeaking ? Math.random() * 0.8 : isListening ? Math.random() * 0.5 : 0)));
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




  const handleEndInterview = async () => {
    if (isNavigatingRef.current) return;
    try {
      isNavigatingRef.current = true;
      if (vapiInstanceRef.current) {
        await vapiInstanceRef.current.stop();
      }
      router.push(`/interview/${interviewId}/session/${sessionId}/review`);
    } catch (error) {
      console.error('Error ending interview:', error);
      router.push(`/interview/${interviewId}/session/${sessionId}/review`);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4] text-[#222222] font-mono">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        <p className="mt-3 text-gray-600 text-xs">Loading interview data...</p>
      </div>
    </div>;
  }

  if (!interview) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f4f4] text-[#222222] font-mono">
      <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Interview Not Found</h1>
        <p className="text-gray-600 text-xs mb-4">The interview {`you're`} looking for {`doesn't`} exist or has been removed.</p>
        <Link href="/interview" className="inline-block bg-yellow-300 border-2 border-black px-3 py-1.5 rounded-md shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all text-xs">
          Back to Interviews
        </Link>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#222222] font-mono">
      <MockingbirdHeader />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/5">
            <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] rounded-lg overflow-hidden">
              <div className="p-6 text-center">
                <h2 className="text-xl font-bold mb-6">AI Interviewer</h2>
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white text-3xl font-bold">AI</span>
                  </div>
                  {isSpeaking && <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white py-1 px-3 rounded-full shadow-md">
                    <div className="flex items-center text-xs text-gray-700">
                      <div className="h-2 w-2 rounded-full bg-red-500 mr-1 animate-pulse"></div>
                      Speaking
                    </div>
                  </div>}
                </div>
                <div className="flex items-end justify-center h-24 space-x-1 mb-6">
                  {audioLevels.map((level, i) => (
                    <div key={i} className="w-2 bg-blue-500 rounded-full transition-all duration-100" style={{ height: `${Math.max(4, level * 64)}px` }}></div>
                  ))}
                </div>
                <div className="text-center mb-6">
                  <div className="text-sm font-medium text-gray-500 mb-1">Interview Topic</div>
                  <div className="text-lg font-medium text-gray-900">{interview.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{interview.domain} • {interview.seniority}</div>
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
                  <button onClick={handleEndInterview} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md shadow transition-colors">
                    End Interview
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-3/5">
            <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] rounded-lg overflow-hidden h-[600px] flex flex-col">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Interview Transcript</h2>
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
                      return <p key={index} className={`border-l-2 ${lineColor} pl-3 text-gray-800 whitespace-pre-line leading-relaxed ml-5 mb-1`}>{message.text}</p>;
                    }
                    return <div key={index} className="mb-4">
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className={`font-medium ${isAssistant ? 'text-blue-700' : 'text-green-700'}`}>{isAssistant ? 'Interviewer' : 'You'}</span>
                        <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`border-l-2 ${lineColor} pl-3 text-gray-800 whitespace-pre-line leading-relaxed`}>{message.text}</div>
                    </div>;
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