// src/app/[org]/layout.tsx
'use client';

import OrgBrandingProvider from '@/components/orgBrandingProvider';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { useSession } from '@/app/providers';
import { AuthProvider } from '@/app/providers';

async function getOrgSettings(orgSlug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/organizations/by-slug/${orgSlug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.org?.settings || null;
}

export default function OrgLayout({ children, params }: { children: React.ReactNode, params: Promise<{ org: string }> }) {
  const [isLoading, setIsLoading] = useState(false);
  const [orgSettings, setOrgSettings] = useState<any>(null);
  const [orgSlug, setOrgSlug] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { session } = useSession();
  const supabase = createClient()

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log("in org layout WW23", user, error);
      setUser(user);
    };
    fetchUser();
  }, []);

  // Initialize org slug from params
  useEffect(() => {
    params.then(({ org }) => setOrgSlug(org));
  }, [params]);

  // Fetch org settings when org slug is available
  useEffect(() => {
    console.log("in org layout XXXXXX2W", orgSlug);
    if (orgSlug) {
      getOrgSettings(orgSlug).then(settings => setOrgSettings(settings));
    }
  }, [orgSlug]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthProvider>
      <OrgBrandingProvider 
        orgSettings={orgSettings}
        session={session}
        isLoading={isLoading}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      >
        {children}
      </OrgBrandingProvider>
    </AuthProvider>
  );
}