'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from '@/app/providers';

type Org = {
  id: number;
  name: string;
  // Add other org fields as needed
};

type OrgContextType = {
  org: Org | null;
  setOrg: (org: Org | null) => void;
};

const OrgContext = createContext<OrgContextType>({
  org: null,
  setOrg: () => {},
});

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [org, setOrg] = useState<Org | null>(null);
  const { session } = useSession();
  console.log("SESSIONSSSSS",session)
  useEffect(() => {
    if (!session) return; // Only fetch if logged in

    fetch('/api/organizations/me/default')
      .then(res => res.json())
      .then(data => {
        
      setOrg(data.org);
      });
  }, [session]);

  return (
    <OrgContext.Provider value={{ org, setOrg }}>
      {children}
    </OrgContext.Provider>
  );
}

export const useOrgContext = () => useContext(OrgContext);