'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/supabase/error-emitter';
import { SupabasePermissionError } from '@/supabase/errors';

export function SupabaseErrorListener() {
  useEffect(() => {
    const errorHandler = (error: SupabasePermissionError) => {
      console.error('Supabase Permission Error:', error);
      // You can add toast notifications or other error handling here
    };

    errorEmitter.on('permission-error', errorHandler);

    return () => {
      errorEmitter.off('permission-error', errorHandler);
    };
  }, []);

  return null;
}

