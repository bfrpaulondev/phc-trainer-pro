import { Router, type Response } from "express";
import type { z } from "zod";
import {
  changePasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  updateProfileSchema,
  type AuthResponse,
} from "@phc/shared";
import { conflict, unauthorized } from "../lib/errors.ts";
import { User, toPublicUser, type UserDoc } from "../models/User.ts";
import { Team } from "../models/Team.ts";
import { RefreshToken } from "../models/RefreshToken.ts";
import { getOrCreateProgress } from "../models/Progress.ts";
import { hashPassword, verifyPassword } from "../lib/password.ts";
import {
  hashRefreshToken,
  newRefreshToken,
  signAccessToken,
  verifyRefreshToken,
} from "../lib/jwt.ts";
import { isProd } from "../config/env.ts";
import { requireUser, validate } from "../middleware/auth.ts";

export const REFRESH_COOKIE = "phc_rt";

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth",
    maxAge: 30 * 86400_000,
  });
}

async function issueSession(
  user: UserDoc,
  res: Response,
  userAgent: string,
): Promise<AuthResponse> {
  const accessToken = signAccessToken({
    sub: String(user._id),
    role: user.role,
    teamId: user.teamId ? String(user.teamId) : null,
  });
  const rt = newRefreshToken(String(user._id));
  await RefreshToken.create({
    userId: user._id,
    tokenHash: rt.tokenHash,
    expiresAt: rt.expiresAt,
    revokedAt: null,
    userAgent: userAgent.slice(0, 200),
  });
  setRefreshCookie(res, rt.token);
  return { accessToken, refreshToken: rt.token, user: toPublicUser(user) };
}

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.body as z.infer<typeof registerSchema>;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw conflict("Já existe uma conta com este e-mail.");
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: await hashPassword(password),
  });
  await getOrCreateProgress(user._id);
  const session = await issueSession(user, res, String(req.headers["user-agent"] || ""));
  res.status(201).json(session);
});

authRouter.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw unauthorized("E-mail ou palavra-passe incorretos.");
  }
  user.lastActiveAt = new Date();
  await user.save();
  res.json(await issueSession(user, res, String(req.headers["user-agent"] || "")));
});

authRouter.post("/refresh", validate(refreshSchema), async (req, res) => {
  const presented: string | undefined =
    req.cookies?.[REFRESH_COOKIE] ||
    (req.body as { refreshToken?: string }).refreshToken ||
    (req.headers["x-refresh-token"] as string | undefined);
  if (!presented) throw unauthorized("Refresh token em falta.");
  let claims;
  try {
    claims = verifyRefreshToken(presented);
  } catch {
    throw unauthorized("Sessão expirada. Entre novamente.");
  }
  const stored = await RefreshToken.findOne({ tokenHash: hashRefreshToken(presented) });
  if (
    !stored ||
    stored.revokedAt ||
    stored.expiresAt < new Date() ||
    String(stored.userId) !== claims.sub
  ) {
    // possível reutilização de token roubado → revoga tudo deste utilizador
    if (stored?.revokedAt)
      await RefreshToken.updateMany(
        { userId: claims.sub, revokedAt: null },
        { revokedAt: new Date() },
      );
    throw unauthorized("Sessão inválida. Entre novamente.");
  }
  stored.revokedAt = new Date();
  await stored.save();
  const user = await User.findById(claims.sub);
  if (!user) throw unauthorized("Utilizador não encontrado.");
  res.json(await issueSession(user, res, String(req.headers["user-agent"] || "")));
});

authRouter.post("/logout", async (req, res) => {
  const presented: string | undefined =
    req.cookies?.[REFRESH_COOKIE] || (req.body as { refreshToken?: string })?.refreshToken;
  if (presented) {
    await RefreshToken.updateOne(
      { tokenHash: hashRefreshToken(presented) },
      { revokedAt: new Date() },
    );
  }
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.json({ ok: true });
});

authRouter.get("/me", requireUser, async (req, res) => {
  const user = await User.findById(req.auth!.sub);
  if (!user) throw unauthorized("Utilizador não encontrado.");
  let team: { id: string; name: string; inviteCode?: string; memberCount: number } | null = null;
  if (user.teamId) {
    const t = await Team.findById(user.teamId);
    if (t) {
      const memberCount = await User.countDocuments({ teamId: t._id });
      team = {
        id: String(t._id),
        name: t.name,
        memberCount,
        ...(user.role === "trainer" && String(t.ownerId) === String(user._id)
          ? { inviteCode: t.inviteCode }
          : {}),
      };
    }
  }
  res.json({ user: toPublicUser(user), team });
});

authRouter.patch("/me", requireUser, validate(updateProfileSchema), async (req, res) => {
  const { name } = req.body as { name?: string };
  const user = await User.findById(req.auth!.sub);
  if (!user) throw unauthorized();
  if (name) user.name = name;
  await user.save();
  res.json({ user: toPublicUser(user) });
});

authRouter.post(
  "/change-password",
  requireUser,
  validate(changePasswordSchema),
  async (req, res) => {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };
    const user = await User.findById(req.auth!.sub);
    if (!user) throw unauthorized();
    if (!(await verifyPassword(currentPassword, user.passwordHash)))
      throw unauthorized("Palavra-passe atual incorreta.");
    user.passwordHash = await hashPassword(newPassword);
    await user.save();
    await RefreshToken.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    res.json({
      ok: true,
      message: "Palavra-passe alterada. Volte a entrar em todos os dispositivos.",
    });
  },
);
