import { describe, it, expect } from "vitest";
import * as Errors from "./errors.ts";

describe("ServerError types", () => {
  it("should create a NetworkError with message and optional fields", () => {
    const err = new Errors.NetworkError({ message: "Connection refused" });
    expect(err._tag).toBe("NetworkError");
    expect(err.message).toBe("Connection refused");
  });

  it("should create a DatabaseError with message and cause", () => {
    const cause = new Error("Underlying DB error");
    const err = new Errors.DatabaseError({ message: "Query failed", cause });
    expect(err._tag).toBe("DatabaseError");
    expect(err.message).toBe("Query failed");
    expect(err.cause).toBe(cause);
  });

  it("should create an AuthError with status", () => {
    const err = new Errors.AuthError({ message: "Unauthorized", status: 401 });
    expect(err._tag).toBe("AuthError");
    expect(err.message).toBe("Unauthorized");
    expect(err.status).toBe(401);
  });

  it("should create a GitError with timestamp", () => {
    const ts = new Date();
    const err = new Errors.GitError({ message: "Merge conflict", timestamp: ts });
    expect(err._tag).toBe("GitError");
    expect(err.timestamp).toBe(ts);
  });

  it("should create a ConfigError", () => {
    const err = new Errors.ConfigError({ message: "Missing config key" });
    expect(err._tag).toBe("ConfigError");
  });

  it("should create a ValidationError", () => {
    const err = new Errors.ValidationError({ message: "Invalid input" });
    expect(err._tag).toBe("ValidationError");
  });
});

describe("errorToResponse", () => {
  it("should map AuthError to 401", () => {
    const resp = Errors.errorToResponse(new Errors.AuthError({ message: "Unauthorized", status: 401 }));
    expect(resp.status).toBe(401);
    expect(resp.body.error).toBe("AuthError");
  });

  it("should map ValidationError to 400", () => {
    expect(Errors.errorToResponse(new Errors.ValidationError({ message: "x" })).status).toBe(400);
  });

  it("should map DatabaseError to 500", () => {
    expect(Errors.errorToResponse(new Errors.DatabaseError({ message: "x" })).status).toBe(500);
  });

  it("should map NetworkError to 502", () => {
    expect(Errors.errorToResponse(new Errors.NetworkError({ message: "x" })).status).toBe(502);
  });

  it("should map ConfigError to 500", () => {
    expect(Errors.errorToResponse(new Errors.ConfigError({ message: "x" })).status).toBe(500);
  });

  it("should map GitError to 422", () => {
    expect(Errors.errorToResponse(new Errors.GitError({ message: "x" })).status).toBe(422);
  });
});

describe("errorToLog", () => {
  it("should produce structured JSON for ServerError", () => {
    const err = new Errors.ValidationError({ message: "Invalid email" });
    const log = Errors.errorToLog(err);
    expect(log.tag).toBe("ValidationError");
    expect(log.message).toBe("Invalid email");
    expect(log.timestamp).toBeDefined();
  });

  it("should include cause for ServerError with cause", () => {
    const cause = new Error("Root cause");
    const err = new Errors.DatabaseError({ message: "Query failed", cause });
    const log = Errors.errorToLog(err);
    expect(log.cause).toBe(cause);
  });

  it("should handle plain Error objects", () => {
    const err = new Error("Something went wrong");
    const log = Errors.errorToLog(err);
    expect(log.tag).toBe("UnknownError");
    expect(log.message).toBe("Something went wrong");
    expect(log.stack).toBeDefined();
  });

  it("should handle non-Error values", () => {
    const log = Errors.errorToLog("just a string");
    expect(log.tag).toBe("UnknownError");
    expect(log.message).toBe("just a string");
  });
});

describe("isServerError", () => {
  it("should return true for NetworkError", () => {
    expect(Errors.isServerError(new Errors.NetworkError({ message: "test" }))).toBe(true);
  });

  it("should return false for plain Error", () => {
    expect(Errors.isServerError(new Error("test"))).toBe(false);
  });

  it("should return false for null", () => {
    expect(Errors.isServerError(null)).toBe(false);
  });

  it("should return false for strings", () => {
    expect(Errors.isServerError("error")).toBe(false);
  });
});

describe("serverErrorToStatus and serverErrorToLog", () => {
  it("serverErrorToStatus should return correct status", () => {
    expect(Errors.serverErrorToStatus(new Errors.GitError({ message: "conflict" }))).toBe(422);
  });

  it("serverErrorToLog should return structured JSON", () => {
    const log = Errors.serverErrorToLog(new Errors.NetworkError({ message: "timeout" }));
    expect(log.tag).toBe("NetworkError");
    expect(log.timestamp).toBeDefined();
  });
});

describe("Pattern matching with Effect.Match", () => {
  it("should be compatible with Effect.Match", async () => {
    const { pipe } = await import("effect/Function");
    const { Match } = await import("effect/Match");
    const err = new Errors.DatabaseError({ message: "DB down" }) as Errors.ServerError;

    const result = pipe(
      err,
      Match.value,
      Match.tag("NetworkError", () => "network"),
      Match.tag("DatabaseError", () => "database"),
      Match.tag("AuthError", () => "auth"),
      Match.tag("GitError", () => "git"),
      Match.tag("ConfigError", () => "config"),
      Match.tag("ValidationError", () => "validation"),
      Match.exhaustive,
    );

    expect(result).toBe("database");
  });
});
