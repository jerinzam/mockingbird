'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ReviewData {
  question: string;
  answer: string;
  feedback: string;
  score: number;
}

interface PerformanceMetric {
  value: number;
  label: string;
  description: string;
}

const mockData: ReviewData[] = [
  {
    question: 'Can you explain the Virtual DOM in React?',
    answer: 'Yes, the Virtual DOM is a lightweight copy of the real DOM. It helps React perform efficient updates by comparing previous and current states.',
    feedback: 'Clear and accurate explanation with good depth of understanding.',
    score: 90
  },
  {
    question: 'How do you manage state in a large React application?',
    answer: 'I typically use Redux or React Context combined with custom hooks to keep state management scalable.',
    feedback: 'Good understanding, though could elaborate more on trade-offs.',
    score: 80
  },
  {
    question: 'Tell me about your experience with TypeScript.',
    answer: 'I have been using TypeScript for about 2 years now. I find it particularly helpful for large codebases because it adds type safety and improves the developer experience with better autocomplete and error checking.',
    feedback: 'Demonstrated practical experience and understanding of TypeScript benefits.',
    score: 85
  },
  {
    question: 'How would you optimize the performance of a React application?',
    answer: 'I would use React.memo for component memoization, lazy loading with Suspense for code splitting, and virtualization for large lists. I would also make sure to avoid unnecessary re-renders by structuring state properly and using useCallback/useMemo where appropriate.',
    feedback: 'Excellent knowledge of performance optimization techniques with specific examples.',
    score: 95
  },
];

const performanceMetrics: PerformanceMetric[] = [
  { value: 86, label: 'Overall', description: 'Combined score across all categories' },
  { value: 90, label: 'Communication', description: 'Clarity, articulation, and listening skills' },
  { value: 84, label: 'Technical', description: 'Depth and accuracy of technical knowledge' },
  { value: 88, label: 'Problem Solving', description: 'Approach to solving complex problems' },
  { value: 82, label: 'Experience', description: 'Relevant work experience and project history' },
];

const aiSummary = "The candidate demonstrated strong technical knowledge in React and frontend development. Their explanation of Virtual DOM was particularly impressive, showing deep understanding of React's internals. Communication was clear and concise. The candidate could improve on elaborating tradeoffs in architectural decisions. Overall, a strong mid-level frontend candidate with potential to grow.";

const strengthsAndWeaknesses = {
  strengths: [
    "Strong understanding of React fundamentals",
    "Clear communication of technical concepts",
    "Good knowledge of performance optimization",
    "Practical experience with TypeScript"
  ],
  weaknesses: [
    "Could provide more depth on architectural tradeoffs",
    "Limited discussion of testing strategies",
    "Some hesitation when discussing CSS architecture"
  ]
};

export default function InterviewReview() {
  const [activeSection, setActiveSection] = useState<'overview' | 'questions' | 'assessment'>('overview');
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);

  // Calculate average score
  const averageScore = Math.round(mockData.reduce((acc, item) => acc + item.score, 0) / mockData.length);

  // Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Helper function to get background color for gauge
  const getGaugeColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Toggle question expansion
  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Check if question is expanded
  const isQuestionExpanded = (index: number) => {
    return expandedQuestions.includes(index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Mockingbird</h1>
          <div className="flex items-center space-x-4">
            <Link href="/interview" className="text-gray-600 hover:text-blue-600">
              Back to Interviews
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Interview Performance Review</h1>
          <p className="text-gray-600 mt-2">
            Frontend Developer | Mid-Level | Completed on April 6, 2025
          </p>
        </div>

        {/* Score Overview */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Left: Overall Score */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 md:w-1/3">
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-lg opacity-90 mb-2">Overall Score</p>
                <div className="relative">
                  <div className="text-7xl font-bold">{averageScore}</div>
                  <div className="absolute top-0 right-0 transform translate-x-full -translate-y-1/4">
                    <div className="text-2xl font-bold">/100</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm opacity-90">Strong Mid-Level Candidate</p>
                  <p className="text-sm opacity-75 mt-1">Ready for real interviews</p>
                </div>
              </div>
            </div>
            
            {/* Right: Category Scores */}
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
                      <div 
                        className={`${getGaugeColor(metric.value)} h-2.5 rounded-full`} 
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveSection('overview')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeSection === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveSection('questions')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeSection === 'questions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Questions & Answers
              </button>
              <button
                onClick={() => setActiveSection('assessment')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeSection === 'assessment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overall Assessment
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Interview Details</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Position</p>
                      <p className="text-base text-gray-900 mt-1">Frontend Developer</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Seniority</p>
                      <p className="text-base text-gray-900 mt-1">Mid-Level</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Domain</p>
                      <p className="text-base text-gray-900 mt-1">Frontend</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Duration</p>
                      <p className="text-base text-gray-900 mt-1">30 minutes</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Skills Assessment</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">React</p>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">85%</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">JavaScript</p>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '90%' }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">90%</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">TypeScript</p>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">80%</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">CSS</p>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">70%</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">System Design</p>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">85%</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Testing</p>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">75%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Summary</h2>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="text-gray-800">{aiSummary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Questions & Answers Tab */}
            {activeSection === 'questions' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Interview Questions & Responses</h2>
                <p className="text-gray-600 mb-6">Detailed breakdown of each question, your response, and expert feedback.</p>
                
                {mockData.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-4">
                    {/* Question Header - Always visible */}
                    <div 
                      className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleQuestion(index)}
                    >
                      <div className="flex items-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-5 w-5 mr-2 transition-transform ${isQuestionExpanded(index) ? 'transform rotate-90' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <h3 className="font-medium text-gray-900">
                          {item.question}
                        </h3>
                      </div>
                      <div className="flex items-center">
                        <div className={`px-3 py-1 rounded-full ${getScoreColor(item.score)} bg-opacity-10 font-semibold`}>
                          {item.score}
                        </div>
                      </div>
                    </div>
                    
                    {/* Collapsible content */}
                    {isQuestionExpanded(index) && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-500 mb-1">Your Response:</p>
                          <p className="text-gray-800 bg-white p-3 rounded-md border border-gray-200">{item.answer}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Feedback:</p>
                          <div className="bg-green-50 p-3 rounded-md border-l-4 border-green-500">
                            <p className="text-gray-800">{item.feedback}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Assessment Tab */}
            {activeSection === 'assessment' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Strengths & Areas for Improvement</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-green-800 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Strengths
                      </h3>
                      <ul className="space-y-2">
                        {strengthsAndWeaknesses.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            <span className="text-gray-800">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-yellow-800 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Areas for Improvement
                      </h3>
                      <ul className="space-y-2">
                        {strengthsAndWeaknesses.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-yellow-500 mr-2">•</span>
                            <span className="text-gray-800">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Interview Assessment</h2>
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-blue-800">Mock Interview Results</h3>
                    </div>
                    <p className="text-gray-700">
                      Based on your strong technical foundation, particularly in React and JavaScript, 
                      and effective communication skills, you would likely progress to the next round in a real interview. 
                      Your performance demonstrates sufficient mid-level expertise and shows potential for growth.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Practice Again
                      </button>
                      <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors">
                        Download Report
                      </button>
                      <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
                        Share Results
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}