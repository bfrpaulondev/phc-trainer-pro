import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.ts";

const app = createApp();

describe("GET /api/health", () => {
  it("responde 200 com identificação do serviço (sem precisar de BD)", async () => {
    const r = await request(app).get("/api/health");
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ ok: true, service: "phc-trainer-api" });
    expect(typeof r.body.version).toBe("string");
    expect(typeof r.body.mongo).toBe("boolean");
  });
});

describe("rotas desconhecidas", () => {
  it("devolve 404 JSON", async () => {
    const r = await request(app).get("/api/nao-existe");
    expect(r.status).toBe(404);
    expect(r.body.error).toBeTruthy();
  });
});

describe("CORS", () => {
  it("rejeita origens fora da allowlist", async () => {
    const r = await request(app).get("/api/health").set("Origin", "https://malvado.example.com");
    // o middleware de cors aborta com erro → 500 tratado
    expect([403, 500]).toContain(r.status);
  });
});

describe("auth sem credenciais", () => {
  it("GET /api/auth/me exige token", async () => {
    const r = await request(app).get("/api/auth/me");
    expect(r.status).toBe(401);
  });
});
