import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, sha256 } from "../src/lib/crypto.ts";
import {
  hashRefreshToken,
  newRefreshToken,
  signAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../src/lib/jwt.ts";

describe("crypto (AES-256-GCM)", () => {
  it("roundtrip de segredo", () => {
    const enc = encryptSecret("sk-super-secreta-123");
    expect(enc.startsWith("v1:")).toBe(true);
    expect(enc).not.toContain("sk-super-secreta-123");
    expect(decryptSecret(enc)).toBe("sk-super-secreta-123");
  });

  it("deteta adulteração", () => {
    const enc = encryptSecret("chave");
    const parts = enc.split(":");
    parts[3] = "00" + parts[3].slice(2);
    expect(() => decryptSecret(parts.join(":"))).toThrow();
  });

  it("sha256 determinístico", () => {
    expect(sha256("abc")).toBe(sha256("abc"));
  });
});

describe("jwt", () => {
  it("access token ida e volta com claims", () => {
    const t = signAccessToken({ sub: "u1", role: "trainer", teamId: "t1" });
    const c = verifyAccessToken(t);
    expect(c).toMatchObject({ sub: "u1", role: "trainer", teamId: "t1" });
  });

  it("access token inválido lança", () => {
    expect(() => verifyAccessToken("garbage")).toThrow();
  });

  it("refresh token: jti + hash consistentes", () => {
    const rt = newRefreshToken("u1");
    expect(rt.token.split(".").length).toBe(3);
    expect(rt.tokenHash).toBe(hashRefreshToken(rt.token));
    expect(verifyRefreshToken(rt.token)).toMatchObject({ sub: "u1", jti: rt.jti });
    expect(rt.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});
