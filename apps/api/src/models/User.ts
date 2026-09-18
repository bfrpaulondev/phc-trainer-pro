import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: "student" | "trainer";
  teamId: Types.ObjectId | null;
  lastActiveAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "trainer";
  teamId: string | null;
  createdAt: string;
}

export type UserDoc = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["student", "trainer"], default: "student" },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", default: null },
    lastActiveAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const User = model<IUser>("User", userSchema);

/** representação pública do utilizador (sem passwordHash) */
export function toPublicUser(u: IUser & { _id: Types.ObjectId }): PublicUser {
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    teamId: u.teamId ? String(u.teamId) : null,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : new Date().toISOString(),
  };
}
