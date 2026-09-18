import { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

export interface IRefreshToken {
  userId: Types.ObjectId;
  /** sha256 do token JWT (o token em si nunca é guardado) */
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  /** user-agent do cliente que criou o token (auditoria) */
  userAgent: string;
  createdAt: Date;
}

export type RefreshTokenDoc = HydratedDocument<IRefreshToken>;

const refreshTokenSchema = new Schema<IRefreshToken, Model<IRefreshToken>>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true },
);

// limpeza automática de tokens expirados
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<IRefreshToken, Model<IRefreshToken>>(
  "RefreshToken",
  refreshTokenSchema,
);
