export class SupabasePermissionError extends Error {
  operation: 'get' | 'list' | 'write' | 'create' | 'update' | 'delete';
  path: string;
  requestResourceData?: any;

  constructor({
    operation,
    path,
    requestResourceData,
  }: {
    operation: 'get' | 'list' | 'write' | 'create' | 'update' | 'delete';
    path: string;
    requestResourceData?: any;
  }) {
    super(`Supabase permission error: ${operation} operation on ${path}`);
    this.name = 'SupabasePermissionError';
    this.operation = operation;
    this.path = path;
    this.requestResourceData = requestResourceData;
  }
}

