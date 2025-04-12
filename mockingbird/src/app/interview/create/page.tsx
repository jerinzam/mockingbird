'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


 const INTERVIEW_TEMPLATE = {
  title: 'Frontend Developer Technical Interview',
  description: 'Comprehensive assessment of frontend development skills, focusing on React, JavaScript, and modern web technologies.',
  domain: 'Frontend',
  seniority: 'Mid-Level',
  key_skills: 'JavaScript,React,TypeScript,HTML,CSS,State Management,API Integration',
  duration: '45 mins'
};

const domains = [
  'Web Development',
  'Frontend', 
  'Backend', 
  'Full Stack', 
  'Mobile', 
  'DevOps', 
  'Data Science', 
  'Machine Learning', 
  'Cloud', 
  'Security', 
  'QA',
  'AI/ML',
  'Blockchain',
  'UI/UX'
] as const

// Convert domains to standard array for select options
const DOMAINS = [...domains];

const SENIORITY_LEVELS = [
  'Junior', 
  'Mid-Level', 
  'Senior', 
  'Lead', 
  'Executive'
] as const;

// Define the errors type
type InterviewFormErrors = {
  title?: string;
  description?: string;
  domain?: string;
  seniority?: string;
  duration?: string;
  key_skills?: string;
};

// Define the form data type

interface InterviewForm {
  title: string;
  description: string;
  domain: typeof domains[number];
  seniority: typeof SENIORITY_LEVELS[number];
  duration: string;
  key_skills: string[];
}

export default function CreateInterviewPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<InterviewForm>({
    title: '',
    description: '',
    domain: 'Frontend',
    seniority: 'Mid-Level',
    duration: '30 mins',
    key_skills: []
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [errors, setErrors] = useState<InterviewFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load template
  const loadTemplate = () => {
    setFormData({
      title: INTERVIEW_TEMPLATE.title,
      description: INTERVIEW_TEMPLATE.description,
      domain: INTERVIEW_TEMPLATE.domain as typeof domains[number],
      seniority: INTERVIEW_TEMPLATE.seniority as typeof SENIORITY_LEVELS[number],
      duration: INTERVIEW_TEMPLATE.duration,
      key_skills: INTERVIEW_TEMPLATE.key_skills.split(',')
    });
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name as keyof InterviewFormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof InterviewFormErrors];
        return newErrors;
      });
    }
  };

  // Add skill to the list
  const addSkill = () => {
    if (currentSkill.trim() && !formData.key_skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        key_skills: [...prev.key_skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

//   // Remove skill from the list
  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      key_skills: prev.key_skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: InterviewFormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Interview title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.domain) {
      newErrors.domain = 'Domain is required';
    }

    if (!formData.seniority) {
      newErrors.seniority = 'Seniority level is required';
    }

    if (!formData.duration || formData.duration.trim() === '') {
      newErrors.duration = 'Duration is required';
    }

    if (formData.key_skills.length === 0) {
      newErrors.key_skills = 'At least one skill is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (isSubmitting) return;
  
    try {
      setIsSubmitting(true);
  
      const response = await fetch('/api/create-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create interview');
      }
  
      // Redirect to interview session page
      router.push(`/interview/session/${data.id}`);
    } catch (error) {
      console.error('Error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Mockingbird</h1>
          <Link href="/interview" className="text-gray-600 hover:text-blue-600">
            Back to Interviews
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Interview</h2>
              <p className="text-gray-600 mt-2">Set up a custom AI-powered interview</p>
            </div>
            <button 
              onClick={loadTemplate}
              className="text-blue-600 hover:underline text-sm"
            >
              Use Template
            </button>
          </div>

          <form  onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Interview Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Interview Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="E.g., Senior React Developer Interview"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                  ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Provide a brief overview of the interview's purpose and focus"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                  ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              ></textarea>
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            {/* Domain and Seniority */}
            <div className="grid grid-cols-2 gap-4">
              {/* Domain */}
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                  Domain
                </label>
                <select
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    ${errors.domain ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Domain</option>
                  {DOMAINS.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
                {errors.domain && (
                  <p className="text-red-500 text-xs mt-1">{errors.domain}</p>
                )}
              </div>

              {/* Seniority */}
              <div>
                <label htmlFor="seniority" className="block text-sm font-medium text-gray-700 mb-2">
                  Seniority Level
                </label>
                <select
                  id="seniority"
                  name="seniority"
                  value={formData.seniority}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    ${errors.seniority ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Seniority</option>
                  {SENIORITY_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {errors.seniority && (
                  <p className="text-red-500 text-xs mt-1">{errors.seniority}</p>
                )}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Interview Duration
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="E.g., 30 mins, 1 hour"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                  ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.duration && (
                <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
              )}
            </div>

            {/* Key Skills */}
            <div>
              <label htmlFor="skill-input" className="block text-sm font-medium text-gray-700 mb-2">
                Key Skills
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="skill-input"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  placeholder="Add a skill (e.g., React, TypeScript)"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>

              {/* Skills List */}
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.key_skills.map(skill => (
                  <span 
                    key={skill} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}<button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1.5 text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {errors.key_skills && (
                <p className="text-red-500 text-xs mt-1">{errors.key_skills}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Interview...' : 'Create Interview'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}