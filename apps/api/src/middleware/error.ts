import type { NextFunction, Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { ApiError } from "../lib/errors.ts";
import { env } from "../config/env.ts";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: "Rota não encontrada", path: req.originalUrl });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }
  // duplicate key do Mongo
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: number }).code === 11000
  ) {
    res.status(409).json({ error: "Registo duplicado (e-mail ou código já em uso)." });
    return;
  }
  // body-parser / limites
  if (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    (err as { type: string }).type === "entity.too.large"
  ) {
    res.status(413).json({ error: "Pedido demasiado grande." });
    return;
  }
  console.error("[api] erro não tratado:", err);
  if (env.SENTRY_DSN) Sentry.captureException(err);
  res.status(500).json({ error: "Erro interno do servidor." });
}
