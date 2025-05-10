'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardIcon } from '@heroicons/react/24/outline';

type Invite = {
  id: number;
  invite_code: string;
  created_at: string;
  session_count: number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

type InviteManagerProps = {
  interviewId: number;
};

type InviteInput = {
  name?: string;
  email?: string;
  phone?: string;
};

export const InviteManager: React.FC<InviteManagerProps> = ({ interviewId }) => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [inviteInputs, setInviteInputs] = useState<InviteInput[]>([
    { name: '', email: '', phone: '' },
  ]);

  useEffect(() => {
    async function fetchInvites() {
      try {
        const res = await fetch(`/api/interview/${interviewId}/invites`);
        if (!res.ok) throw new Error('Failed to load invites');
        const data = await res.json();
        setInvites(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInvites();
  }, [interviewId]);

  const addInviteRow = () => {
    setInviteInputs((prev) => [...prev, { name: '', email: '', phone: '' }]);
  };

  const removeInviteRow = (index: number) => {
    setInviteInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateInviteField = (index: number, field: keyof InviteInput, value: string) => {
    setInviteInputs((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const submitInvites = async () => {
    try {
      const res = await fetch(`/api/interview/${interviewId}/invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invites: inviteInputs }),
      });

      if (!res.ok) {
        throw new Error('Failed to create invites');
      }

      const created = await res.json();
      const createdAt = new Date().toISOString();
      const newInvites: Invite[] = created.map((item: any, idx: number) => ({
        ...item,
        created_at: createdAt,
        session_count: 0,
      }));

      setInvites((prev) => [...newInvites, ...prev]);
      setInviteInputs([{ name: '', email: '', phone: '' }]);
      setSidePanelOpen(false);
    } catch (err) {
      console.error('Invite creation error:', err);
      alert('Could not create invites. Please try again.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="relative">
      <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Candidate Invites</h3>
          <button
            onClick={() => setSidePanelOpen(true)}
            className="text-xs bg-yellow-300 border-2 border-black px-3 py-1 rounded shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            + Create Invites
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-gray-500">Loading invites...</p>
        ) : invites.length === 0 ? (
          <p className="text-xs text-gray-600">No invites yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 text-xs">
            {invites.map((invite) => {
              const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/interview/${interviewId}?token=${invite.invite_code}`;
              return (
                <li key={invite.invite_code} className="py-3">
                  <div className="flex justify-between items-start">
                    <div className="max-w-[80%]">
                      <p className="text-sm font-bold text-black">
                        {invite.name || 'Open Invite'}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-[11px] text-gray-700 break-all">{inviteUrl}</p>
                        <button
                          onClick={() => copyToClipboard(inviteUrl)}
                          title="Copy link"
                          className="text-gray-500 hover:text-black"
                        >
                          <ClipboardIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-gray-500 text-[10px]">
                        Created: {new Date(invite.created_at).toLocaleString()}
                      </p>
                      {invite.email && <p className="text-[10px] text-gray-500">📧 {invite.email}</p>}
                      {invite.phone && <p className="text-[10px] text-gray-500">📞 {invite.phone}</p>}
                    </div>
                    <div className="flex flex-col items-center text-[10px] font-semibold min-w-[60px]">
                      <span className="text-lg text-gray-900">{invite.session_count}</span>
                      <span className="text-gray-500">
                        {invite.session_count === 1 ? 'session' : 'sessions'}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {sidePanelOpen && (
        <div className="fixed inset-0 z-50 flex font-mono text-sm">
          <div className="relative w-full h-full flex">
            <div
              className="absolute inset-0 bg-black bg-opacity-30 z-0"
              onClick={() => setSidePanelOpen(false)}
            />

            <div className="relative ml-auto z-10 w-full max-w-lg bg-white border-l-2 border-black shadow-[4px_0_0_#000] h-full flex flex-col">
              <div className="p-6 border-b-2 border-black">
                <h2 className="text-xl font-bold leading-tight">Create Multiple Invites</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Add name, email, or phone to personalize invites. Leave blank for open invites.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="text-left border-b border-black">
                      <th className="py-1 pr-2">#</th>
                      <th className="py-1 pr-2">Name</th>
                      <th className="py-1 pr-2">Email</th>
                      <th className="py-1 pr-2">Phone</th>
                      <th className="py-1 pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inviteInputs.map((row, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-1 pr-2 text-gray-500">{index + 1}</td>
                        <td className="py-1 pr-2">
                          <input
                            type="text"
                            placeholder="Name"
                            value={row.name || ''}
                            onChange={(e) => updateInviteField(index, 'name', e.target.value)}
                            className="w-full border px-2 py-1 rounded"
                          />
                        </td>
                        <td className="py-1 pr-2">
                          <input
                            type="email"
                            placeholder="Email"
                            value={row.email || ''}
                            onChange={(e) => updateInviteField(index, 'email', e.target.value)}
                            className="w-full border px-2 py-1 rounded"
                          />
                        </td>
                        <td className="py-1 pr-2">
                          <input
                            type="tel"
                            placeholder="Phone"
                            value={row.phone || ''}
                            onChange={(e) => updateInviteField(index, 'phone', e.target.value)}
                            className="w-full border px-2 py-1 rounded"
                          />
                        </td>
                        <td className="py-1">
                          <button
                            onClick={() => removeInviteRow(index)}
                            className="text-red-600 hover:underline text-[11px]"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 text-center">
                  <button
                    onClick={addInviteRow}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    + Add Another Invite
                  </button>
                </div>
              </div>

              <div className="border-t-2 border-black p-4 flex justify-between items-center bg-white sticky bottom-0">
                <button
                  onClick={() => setSidePanelOpen(false)}
                  className="text-xs px-4 py-1 border-2 border-black rounded hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={submitInvites}
                  className="text-xs bg-black text-white px-4 py-1.5 rounded shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-transform"
                >
                  Create {inviteInputs.length} {inviteInputs.length === 1 ? 'Invite' : 'Invites'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
