'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { SupabaseErrorListener } from '@/components/SupabaseErrorListener';

interface SupabaseProviderProps {
  children: ReactNode;
  supabase: SupabaseClient;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Supabase context
export interface SupabaseContextState {
  areServicesAvailable: boolean;
  supabase: SupabaseClient | null;
  // User authentication state
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useSupabase()
export interface SupabaseServicesAndUser {
  supabase: SupabaseClient;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const SupabaseContext = createContext<SupabaseContextState | undefined>(undefined);

/**
 * SupabaseProvider manages and provides Supabase services and user authentication state.
 */
export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({
  children,
  supabase,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  // Effect to subscribe to Supabase auth state changes
  useEffect(() => {
    if (!supabase) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Supabase service not provided.") });
      return;
    }

    setUserAuthState({ user: null, isUserLoading: true, userError: null });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("SupabaseProvider: getSession error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      } else {
        setUserAuthState({ user: session?.user ?? null, isUserLoading: false, userError: null });
      }
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUserAuthState({ 
          user: session?.user ?? null, 
          isUserLoading: false, 
          userError: null 
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Memoize the context value
  const contextValue = useMemo((): SupabaseContextState => {
    const servicesAvailable = !!supabase;
    return {
      areServicesAvailable: servicesAvailable,
      supabase: servicesAvailable ? supabase : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [supabase, userAuthState]);

  return (
    <SupabaseContext.Provider value={contextValue}>
      <SupabaseErrorListener />
      {children}
    </SupabaseContext.Provider>
  );
};

/**
 * Hook to access core Supabase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useSupabase = (): SupabaseServicesAndUser => {
  const context = useContext(SupabaseContext);

  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider.');
  }

  if (!context.areServicesAvailable || !context.supabase) {
    throw new Error('Supabase core services not available. Check SupabaseProvider props.');
  }

  return {
    supabase: context.supabase,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/** Hook to access Supabase Auth instance. */
export const useAuth = (): SupabaseClient['auth'] => {
  const { supabase } = useSupabase();
  return supabase.auth;
};

/** Hook to access Supabase client instance. */
export const useSupabaseClient = (): SupabaseClient => {
  const { supabase } = useSupabase();
  return supabase;
};

type MemoSupabase<T> = T & {__memo?: boolean};

export function useMemoSupabase<T>(factory: () => T, deps: DependencyList): T | (MemoSupabase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoSupabase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useSupabase();
  return { user, isUserLoading, userError };
};

