import { randomBytes } from "node:crypto";
import { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

export interface ITeam {
  name: string;
  ownerId: Types.ObjectId;
  /** código de convite (partilhado pelo formador) */
  inviteCode: string;
  /** chaves de IA cifradas (AES-256-GCM), por fornecedor */
  aiKeys: Record<string, string>;
  /** ordem do auto-router (ids de fornecedores) */
  aiOrder: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type TeamDoc = HydratedDocument<ITeam>;

const teamSchema = new Schema<ITeam, Model<ITeam>>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    inviteCode: { type: String, required: true, unique: true, length: 8 },
    aiKeys: { type: Schema.Types.Mixed, default: {} },
    aiOrder: { type: [String], default: [] },
  },
  { timestamps: true },
);

export function generateInviteCode(): string {
  // sem caracteres ambíguos (0/O, 1/I)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export const Team = model<ITeam, Model<ITeam>>("Team", teamSchema);
