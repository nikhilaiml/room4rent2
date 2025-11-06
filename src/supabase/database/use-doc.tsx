'use client';

import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { useSupabaseClient } from '@/supabase';
import { errorEmitter } from '@/supabase/error-emitter';
import { SupabasePermissionError } from '@/supabase/errors';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: Error | null;
}

interface SupabaseDocRef {
  table: string;
  id: string;
  realtime?: boolean;
}

/**
 * React hook to subscribe to a single Supabase document in real-time.
 * Can accept either a SupabaseDocRef object or null/undefined.
 */
export function useDoc<T = any>(
  docRef: SupabaseDocRef | null | undefined
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (!docRef || !docRef.id) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Fetch the document
    supabase
      .from(docRef.table)
      .select('*')
      .eq('id', docRef.id)
      .single()
      .then(({ data: fetchedData, error: fetchError }) => {
        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // Document does not exist
            setData(null);
            setError(null);
          } else {
            const contextualError = new SupabasePermissionError({
              operation: 'get',
              path: `${docRef.table}/${docRef.id}`,
            });
            setError(contextualError);
            setData(null);
            errorEmitter.emit('permission-error', contextualError);
          }
          setIsLoading(false);
        } else {
          setData(fetchedData ? { ...fetchedData, id: fetchedData.id || docRef.id } : null);
          setError(null);
          setIsLoading(false);
        }
      });

    // Set up realtime subscription if enabled
    if (docRef.realtime !== false) {
      const channel = supabase
        .channel(`${docRef.table}_${docRef.id}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: docRef.table,
            filter: `id=eq.${docRef.id}`,
          },
          async (payload) => {
            // Refetch on change
            const { data: fetchedData, error: fetchError } = await supabase
              .from(docRef.table)
              .select('*')
              .eq('id', docRef.id)
              .single();
            
            if (!fetchError && fetchedData) {
              setData({ ...fetchedData, id: fetchedData.id || docRef.id });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [docRef, supabase]);

  return { data, isLoading, error };
}

