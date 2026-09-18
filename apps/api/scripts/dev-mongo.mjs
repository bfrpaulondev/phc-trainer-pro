#!/usr/bin/env node
/**
 * MongoDB em memória para desenvolvimento/E2E (mongodb-memory-server).
 * Sobe o mongod em :27017 e um ping HTTP de readiness em :4101/ready
 * (usado pelo webServer do Playwright e por `pnpm dev` sem Mongo local).
 *
 * Uso: node scripts/dev-mongo.mjs
 */
import http from "node:http";
import { MongoMemoryServer } from "mongodb-memory-server";

const PORT = Number(process.env.DEV_MONGO_PORT || 27017);
const PING_PORT = 4101;

let ready = false;

const ping = http.createServer((_req, res) => {
  res.writeHead(ready ? 200 : 503, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: ready }));
});
ping.listen(PING_PORT, () =>
  console.log(`[dev-mongo] readiness ping em http://localhost:${PING_PORT}/ready`),
);

const mongod = await MongoMemoryServer.create({
  instance: {
    port: PORT,
    dbName: "phc-trainer",
    args: ["--wiredTigerCacheSizeGB", "0.25"],
  },
});
ready = true;
console.log(`[dev-mongo] mongod em memória: ${mongod.getUri("phc-trainer")}`);

const stop = async () => {
  await mongod.stop();
  ping.close();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
