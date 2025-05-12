// app/providers.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabaseClient';

const SessionContext = createContext<{
  session: any;
  userEmail: string | null;
}>({
  session: null,
  userEmail: null,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createClient()
  useEffect(() => {

 
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("SESSIONSSSSS XXX3",session)
      setSession(session);
      setUserEmail(session?.user?.email ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider value={{ session, userEmail }}>
      {children}
    </SessionContext.Provider>
  );
}

export const AuthProvider = SessionProvider;
export const useSession = () => useContext(SessionContext);