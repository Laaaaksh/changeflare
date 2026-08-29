import { createHmac } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { createSessionToken, hashPassword, verifyPassword, verifySessionToken } from "@/lib/auth";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-session-secret-at-least-16-chars";
});

describe("password hashing", () => {
  it("verifies a correct password", () => {
    const hash = hashPassword("correct horse battery staple");
    expect(verifyPassword("correct horse battery staple", hash)).toBe(true);
  });

  it("rejects an incorrect password", () => {
    const hash = hashPassword("correct horse battery staple");
    expect(verifyPassword("wrong password", hash)).toBe(false);
  });

  it("salts each hash differently even for the same password", () => {
    const a = hashPassword("same password");
    const b = hashPassword("same password");
    expect(a).not.toBe(b);
    expect(verifyPassword("same password", a)).toBe(true);
    expect(verifyPassword("same password", b)).toBe(true);
  });

  it("rejects malformed stored hashes instead of throwing", () => {
    expect(verifyPassword("anything", "not-a-real-hash")).toBe(false);
    expect(verifyPassword("anything", "")).toBe(false);
  });
});

describe("session tokens", () => {
  it("round-trips a valid token back to the same userId", () => {
    const token = createSessionToken("user_123");
    expect(verifySessionToken(token)).toEqual({ userId: "user_123" });
  });

  it("rejects a tampered payload", () => {
    const token = createSessionToken("user_123");
    const [, signature] = token.split(".");
    const tamperedPayload = Buffer.from(JSON.stringify({ sub: "someone_else", exp: Date.now() + 100000 })).toString(
      "base64url",
    );
    expect(verifySessionToken(`${tamperedPayload}.${signature}`)).toBeNull();
  });

  it("rejects a token signed with a different secret", () => {
    const token = createSessionToken("user_123");
    const original = process.env.SESSION_SECRET;
    process.env.SESSION_SECRET = "a-completely-different-secret-value";
    expect(verifySessionToken(token)).toBeNull();
    process.env.SESSION_SECRET = original;
  });

  it("rejects malformed or empty tokens", () => {
    expect(verifySessionToken(null)).toBeNull();
    expect(verifySessionToken("")).toBeNull();
    expect(verifySessionToken("not-a-real-token")).toBeNull();
  });

  it("rejects an expired token", () => {
    const encoded = Buffer.from(JSON.stringify({ sub: "user_123", exp: Date.now() - 1000 })).toString("base64url");
    // Re-sign the expired payload the same way createSessionToken would.
    const signature = createHmac("sha256", process.env.SESSION_SECRET!).update(encoded).digest("base64url");
    expect(verifySessionToken(`${encoded}.${signature}`)).toBeNull();
  });
});
