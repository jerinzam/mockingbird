'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MockingbirdHeader } from '@/components/mockingBirdHeader';

interface PerformanceMetric {
  value: number;
  label: string;
  description: string;
}

interface EntityReview {
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
  maxRetries: 10,
  baseDelay: 2000,
  maxDelay: 10000,
  backoffFactor: 2,
};

const fetchEntityScore = async (
  org: string,
  entityId: string,
  sessionId: string,
  signal: AbortSignal
) => {
  const res = await fetch(
    `/api/organizations/${org}/entities/${entityId}/sessions/${sessionId}/review`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal,
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch review');
  }

  const data = await res.json();
  if (!data.review?.review) throw new Error('No review available');
  return data.review.review;
};

export default function EntityReview() {
  const [review, setReview] = useState<EntityReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const params = useParams();
  const { org, entityId, sessionId } = params;
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const attemptNumber = retryCount + 1;

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

  const loadReview = useCallback(async () => {
    if (!isMountedRef.current) return;

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    try {
      console.log(`Attempting to fetch entity score, attempt ${attemptNumber}`);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const result = await fetchEntityScore(
        org as string,
        entityId as string,
        sessionId as string,
        abortControllerRef.current.signal
      );

      if (!isMountedRef.current) return;

      if (result) {
        console.log('Successfully fetched entity review');
        setReview(result);
        setProgress(100);
        setLoading(false);
        return;
      }

      throw new Error('No review available');
    } catch (err) {
      if (!isMountedRef.current) return;

      if (err instanceof DOMException && err.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }

      console.error('Error fetching entity score:', err);

      if (retryCount < RETRY_CONFIG.maxRetries) {
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, retryCount),
          RETRY_CONFIG.maxDelay
        );

        console.log(`Attempt ${attemptNumber} failed. Retrying in ${delay}ms...`);

        retryTimeoutRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          setRetryCount((prevCount) => prevCount + 1);
        }, delay);
      } else {
        console.log('Max retries reached, giving up');
        setError(err instanceof Error ? err.message : 'Failed to retrieve entity review');
        setProgress(100);
        setLoading(false);
      }
    }
    // remove retryCount dependency to avoid remounting effect
  }, [org, entityId, sessionId]);

  useEffect(() => {
    isMountedRef.current = true;

    // Reset state only on first mount (not on retry)
    if (retryCount === 0) {
      setLoading(true);
      setError(null);
      setProgress(0);
    }

    loadReview();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [retryCount === 0, loadReview]);

  useEffect(() => {
    if (retryCount > 0) {
      loadReview();
    }
  }, [retryCount, loadReview]);

  if (loading && !review) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4] text-[#222222] font-mono">
        <div className="text-center w-full max-w-md px-4 bg-white border-2 border-black shadow-[4px_4px_0_#000] p-6">
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
          <p className="text-gray-600 text-xs mb-2">Preparing your session review...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-black h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">This may take a moment. Hang tight while we process your results.</p>
          {attemptNumber > 1 && (
            <p className="text-xs text-gray-500 mt-2">Attempt {attemptNumber} of {RETRY_CONFIG.maxRetries}...</p>
          )}
        </div>
      </div>
    );
  }

  if (error && !review) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f4f4] text-[#222222] font-mono p-4">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">No Review Available</h2>
          <p className="text-gray-700 text-xs mb-6">We couldn't retrieve the session review at this time.</p>
          <div className="flex justify-center space-x-4">
            <Link
              href={`/${org}/entities`}
              className="inline-block bg-yellow-300 border-2 border-black px-3 py-1.5 rounded-md 
                shadow-[3px_3px_0_#000] 
                hover:translate-x-[2px] hover:translate-y-[2px] 
                hover:shadow-[2px_2px_0_#000] 
                transition-all text-xs"
            >
              Back to Entities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!review) return null;

  const performanceMetrics: PerformanceMetric[] = [
    { value: review.communication, label: 'Communication', description: 'Clarity, articulation, and listening skills' },
    { value: review.technical, label: 'Technical', description: 'Depth and accuracy of technical knowledge' },
    { value: review.problem_solving, label: 'Problem Solving', description: 'Approach to solving complex problems' },
    { value: review.experience, label: 'Experience', description: 'Relevant work experience and project history' },
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
    <div className="min-h-screen bg-[#f4f4f4] text-[#222222] font-mono">
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-black mb-2">Session Performance Review</h1>
        <p className="text-gray-600 text-xs mb-6">Overview of your recent session</p>

        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] rounded-xl overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 md:w-1/3">
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-lg opacity-90 mb-2">Overall Score</p>
                <div className="relative">
                  <div className="text-7xl font-bold">{review.overall_score}</div>
                  <div className="absolute top-0 right-0 transform translate-x-full -translate-y-1/4">
                    <div className="text-2xl font-bold">/100</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs opacity-90">{review.assessment_label}</p>
                  <p className="text-xs opacity-75 mt-1">{review.recommendation}</p>
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
                    <p className="text-xs opacity-30 mt-1">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">AI Summary</h2>
          <p className="text-gray-700 whitespace-pre-line">{review.summary}</p>
        </div>
      </main>
    </div>
  );
}
