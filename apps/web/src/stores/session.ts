import { create } from "zustand";
import type { MeResponse, PublicUser } from "@phc/shared";
import {
  apiFetch,
  applySession,
  hasRefreshToken,
  setAccessToken,
  storeRefreshToken,
} from "../lib/api.ts";

export interface TeamInfo {
  id: string;
  name: string;
  inviteCode?: string;
  memberCount: number;
}

interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

interface SessionState {
  status: "loading" | "authed" | "anon";
  user: PublicUser | null;
  team: TeamInfo | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

export const useSession = create<SessionState>()((set, get) => ({
  status: "loading",
  user: null,
  team: null,

  async bootstrap() {
    if (!hasRefreshToken()) {
      set({ status: "anon", user: null, team: null });
      return;
    }
    try {
      const me = await apiFetch<MeResponse>("/api/auth/me");
      set({
        status: "authed",
        user: me.user,
        team: me.team
          ? {
              id: me.team.id,
              name: me.team.name,
              inviteCode: me.team.inviteCode,
              memberCount: me.team.memberCount,
            }
          : null,
      });
    } catch {
      setAccessToken(null);
      storeRefreshToken(null);
      set({ status: "anon", user: null, team: null });
    }
  },

  async login(email, password) {
    const s = await apiFetch<AuthPayload>("/api/auth/login", {
      method: "POST",
      body: { email, password },
      noRetry: true,
    });
    applySession(s);
    set({ status: "authed", user: s.user });
    await get().refreshMe();
  },

  async register(name, email, password) {
    const s = await apiFetch<AuthPayload>("/api/auth/register", {
      method: "POST",
      body: { name, email, password },
      noRetry: true,
    });
    applySession(s);
    set({ status: "authed", user: s.user });
    await get().refreshMe();
  },

  async logout() {
    try {
      const rt = localStorage.getItem("phc.refreshToken");
      await apiFetch("/api/auth/logout", {
        method: "POST",
        body: { refreshToken: rt },
        noRetry: true,
      });
    } catch {
      /* melhor esforço */
    }
    setAccessToken(null);
    storeRefreshToken(null);
    set({ status: "anon", user: null, team: null });
  },

  async refreshMe() {
    try {
      const me = await apiFetch<MeResponse>("/api/auth/me");
      set({
        user: me.user,
        team: me.team
          ? {
              id: me.team.id,
              name: me.team.name,
              inviteCode: me.team.inviteCode,
              memberCount: me.team.memberCount,
            }
          : null,
      });
    } catch {
      /* mantém estado atual */
    }
  },
}));
