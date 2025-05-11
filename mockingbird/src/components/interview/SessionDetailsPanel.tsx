import React from 'react';

interface SessionDetailsPanelProps {
  open: boolean;
  onClose: () => void;
  session?: { id: string; title: string };
}

const dummyTranscript = [
  { speaker: 'AI', text: "That's a great strategy. Clear documentation can definitely help align the team. And minimize misunderstandings. Now let's touch on cultural fit. What values or principles do you prioritize in a workplace? And how do you think they align with our company's culture?" },
  { speaker: 'User', text: "I guess 1 of the most important thing, I believe, important is ethics. And being sincere to your work. That probably is the most important." },
  { speaker: 'AI', text: "Those are very important values. Ethics and sincerity can greatly contribute to a positive work environment. It's great to hear that you prioritize those in your professional life. Before we wrap up, do you have any questions for me about the role or the company?" },
  { speaker: 'User', text: "No. I think I'm pretty clear about the role, and it was very nice discussion." },
  { speaker: 'AI', text: "I'm glad to hear that, Max. It was a pleasure talking with you as well. Thank you for sharing your experiences and insights." },
];

const SessionDetailsPanel: React.FC<SessionDetailsPanelProps> = ({ open, onClose, session }) => (
  <>
    {open && (
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
        aria-label="Close panel"
      />
    )}
    <div
      className={`
        fixed top-0 right-0 h-full w-[480px] bg-gray-900 text-white shadow-2xl z-50 transition-transform duration-300
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}
      style={{ willChange: 'transform' }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-2xl text-gray-300 hover:text-white"
        aria-label="Close"
      >
        &times;
      </button>
      <div className="p-6 pt-12 h-full flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Call Log Details</h2>
          <div className="text-xs text-gray-400 mt-1">{session?.id}</div>
        </div>
        {/* Audio Player (dummy waveform) */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="h-16 bg-gradient-to-r from-yellow-400 via-orange-400 to-teal-400 rounded mb-2 flex items-center justify-center">
            <span className="text-gray-900 font-bold">[Waveform]</span>
          </div>
          <div className="flex items-center justify-between">
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18l15-9-15-9z" />
              </svg>
            </button>
            <span>1.0x</span>
            <span>10:00</span>
            <button className="bg-gray-700 px-3 py-1 rounded">Audio</button>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-700 mb-2">
          {['Transcripts', 'Logs', 'Analysis', 'Messages'].map(tab => (
            <button
              key={tab}
              className={`pb-2 px-2 font-semibold ${
                tab === 'Transcripts' ? 'border-b-2 border-green-400 text-green-400' : 'text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Transcript */}
        <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg p-4">
          {dummyTranscript.map((item, idx) => (
            <div key={idx} className="mb-4">
              <span
                className={`font-bold ${
                  item.speaker === 'AI' ? 'text-green-400' : 'text-blue-400'
                }`}
              >
                {item.speaker}
              </span>
              <div className="whitespace-pre-line">{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

export default SessionDetailsPanel;