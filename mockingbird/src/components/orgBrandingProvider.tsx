'use client';
import React, { useEffect, useState } from 'react';
import { getSubdomain } from '@/utils/getSubDomain';

const orgConfigs: Record<string, { name: string; color: string; logo?: string }> = {
  org1: {
    name: 'Org 1',
    color: '#1e90ff',
    logo: 'https://birdicon.com/icons/svg/bluebird.svg',
  },
  org2: {
    name: 'Org 2',
    color: '#ff6347',
    logo: 'https://birdicon.com/icons/svg/cardinal.svg',
  },
  org3: {
    name: 'Org 3',
    color: '#32cd32',
    logo: 'https://birdicon.com/icons/svg/hummingbird.svg',
  },
};

export default function OrgBrandingProvider({ children }: { children: React.ReactNode }) {
  const [org, setOrg] = useState(orgConfigs['org1']);

  useEffect(() => {
    const host = window.location.host;
    const subdomain = getSubdomain(host);
    if (subdomain && orgConfigs[subdomain]) {
      setOrg(orgConfigs[subdomain]);
    }
  }, []);

  return (
    <div style={{ background: org.color, minHeight: '100vh' }}>
      <header className="p-4 flex items-center">
        {org.logo && <img src={org.logo} alt={org.name} style={{ height: 40, marginRight: 16 }} />}
        <h1 className="text-2xl font-bold">{org.name}</h1>
      </header>
      {children}
    </div>
  );
}