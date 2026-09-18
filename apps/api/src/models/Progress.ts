import { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";
import { defaultProgress, type ProgressState } from "@phc/shared";

export interface IProgress {
  userId: Types.ObjectId;
  /** ProgressState completo (espelha o `S` do legado) */
  state: ProgressState;
  createdAt: Date;
  updatedAt: Date;
}

export type ProgressDoc = HydratedDocument<IProgress>;

const progressSchema = new Schema<IProgress, Model<IProgress>>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    state: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false },
);

export const Progress = model<IProgress, Model<IProgress>>("Progress", progressSchema);

export async function getOrCreateProgress(userId: Types.ObjectId | string): Promise<ProgressDoc> {
  const existing = await Progress.findOne({ userId });
  if (existing) return existing;
  const created = await Progress.create({ userId, state: defaultProgress() });
  return created;
}
