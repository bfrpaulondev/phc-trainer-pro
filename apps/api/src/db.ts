import mongoose from "mongoose";
import { env } from "./config/env.ts";

mongoose.set("strictQuery", true);

export async function connectDb(uri = env.MONGODB_URI): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log(`[api] MongoDB ligado: ${mongoose.connection.name}`);
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}

export function dbReady(): boolean {
  return mongoose.connection.readyState === 1;
}
