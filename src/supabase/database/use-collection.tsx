'use client';

import { useState, useEffect, useMemo } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { useSupabaseClient } from '@/supabase';
import { errorEmitter } from '@/supabase/error-emitter';
import { SupabasePermissionError } from '@/supabase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: Error | null;
}

interface SupabaseQuery {
  table: string;
  filter?: (query: any) => any;
  orderBy?: { column: string; ascending?: boolean };
  realtime?: boolean;
}

/**
 * React hook to subscribe to a Supabase table in real-time.
 * Can accept either a SupabaseQuery object or null/undefined.
 */
export function useCollection<T = any>(
  query: SupabaseQuery | null | undefined
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (!query) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    let supabaseQuery = supabase.from(query.table).select('*');
    
    if (query.filter) {
      supabaseQuery = query.filter(supabaseQuery);
    }

    if (query.orderBy) {
      supabaseQuery = supabaseQuery.order(query.orderBy.column, { ascending: query.orderBy.ascending ?? true });
    }

    // Initial fetch
    supabaseQuery.then(({ data: fetchedData, error: fetchError }) => {
      if (fetchError) {
        const contextualError = new SupabasePermissionError({
          operation: 'list',
          path: query.table,
        });
        setError(contextualError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      } else {
        const results: ResultItemType[] = (fetchedData || []).map((item: any) => ({
          ...item,
          id: item.id || item.uuid || crypto.randomUUID(),
        }));
        setData(results);
        setError(null);
        setIsLoading(false);
      }
    });

    // Set up realtime subscription if enabled
    if (query.realtime !== false) {
      const channel = supabase
        .channel(`${query.table}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: query.table,
          },
          async (payload) => {
            // Refetch data on any change
            let refetchQuery = supabase.from(query.table).select('*');
            if (query.filter) {
              refetchQuery = query.filter(refetchQuery);
            }
            if (query.orderBy) {
              refetchQuery = refetchQuery.order(query.orderBy.column, { ascending: query.orderBy.ascending ?? true });
            }
            const { data: fetchedData, error: fetchError } = await refetchQuery;
            if (!fetchError && fetchedData) {
              const results: ResultItemType[] = fetchedData.map((item: any) => ({
                ...item,
                id: item.id || item.uuid || crypto.randomUUID(),
              }));
              setData(results);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [query, supabase]);

  return { data, isLoading, error };
}

