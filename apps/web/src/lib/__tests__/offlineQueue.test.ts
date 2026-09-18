import { beforeEach, describe, expect, it } from "vitest";
import {
  clearQueue,
  enqueue,
  isNetworkError,
  isQueueable,
  loadQueue,
  queueLength,
  saveQueue,
} from "../offlineQueue.ts";

// localStorage fake (ambiente node)
const mem = new Map<string, string>();
(globalThis as unknown as { localStorage: unknown }).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
};

beforeEach(() => {
  mem.clear();
});

describe("offlineQueue", () => {
  it("enqueue preserva ordem e conteúdo", () => {
    enqueue("POST", "/api/progress/reps", { labId: "L00" });
    enqueue("POST", "/api/progress/steps", { labId: "L00", index: 1 });
    const q = loadQueue();
    expect(q).toHaveLength(2);
    expect(q[0].path).toBe("/api/progress/reps");
    expect(q[1].body).toMatchObject({ index: 1 });
    expect(queueLength()).toBe(2);
  });

  it("saveQueue limita a 200 entradas", () => {
    const many = Array.from({ length: 250 }, (_, i) => ({
      id: `x${i}`,
      method: "POST",
      path: "/api/progress/reps",
      ts: i,
    }));
    saveQueue(many);
    expect(loadQueue().length).toBe(200);
  });

  it("clearQueue esvazia", () => {
    enqueue("POST", "/api/progress/reps", {});
    clearQueue();
    expect(queueLength()).toBe(0);
  });

  it("isQueueable: só mutações de progresso", () => {
    expect(isQueueable("/api/progress/reps", "POST")).toBe(true);
    expect(isQueueable("/api/progress", "PUT")).toBe(true);
    expect(isQueueable("/api/progress/evid/2", "DELETE")).toBe(true);
    expect(isQueueable("/api/progress", "GET")).toBe(false);
    expect(isQueueable("/api/auth/login", "POST")).toBe(false);
    expect(isQueueable("/api/ai/chat", "POST")).toBe(false);
    expect(isQueueable("/api/teams", "POST")).toBe(false);
  });

  it("isNetworkError distingue rede de HTTP", () => {
    expect(isNetworkError(new TypeError("Failed to fetch"))).toBe(true);
    expect(isNetworkError(new Error("HTTP 500"))).toBe(false);
    expect(isNetworkError({ message: "NetworkError when attempting to fetch resource." })).toBe(
      true,
    );
  });

  it("JSON corrompido no storage → fila vazia (não rebenta)", () => {
    mem.set("phc.offlineQueue.v1", "{inválido");
    expect(loadQueue()).toEqual([]);
  });
});
