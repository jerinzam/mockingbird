// src/components/FeatureFlagRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrgContext } from '@/context/orgContext';
import { FEATURE_FLAGS } from '@/config/featureFlags';
import type { FeatureFlagKey } from '@/config/featureFlags';

interface FeatureFlagRouteProps {
  children: React.ReactNode;
  requiredFeature: FeatureFlagKey;
}

export function FeatureFlagRoute({ children, requiredFeature }: FeatureFlagRouteProps) {
  const router = useRouter();
  const { isFeatureEnabled } = useOrgContext();

  useEffect(() => {
    if (!isFeatureEnabled(requiredFeature)) {
      router.push('/dashboard?error=' + encodeURIComponent(FEATURE_FLAGS[requiredFeature].disabledMessage));
    }
  }, [isFeatureEnabled, requiredFeature, router]);

  if (!isFeatureEnabled(requiredFeature)) {
    return null;
  }

  return <>{children}</>;
}