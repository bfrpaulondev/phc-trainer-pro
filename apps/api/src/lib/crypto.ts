/** Cifra AES-256-GCM para segredos em repouso (chaves de IA das equipas). */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { env } from "../config/env.ts";

function key(): Buffer {
  return createHash("sha256").update(env.ENCRYPTION_KEY).digest();
}

/** devolve `v1:<iv>:<tag>:<data>` (hex) */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("hex"), tag.toString("hex"), data.toString("hex")].join(":");
}

export function decryptSecret(payload: string): string {
  const [v, ivHex, tagHex, dataHex] = payload.split(":");
  if (v !== "v1" || !ivHex || !tagHex || !dataHex) throw new Error("formato de segredo inválido");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString(
    "utf8",
  );
}

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
