// src/context/featureFlagContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useOrgContext } from './orgContext';

interface FeatureFlag {
  is_enabled: boolean;
  last_updated?: string;
  updated_by?: string;
}

interface FeatureFlags {
  [key: string]: FeatureFlag;
}

interface FeatureFlagContextType {
  isFeatureEnabled: (featureName: string) => boolean;
  getAllFeatureFlags: () => FeatureFlags;
  updateFeatureFlag: (featureName: string, enabled: boolean) => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextType>({
  isFeatureEnabled: () => false,
  getAllFeatureFlags: () => ({}),
  updateFeatureFlag: async () => {},
});

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const { org } = useOrgContext();
  const [flags, setFlags] = useState<FeatureFlags>({});

  useEffect(() => {
    if (org?.feature_flags) {
      setFlags(org.feature_flags);
    }
  }, [org]);

  const isFeatureEnabled = (featureName: string): boolean => {
    return flags[featureName]?.is_enabled ?? false;
  };

  const getAllFeatureFlags = (): FeatureFlags => {
    return flags;
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

      setFlags(prev => ({
        ...prev,
        [featureName]: {
          is_enabled: enabled,
          last_updated: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error('Error updating feature flag:', error);
      throw error;
    }
  };

  return (
    <FeatureFlagContext.Provider value={{ isFeatureEnabled, getAllFeatureFlags, updateFeatureFlag }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export const useFeatureFlag = () => useContext(FeatureFlagContext);