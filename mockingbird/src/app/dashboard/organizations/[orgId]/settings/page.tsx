// mockingbird/mockingbird/src/app/dashboard/organizations/[orgId]/settings/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { MockingbirdHeader } from '@/components/mockingBirdHeader';

type OrgSettings = {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  type: 'personal' | 'team' | 'institutional';
  settings: {
    default_vapi_agent_id?: number;
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
    branding?: {
      primary_color?: string;
      secondary_color?: string;
    };
    features?: {
      ai_interviews?: boolean;
      custom_branding?: boolean;
      team_collaboration?: boolean;
    };
  };
};

type VapiAgent = {
  id: number;
  name: string;
  vapi_agent_id: string;
  api_key: string;
  created_at: string;
};

export default function OrgSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;

  const [org, setOrg] = useState<OrgSettings | null>(null);
  const [agents, setAgents] = useState<VapiAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', vapi_agent_id: '', api_key: '' });
  const [activeSection, setActiveSection] = useState('basic');

  // Side navigation options
  const sections = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'vapi', label: 'Vapi Agents' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'features', label: 'Features' }
  ];

  // Fetch org settings and agents
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const orgRes = await fetch(`/api/organizations/${orgId}`);
        const orgData = await orgRes.json();
        if (!orgData.success) throw new Error(orgData.error || 'Failed to fetch organization settings');
        setOrg(orgData.org);

        const agentsRes = await fetch(`/api/organizations/${orgId}/vapi-agents`);
        const agentsData = await agentsRes.json();
        setAgents(agentsData.agents || []);
      } catch (error) {
        toast.error('Failed to load organization or agents');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [orgId]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrg(prev => prev ? { ...prev, [name]: value } : null);
  };

  // Handle settings changes
  const handleSettingsChange = (path: string, value: any) => {
    setOrg(prev => {
      if (!prev) return null;
      const newSettings = { ...prev.settings };
      const keys = path.split('.');
      let current: any = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return { ...prev, settings: newSettings };
    });
  };

  // Save org settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(org),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to save settings');
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Add Vapi agent
  const addAgent = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/vapi-agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent),
      });
      if (!res.ok) throw new Error('Failed to add agent');
      setNewAgent({ name: '', vapi_agent_id: '', api_key: '' });
      // Refresh agents
      const agentsRes = await fetch(`/api/organizations/${orgId}/vapi-agents`);
      const agentsData = await agentsRes.json();
      setAgents(agentsData.agents || []);
      toast.success('Agent added');
    } catch {
      toast.error('Failed to add agent');
    } finally {
      setSaving(false);
    }
  };

  // Set default agent
  const setDefaultAgent = async (agentId: number) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(org ? { ...org, settings: { ...org.settings, default_vapi_agent_id: agentId } } : { settings: { default_vapi_agent_id: agentId } }),
      });
      if (!res.ok) throw new Error('Failed to set default agent');
      setOrg(prev => prev ? ({
        ...prev,
        settings: { ...prev.settings, default_vapi_agent_id: agentId }
      }) : prev);
      toast.success('Default agent set');
    } catch {
      toast.error('Failed to set default agent');
    } finally {
      setSaving(false);
    }
  };

  // Delete agent
  const deleteAgent = async (agentId: number) => {
    setSaving(true);
    try {
      await fetch(`/api/organizations/${orgId}/vapi-agents/${agentId}`, { method: 'DELETE' });
      // Refresh agents
      const agentsRes = await fetch(`/api/organizations/${orgId}/vapi-agents`);
      const agentsData = await agentsRes.json();
      setAgents(agentsData.agents || []);
      toast.success('Agent deleted');
    } catch {
      toast.error('Failed to delete agent');
    } finally {
      setSaving(false);
    }
  };

  // Render content based on active section
  const renderContent = () => {
    if (!org) return null;

    switch (activeSection) {
      case 'basic':
        return (
          <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_#000] p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={org.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-black rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={org.description || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-black rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  name="website"
                  value={org.website || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-black rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );
      case 'vapi':
        return (
          <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_#000] p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Vapi Agents</h2>
            <ul className="mb-4">
              {agents.map(agent => (
                <li key={agent.id} className="flex items-center justify-between border-b py-2">
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-xs text-gray-500">ID: {agent.vapi_agent_id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDefaultAgent(agent.id)}
                      disabled={org.settings.default_vapi_agent_id === agent.id || saving}
                      className={`px-2 py-1 rounded text-xs ${org.settings.default_vapi_agent_id === agent.id ? 'bg-green-200 text-green-800' : 'bg-gray-200 hover:bg-green-100'}`}
                    >
                      {org.settings.default_vapi_agent_id === agent.id ? 'Default' : 'Set Default'}
                    </button>
                    <button
                      onClick={() => deleteAgent(agent.id)}
                      disabled={saving}
                      className="px-2 py-1 rounded text-xs bg-red-200 text-red-800 hover:bg-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-2">Add Vapi Agent</h3>
              <div className="flex flex-col gap-2">
                <input
                  placeholder="Name"
                  value={newAgent.name}
                  onChange={e => setNewAgent(a => ({ ...a, name: e.target.value }))}
                  className="border-2 border-black rounded px-3 py-2"
                />
                <input
                  placeholder="Vapi Agent ID"
                  value={newAgent.vapi_agent_id}
                  onChange={e => setNewAgent(a => ({ ...a, vapi_agent_id: e.target.value }))}
                  className="border-2 border-black rounded px-3 py-2"
                />
                <input
                  placeholder="API Key"
                  value={newAgent.api_key}
                  onChange={e => setNewAgent(a => ({ ...a, api_key: e.target.value }))}
                  className="border-2 border-black rounded px-3 py-2"
                />
                <button
                  onClick={addAgent}
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Agent'}
                </button>
              </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_#000] p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                <select
                  value={org.settings.theme || 'system'}
                  onChange={(e) => handleSettingsChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <input
                  type="color"
                  value={org.settings.branding?.primary_color || '#000000'}
                  onChange={(e) => handleSettingsChange('branding.primary_color', e.target.value)}
                  className="w-full h-10 px-1 py-1 border-2 border-black rounded-md"
                />
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_#000] p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-notifications"
                  checked={org.settings.notifications?.email ?? true}
                  onChange={(e) => handleSettingsChange('notifications.email', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-2 border-black rounded"
                />
                <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
                  Email Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="push-notifications"
                  checked={org.settings.notifications?.push ?? true}
                  onChange={(e) => handleSettingsChange('notifications.push', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-2 border-black rounded"
                />
                <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-700">
                  Push Notifications
                </label>
              </div>
            </div>
          </div>
        );
      case 'features':
        return (
          <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_#000] p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ai-interviews"
                  checked={org.settings.features?.ai_interviews ?? true}
                  onChange={(e) => handleSettingsChange('features.ai_interviews', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-2 border-black rounded"
                />
                <label htmlFor="ai-interviews" className="ml-2 block text-sm text-gray-700">
                  AI-Powered Interviews
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="custom-branding"
                  checked={org.settings.features?.custom_branding ?? false}
                  onChange={(e) => handleSettingsChange('features.custom_branding', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-2 border-black rounded"
                />
                <label htmlFor="custom-branding" className="ml-2 block text-sm text-gray-700">
                  Custom Branding
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="team-collaboration"
                  checked={org.settings.features?.team_collaboration ?? true}
                  onChange={(e) => handleSettingsChange('features.team_collaboration', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-2 border-black rounded"
                />
                <label htmlFor="team-collaboration" className="ml-2 block text-sm text-gray-700">
                  Team Collaboration
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] text-[#222222] font-mono">
        <MockingbirdHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] text-[#222222] font-mono">
        <MockingbirdHeader />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Organization not found</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#222222] font-mono">
      <MockingbirdHeader />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-4 py-2 bg-yellow-300 border-2 border-black rounded-md 
                shadow-[3px_3px_0_#000] 
                hover:translate-x-[2px] hover:translate-y-[2px] 
                hover:shadow-[2px_2px_0_#000] 
                transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          <p className="text-gray-600 text-sm">Manage your organization's settings and Vapi agents</p>
        </div>

        <div className="flex gap-8">
          {/* Side Navigation */}
          <div className="w-48 bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_#000] p-4">
            <ul className="space-y-2">
              {sections.map(section => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded ${activeSection === section.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                  >
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}