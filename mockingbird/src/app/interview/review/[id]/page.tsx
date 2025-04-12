'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface PerformanceMetric {
  value: number;
  label: string;
  description: string;
}

interface InterviewAnalysis {
  overall_score: number;
  assessment_label: string;
  recommendation: string;
  communication: number;
  technical: number;
  problem_solving: number;
  experience: number;
  summary: string;
}

const RETRY_CONFIG = {
  maxRetries: 5,
  baseDelay: 2000,
  maxDelay: 10000,
  backoffFactor: 2,
};

export default function InterviewReview() {
  const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const params = useParams();
  const sessionId = params.id as string;
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInterviewScore = useCallback(async (sessionId: string) => {
    // Create a new AbortController for each fetch
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/interview-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch analysis');
      }

      const data = await res.json();
      if (!data.analysis) throw new Error('No analysis available');
      return data.analysis;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return null;
      console.error('Fetch error:', error);
      throw error;
    }
  }, []); 

  // Progress tracking effect
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    if (loading) {
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 5;
          return next > 95 ? 95 : next;
        });
      }, 500);
    }
    return () => clearInterval(progressInterval);
  }, [loading]);

  const loadAnalysis = useCallback(async () => {
    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    try {
      console.log(`Attempting to fetch interview score, attempt ${retryCount + 1}`);
      const result = await fetchInterviewScore(sessionId);
      
      if (result) {
        console.log('Successfully fetched interview analysis');
        setAnalysis(result);
        setProgress(100);
        setLoading(false);
        return;
      }
      
      throw new Error('No analysis available');
    } catch (err) {
      // Don't retry if the request was aborted
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }

      console.error('Error fetching interview score:', err);
      
      // Determine if we should retry
      if (retryCount < RETRY_CONFIG.maxRetries) {
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, retryCount),
          RETRY_CONFIG.maxDelay
        );
        
        console.log(`Attempt ${retryCount + 1} failed. Retrying in ${delay}ms...`);
        
        // Set timeout for next retry
        retryTimeoutRef.current = setTimeout(() => {
          // Create a new state update function to avoid stale closure
          setRetryCount(prevCount => {
            if (prevCount < RETRY_CONFIG.maxRetries) {
              loadAnalysis();
              return prevCount + 1;
            }
            return prevCount;
          });
        }, delay);
      } else {
        console.log('Max retries reached, giving up');
        setError(err instanceof Error ? err.message : 'Failed to retrieve interview analysis');
        setProgress(100);
        setLoading(false);
      }
    }
  }, [fetchInterviewScore, sessionId]); 

  // Initial load effect
  useEffect(() => {
    // Ensure we only load once
    const shouldLoad = true;

    if (shouldLoad) {
      setLoading(true);
      setError(null);
      setProgress(0);
      setRetryCount(0);
      
      loadAnalysis();
    }
    
    // Cleanup function
    return () => {
      console.log('Cleaning up...');
      // Abort any ongoing fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Clear any pending timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [loadAnalysis]); 

  if (loading && !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center w-full max-w-md px-4">
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600 mb-2">Preparing your interview analysis...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">This may take a moment. Hang tight while we process your results.</p>
          {retryCount > 0 && (
            <p className="text-xs text-gray-500 mt-2">Attempt {retryCount} of {RETRY_CONFIG.maxRetries}...</p>
          )}
        </div>
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">No Analysis Available</h2>
          <p className="text-gray-700 mb-6">We couldn't retrieve the interview analysis at this time.</p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/interview"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Back to Interviews
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Only proceed if we have analysis data
  if (!analysis) return null;

  const performanceMetrics: PerformanceMetric[] = [
    { value: analysis.communication, label: 'Communication', description: 'Clarity, articulation, and listening skills' },
    { value: analysis.technical, label: 'Technical', description: 'Depth and accuracy of technical knowledge' },
    { value: analysis.problem_solving, label: 'Problem Solving', description: 'Approach to solving complex problems' },
    { value: analysis.experience, label: 'Experience', description: 'Relevant work experience and project history' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGaugeColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Mockingbird</h1>
          <Link href="/interview" className="text-gray-600 hover:text-blue-600">
            Back to Interviews
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Performance Review</h1>
        <p className="text-gray-600 mb-6">Overview of your recent interview session</p>

        <div className="bg-white shadow rounded-xl overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 md:w-1/3">
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-lg opacity-90 mb-2">Overall Score</p>
                <div className="relative">
                  <div className="text-7xl font-bold">{analysis.overall_score}</div>
                  <div className="absolute top-0 right-0 transform translate-x-full -translate-y-1/4">
                    <div className="text-2xl font-bold">/100</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm opacity-90">{analysis.assessment_label}</p>
                  <p className="text-sm opacity-75 mt-1">{analysis.recommendation}</p>
                </div>
              </div>
            </div>
            <div className="p-8 md:w-2/3">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {performanceMetrics.map((metric) => (
                  <div key={metric.label} className="relative">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-gray-700">{metric.label}</p>
                      <p className={`text-sm font-bold ${getScoreColor(metric.value)}`}>{metric.value}/100</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className={`${getGaugeColor(metric.value)} h-2.5 rounded-full`} style={{ width: `${metric.value}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">AI Summary</h2>
          <p className="text-gray-700 whitespace-pre-line">{analysis.summary}</p>
        </div>
      </main>
    </div>
  );
}