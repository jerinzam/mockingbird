'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Vapi from '@vapi-ai/web';
import { v4 as uuidv4 } from 'uuid';

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

export default function InterviewSessionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [transcript, setTranscript] = useState<Message[]>([]);
  // const [isListening, setIsListening] = useState(false);
  const [isListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(0));
  const vapiInstanceRef = useRef<Vapi | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);

  // Create a stable sessionId that will be used consistently
  const interviewSessionId = useRef(uuidv4());

  // Fetch interview details
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/interview/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch interview');
        const data = await response.json();
        setInterview(data);
      } catch (error) {
        console.error('Failed to fetch interview:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterview();
  }, [params.id]);


  // Fetch interview data
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setIsLoading(true);
        // In a real app, fetch the interview from the API based on the ID
        // For now, using mock data
        const mockInterview: Interview = {
          id: parseInt(params.id),
          title: 'Frontend Developer Interview',
          description: 'Comprehensive assessment of React skills, JavaScript proficiency, and frontend fundamentals.',
          domain: 'Frontend',
          seniority: 'Mid-Level',
          duration: '30 mins',
          key_skills: 'JavaScript,React,CSS,HTML,TypeScript',
          created_at: new Date().toISOString(),
        };
        setInterview(mockInterview);
      } catch (error) {
        console.error('Failed to fetch interview:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterview();
  }, [params.id]);

  // Initialize VAPI
  useEffect(() => {
    if (vapiInstanceRef.current || !interview) return;

    try {
      vapiInstanceRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY || '');

      // Set up event listeners for VAPI
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

      // Handle call end
      vapiInstanceRef.current.on('call-end', () => {
        if (isNavigatingRef.current) return;
        
        setIsInterviewActive(false);
        
        // Use setTimeout to ensure state updates and other cleanup can occur
        setTimeout(() => {
          if (!isNavigatingRef.current) {
            isNavigatingRef.current = true;
            router.push(`/interview/review/${interviewSessionId.current}`);
          }
        }, 100);
      });

    } catch (error) {
      console.error('Failed to initialize Vapi:', error);
    }

    return () => {
      if (vapiInstanceRef.current) {
        vapiInstanceRef.current.stop();
        vapiInstanceRef.current = null;
      }
    };
  }, [interview, params.id, router]);

  // Timer for interview duration
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isInterviewActive) {
      timerId = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timerId);
  }, [isInterviewActive]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Animate audio visualizer
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

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start the interview
  const handleStartInterview = async () => {
    if (!vapiInstanceRef.current || !interview) return;

    try {
      setIsInterviewActive(true);
      setElapsedTime(0);
      
      // Prepare system prompt based on interview parameters
      const systemPrompt = `You are an experienced technical interviewer conducting an interview for a ${interview.title} position.
      
Domain: ${interview.domain}
Seniority: ${interview.seniority}
Duration: ${interview.duration || '30 minutes'}
Skills to assess: ${interview.key_skills || 'frontend technologies'}

Your goal is to assess the candidate's technical knowledge and experience level.

Guidelines for this interview:
1. Start with a friendly introduction and explain the interview format
2. Ask questions that are appropriate for a ${interview.seniority} level ${interview.domain} developer
3. Follow up on answers to dig deeper into the candidate's knowledge
4. Cover both technical knowledge and practical experience
5. Keep questions clear and concise
6. Avoid asking more than one question at a time
7. Maintain a conversational and professional tone`;
      
      // Start the VAPI call
      await vapiInstanceRef.current.start({
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
              content: systemPrompt
            }
          ],
          provider: 'openai'
        },
        firstMessage: `Hello! Im your interviewer today for the ${interview.title} position. Ill be asking you some questions to understand your experience and technical knowledge in ${interview.domain}. Let's start by having you introduce yourself and tell me a bit about your background.`,
        endCallMessage: 'Thank you for participating in this interview. Weve covered all the key areas I wanted to assess. Ive gathered good insights into your skills and experience. The interview is now complete.',
        transcriber: {
          model: 'nova-3',
          language: 'en',
          provider: 'deepgram'
        },
        backgroundDenoisingEnabled: true,
        messagePlan: {
          idleMessages: ['Are you still there?', 'Should we continue the interview?']
        },
        compliancePlan: {
          hipaaEnabled: false,
          pciEnabled: false
        },
        metadata: {
          "sessionId": interviewSessionId.current
        }
      });
    } catch (error) {
      console.error('VAPI start error:', error);
      setIsInterviewActive(false);
      alert('Failed to start interview. Please check your microphone and try again.');
    }
  };

  // End the interview manually
  const handleEndInterview = async () => {
    if (isNavigatingRef.current) return;

    try {
      // Prevent multiple navigation attempts
      isNavigatingRef.current = true;

      // Stop the Vapi call if it exists
      if (vapiInstanceRef.current) {
        await vapiInstanceRef.current.stop();
      }

      // Store session data in localStorage
      localStorage.setItem('interviewSessionId', interviewSessionId.current);

      // Navigate to review page
      router.push(`/interview/review/${interviewSessionId.current}`);
    } catch (error) {
      console.error('Error ending interview:', error);
      // Fallback navigation
      router.push(`/interview/review/${interviewSessionId.current}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-3 text-gray-600">Loading interview data...</p>
        </div>
      </div>
    );
  }

  // Interview not found
  if (!interview) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-red-600">Interview Not Found</h1>
        <p className="mt-2 text-gray-600">{`The interview you're looking for doesn't exist or has been removed.`}</p>
        <Link href="/interview" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Back to Interviews
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Mockingbird</h1>
          <div className="flex items-center space-x-4">
            {isInterviewActive && (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                <div className="h-3 w-3 rounded-full bg-blue-600 animate-pulse"></div>
                <span className="text-blue-700 font-medium">{formatTime(elapsedTime)}</span>
              </div>
            )}
            <Link href="/interview" className="text-gray-600 hover:text-blue-600">
              Back to Interviews
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isInterviewActive ? (
          // Pre-interview view
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left side - Interview details */}
            <div className="w-full lg:w-3/5">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{interview.title}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {interview.domain}
                    </span>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {interview.seniority}
                    </span>
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {interview.duration}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 mb-4">{interview.description}</p>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Key Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {interview.key_skills?.split(',').map((skill, index) => (
                      <span key={index} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h3 className="text-md font-medium text-blue-900 mb-2">Interview Tips</h3>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li className="flex items-start">
                        <svg className="w-4 h-4 mr-1.5 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        {`Make sure you're in a quiet environment`}
                      </li>
                      <li className="flex items-start">
                        <svg className="w-4 h-4 mr-1.5 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        Test your microphone before starting
                      </li>
                      <li className="flex items-start">
                        <svg className="w-4 h-4 mr-1.5 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        Speak clearly and at a normal pace
                      </li>
                      <li className="flex items-start">
                        <svg className="w-4 h-4 mr-1.5 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        Take a moment to think before answering
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Start button and preview */}
            <div className="w-full lg:w-2/5 space-y-6">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Ready to Begin?</h3>
                  <p className="text-gray-600 mb-6">
                    This interview will last approximately {interview.duration}. 
                    {`You'll`} be asked questions about {interview.domain} topics appropriate for a {interview.seniority} position.
                  </p>
                  
                  <button
                    onClick={handleStartInterview}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-md shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Start Interview
                  </button>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-md font-medium text-gray-900">How It Works</h3>
                </div>
                <div className="p-6">
                  <ol className="space-y-4">
                    <li className="flex">
                      <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold mr-3">1</span>
                      <div>
                        <h4 className="font-medium text-gray-900">Start the interview</h4>
                        <p className="text-sm text-gray-600">Click the button to begin your AI-powered interview session</p>
                      </div>
                    </li>
                    <li className="flex">
                      <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold mr-3">2</span>
                      <div>
                        <h4 className="font-medium text-gray-900">Answer the questions</h4>
                        <p className="text-sm text-gray-600">Respond naturally to questions asked by the AI interviewer</p>
                      </div>
                    </li>
                    <li className="flex">
                      <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold mr-3">3</span>
                      <div>
                        <h4 className="font-medium text-gray-900">Review your performance</h4>
                        <p className="text-sm text-gray-600">Get detailed feedback and scores after completing the interview</p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Active interview view
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column - Avatar and visualization */}
            <div className="w-full lg:w-2/5">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Interviewer</h2>
                  
                  {/* Avatar */}
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
                    
                    {isListening && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-white py-1 px-3 rounded-full shadow-md">
                        <div className="flex items-center text-xs text-gray-700">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                          Listening
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Audio visualization */}
                  <div className="flex items-end justify-center h-24 space-x-1 mb-6">
                    {audioLevels.map((level, i) => (
                      <div
                        key={i}
                        className="w-2 bg-blue-500 rounded-full transition-all duration-100"
                        style={{ height: `${Math.max(4, level * 64)}px` }}
                      ></div>
                    ))}
                  </div>
                  
                  {/* Interview topic info */}
                  <div className="text-center mb-6">
                    <div className="text-sm font-medium text-gray-500 mb-1">Interview Topic</div>
                    <div className="text-lg font-medium text-gray-900">{interview.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{interview.domain} • {interview.seniority}</div>
                  </div>
                  
                  {/* End interview button */}
                  <button
                    onClick={handleEndInterview}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md shadow transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    End Interview
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right column - Transcript */}
            <div className="w-full lg:w-3/5">
              <div className="bg-white shadow rounded-lg overflow-hidden h-[600px] flex flex-col">
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
                        return (
                          <p 
                            key={index} 
                            className={`border-l-2 ${lineColor} pl-3 text-gray-800 whitespace-pre-line leading-relaxed ml-5 mb-1`}
                          >
                            {message.text}
                          </p>
                        );
                      }

                      return (
                        <div key={index} className="mb-4">
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className={`font-medium ${isAssistant ? 'text-blue-700' : 'text-green-700'}`}>
                              {isAssistant ? 'Interviewer' : 'You'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className={`border-l-2 ${lineColor} pl-3 text-gray-800 whitespace-pre-line leading-relaxed`}>
                            {message.text}
                          </div>
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
        )}
      </main>
    </div>
  );
}