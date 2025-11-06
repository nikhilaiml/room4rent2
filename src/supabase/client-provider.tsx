'use client';

import React, { useMemo, type ReactNode } from 'react';
import { SupabaseProvider } from '@/supabase/provider';
import { initializeSupabase } from '@/supabase';

interface SupabaseClientProviderProps {
  children: ReactNode;
}

export function SupabaseClientProvider({ children }: SupabaseClientProviderProps) {
  const supabase = useMemo(() => {
    // Initialize Supabase on the client side, once per component mount.
    return initializeSupabase();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <SupabaseProvider supabase={supabase}>
      {children}
    </SupabaseProvider>
  );
}

