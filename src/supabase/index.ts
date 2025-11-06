'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

let supabaseInstance: SupabaseClient | null = null;

export function initializeSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseConfig.url, supabaseConfig.anonKey);
  }
  return supabaseInstance;
}

export * from './provider';
export * from './client-provider';
export * from './database/use-collection';
export * from './database/use-doc';
export * from './errors';
export * from './error-emitter';

