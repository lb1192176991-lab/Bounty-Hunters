// Centralized server error types using Effect.Data.TaggedEnum
// Issue: https://github.com/UnsafeLabs/Bounty-Hunters/issues/861

import * as Data from "effect/Data";

/**
 * NetworkError - Network-related failures (upstream API unreachable, DNS, TLS)
 */
export class NetworkError extends Data.TaggedError("NetworkError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly timestamp?: Date;
}> {}

/**
 * DatabaseError - Database/storage-layer failures
 */
export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly timestamp?: Date;
}> {}

/**
 * AuthError - Authentication/authorization failures
 */
export class AuthError extends Data.TaggedError("AuthError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly timestamp?: Date;
  readonly status?: 400 | 401 | 403 | 500;
}> {}

/**
 * GitError - Git/Source control operation failures
 */
export class GitError extends Data.TaggedError("GitError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly timestamp?: Date;
}> {}

/**
 * ConfigError - Configuration/invalid state failures
 */
export class ConfigError extends Data.TaggedError("ConfigError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly timestamp?: Date;
}> {}

/**
 * ValidationError - Input/data validation failures
 */
export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly timestamp?: Date;
}> {}

/**
 * Union type covering all server error categories.
 */
export type ServerError =
  | NetworkError
  | DatabaseError
  | AuthError
  | GitError
  | ConfigError
  | ValidationError;

/**
 * Maps error tags to HTTP status codes for API responses.
 */
export function errorToResponse(error: { readonly _tag: string }): {
  readonly status: number;
  readonly body: { readonly error: string; readonly _tag: string };
} {
  const status = (() => {
    switch (error._tag) {
      case "AuthError": return 401;
      case "ValidationError": return 400;
      case "DatabaseError": return 500;
      case "NetworkError": return 502;
      case "ConfigError": return 500;
      case "GitError": return 422;
      default: return 500;
    }
  })();

  return {
    status,
    body: { error: error._tag, _tag: error._tag },
  };
}

/**
 * Formats errors for structured logging.
 * Produces JSON with tag, message, stack trace, and timestamp.
 */
export function errorToLog(error: unknown): Record<string, unknown> {
  const now = new Date().toISOString();

  if (isServerError(error)) {
    return {
      tag: error._tag,
      message: "message" in error ? (error as { message: string }).message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: now,
      cause: "cause" in error ? (error as { cause: unknown }).cause : undefined,
    };
  }

  if (error instanceof Error) {
    return {
      tag: "UnknownError",
      message: error.message,
      stack: error.stack,
      timestamp: now,
    };
  }

  return {
    tag: "UnknownError",
    message: String(error),
    timestamp: now,
  };
}

/**
 * Type guard: checks if an unknown value is a known ServerError.
 */
export function isServerError(error: unknown): error is ServerError {
  if (error === null || error === undefined || typeof error !== "object") {
    return false;
  }
  const candidate = error as { _tag?: string };
  if (typeof candidate._tag !== "string") {
    return false;
  }
  switch (candidate._tag) {
    case "NetworkError":
    case "DatabaseError":
    case "AuthError":
    case "GitError":
    case "ConfigError":
    case "ValidationError":
      return true;
    default:
      return false;
  }
}

/**
 * Convert a ServerError to an HTTP response status code.
 */
export function serverErrorToStatus(error: ServerError): number {
  return errorToResponse(error).status;
}

/**
 * Convert a ServerError to a loggable JSON object.
 */
export function serverErrorToLog(error: ServerError): Record<string, unknown> {
  return errorToLog(error);
}
