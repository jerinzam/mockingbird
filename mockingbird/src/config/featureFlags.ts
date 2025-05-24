export const FEATURE_FLAGS = {
    interview_creator: {
      key: 'interview_creator',
      label: 'Interview Creator',
      description: 'Enable creation of new interviews',
      defaultEnabled: true,
      disabledMessage: 'Interview creation is currently disabled for your organization. Only on request.',
    },
    // Add more feature flags here
  } as const;
  
  export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;