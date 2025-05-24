// src/context/orgContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from '@/app/providers';

type FeatureFlag = {
  is_enabled: boolean;
  last_updated?: string;
  updated_by?: string;
};

type FeatureFlags = {
  [key: string]: FeatureFlag;
};

type Org = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website?: string;
  is_active: boolean;
  settings: Record<string, any>;
  feature_flags: FeatureFlags;
  created_at: string;
  updated_at: string;
  type: 'personal' | 'team' | 'institutional';
};

type OrgContextType = {
  org: Org | null;
  setOrg: (org: Org | null) => void;
  isFeatureEnabled: (featureName: string) => boolean;
  updateFeatureFlag: (featureName: string, enabled: boolean) => Promise<void>;
};

const OrgContext = createContext<OrgContextType>({
  org: null,
  setOrg: () => {},
  isFeatureEnabled: () => false,
  updateFeatureFlag: async () => {},
});

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [org, setOrg] = useState<Org | null>(null);
  const { session } = useSession();

  useEffect(() => {
    if (!session) return; // Only fetch if logged in

    fetch('/api/organizations/me/default')
      .then(res => res.json())
      .then(data => {
        setOrg(data.org);
      })
      .catch(error => {
        console.error('Error fetching organization:', error);
      });
  }, [session]);

  const isFeatureEnabled = (featureName: string): boolean => {
    return org?.feature_flags?.[featureName]?.is_enabled ?? false;
  };

  const updateFeatureFlag = async (featureName: string, enabled: boolean) => {
    if (!org?.id) return;

    try {
      const response = await fetch(`/api/organizations/${org.id}/feature-flags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureName, enabled }),
      });

      if (!response.ok) throw new Error('Failed to update feature flag');

      const { feature_flags } = await response.json();

      setOrg(prev => {
        if (!prev) return null;
        return {
          ...prev,
          feature_flags,
          updated_at: new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error('Error updating feature flag:', error);
      throw error;
    }
  };

  return (
    <OrgContext.Provider value={{ org, setOrg, isFeatureEnabled, updateFeatureFlag }}>
      {children}
    </OrgContext.Provider>
  );
}

export const useOrgContext = () => useContext(OrgContext);