'use client';

import { useState, FormEvent } from 'react';
// import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MockingbirdHeader } from '../../components/mockingBirdHeader';

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

  // Remove skill from the list
  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      key_skills: prev.key_skills.filter(skill => skill !== skillToRemove)
    }));
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
    <div className="min-h-screen bg-[#f4f4f4] text-[#222222] font-mono">
      {/* Header */}
      <MockingbirdHeader />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Form Fields */}
          <div className="md:col-span-3">
            <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] overflow-hidden">
              <div className="p-6 bg-[#e0e0e0] border-b-2 border-black flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-black">Create New Interview</h2>
                  <p className="text-gray-700 text-xs mt-2">Set up a custom AI-powered interview</p>
                </div>
                <button 
                  onClick={loadTemplate}
                  className="text-blue-600 hover:underline text-xs"
                >
                  Use Template
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Side - Form Fields (2 columns) */}
                  <div className="space-y-6 md:col-span-2">
                    {/* Interview Title */}
                    <div>
                      <label htmlFor="title" className="block text-xs font-medium text-gray-700 mb-2">
                        Interview Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="E.g., Senior React Developer Interview"
                        className={`w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 
                          ${errors.title ? 'border-red-500' : ''}`}
                      />
                      {errors.title && (
                        <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Domain */}
                      <div>
                        <label htmlFor="domain" className="block text-xs font-medium text-gray-700 mb-2">
                          Domain
                        </label>
                        <select
                          id="domain"
                          name="domain"
                          value={formData.domain}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 
                            ${errors.domain ? 'border-red-500' : ''}`}
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
                        <label htmlFor="seniority" className="block text-xs font-medium text-gray-700 mb-2">
                          Seniority Level
                        </label>
                        <select
                          id="seniority"
                          name="seniority"
                          value={formData.seniority}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 
                            ${errors.seniority ? 'border-red-500' : ''}`}
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
                      <label htmlFor="duration" className="block text-xs font-medium text-gray-700 mb-2">
                        Interview Duration
                      </label>
                      <input
                        type="text"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="E.g., 30 mins, 1 hour"
                        className={`w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 
                          ${errors.duration ? 'border-red-500' : ''}`}
                      />
                      {errors.duration && (
                        <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
                      )}
                    </div>

                    {/* Key Skills */}
                    <div>
                      <label htmlFor="skill-input" className="block text-xs font-medium text-gray-700 mb-2">
                        Key Skills
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          id="skill-input"
                          value={currentSkill}
                          onChange={(e) => setCurrentSkill(e.target.value)}
                          placeholder="Add a skill (e.g., React, TypeScript)"
                          className="flex-grow px-3 py-2 border-2 border-black rounded-l-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="px-4 py-2 bg-yellow-300 border-2 border-black rounded-r-none hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Add
                        </button>
                      </div>

                      {/* Skills List */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.key_skills.map(skill => (
                          <span 
                            key={skill} 
                            className="inline-flex items-center px-2 py-0.5 rounded-none text-[9px] font-medium bg-gray-200 text-gray-700"
                          >
                            {skill}<button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-1.5 text-gray-500 hover:text-gray-700"
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
                  </div>

                  {/* Right Side - Description (1 column) */}
                  <div className="md:col-span-1">
                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-2">
                        Job Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={17}
                        placeholder="Provide a detailed job description including responsibilities, requirements, and qualifications"
                        className={`w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 
                          ${errors.description ? 'border-red-500' : ''}`}
                      ></textarea>
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 mt-6 border-t-2 border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-yellow-300 border-2 border-black 
                      shadow-[3px_3px_0_#000] 
                      hover:translate-x-[2px] hover:translate-y-[2px] 
                      hover:shadow-[2px_2px_0_#000] 
                      transition-transform text-xs 
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating Interview...' : 'Create Interview'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Blank Column for Layout Balance */}
          <div className="md:col-span-1">
            {/* This column intentionally left empty for layout balance */}
          </div>
        </div>
      </main>
    </div>
  );
}