export type ServerErrorCode = 
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'TIMEOUT'
  | 'DEPENDENCY_FAILURE';

export interface ServerError {
  code: ServerErrorCode;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
  requestId?: string;
  retryable: boolean;
}

export class ServerErrorFactory {
  static notFound(resource: string, id?: string): ServerError {
    return { code: 'NOT_FOUND', message: `Resource not found: ${resource}${id ? ` (${id})` : ''}`, timestamp: Date.now(), retryable: false };
  }

  static validation(errors: string[]): ServerError {
    return { code: 'VALIDATION_ERROR', message: 'Validation failed', details: { errors }, timestamp: Date.now(), retryable: false };
  }

  static unauthorized(reason = 'Authentication required'): ServerError {
    return { code: 'UNAUTHORIZED', message: reason, timestamp: Date.now(), retryable: false };
  }

  static forbidden(reason = 'Access denied'): ServerError {
    return { code: 'FORBIDDEN', message: reason, timestamp: Date.now(), retryable: false };
  }

  static rateLimited(retryAfter: number): ServerError {
    return { code: 'RATE_LIMITED', message: `Rate limit exceeded. Retry after ${retryAfter}s`, details: { retryAfter }, timestamp: Date.now(), retryable: true };
  }

  static internal(message = 'Internal server error'): ServerError {
    return { code: 'INTERNAL_ERROR', message, timestamp: Date.now(), retryable: true };
  }

  static timeout(operation: string): ServerError {
    return { code: 'TIMEOUT', message: `Operation timed out: ${operation}`, timestamp: Date.now(), retryable: true };
  }

  static dependencyFailure(dependency: string, cause: string): ServerError {
    return { code: 'DEPENDENCY_FAILURE', message: `Dependency failed: ${dependency}`, details: { cause }, timestamp: Date.now(), retryable: true };
  }

  static toStatusCode(error: ServerError): number {
    const map: Record<ServerErrorCode, number> = {
      NOT_FOUND: 404, VALIDATION_ERROR: 400, UNAUTHORIZED: 401,
      FORBIDDEN: 403, RATE_LIMITED: 429, INTERNAL_ERROR: 500,
      TIMEOUT: 504, DEPENDENCY_FAILURE: 502,
    };
    return map[error.code];
  }
}
