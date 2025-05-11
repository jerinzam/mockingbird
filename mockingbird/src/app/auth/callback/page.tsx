'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function extractTokensFromHash(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return {
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
  };
}

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finalizeLogin = async () => {
      const { access_token, refresh_token } = extractTokensFromHash(window.location.hash);

      if (!access_token || !refresh_token) {
        console.error('[OAuth Callback] Missing access or refresh token.');
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error('[OAuth Callback] Failed to set session:', error.message);
        return;
      }

      // Ensure personal org exists for the user
      await fetch('/api/organizations/ensurePersonal', { method: 'POST' });

      router.push('/dashboard'); // Or wherever you want to redirect after login
    };

    finalizeLogin();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm font-mono">
      Completing login…
    </div>
  );
}