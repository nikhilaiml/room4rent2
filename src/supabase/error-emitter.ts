import { EventEmitter } from 'events';
import { SupabasePermissionError } from './errors';

export const errorEmitter = new EventEmitter();

// Type-safe event listener helpers (optional but recommended)
export function onPermissionError(listener: (error: SupabasePermissionError) => void) {
  errorEmitter.on('permission-error', listener);
  return () => errorEmitter.off('permission-error', listener);
}

