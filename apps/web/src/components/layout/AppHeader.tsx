import { useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Brain, GraduationCap, Library, LogOut, Map, Settings, Target, Users } from "lucide-react";
import { BELTS } from "@phc/content";
import { currentBelt, xpTotal } from "@phc/shared";
import { useSession } from "../../stores/session.ts";
import { useProgress } from "../../stores/progress.ts";
import { Badge } from "../ui/badge.tsx";
import { Button } from "../ui/button.tsx";
import { cn } from "../../lib/utils.ts";

const NAV = [
  { to: "/", label: "Jornada", icon: Target, end: true },
  { to: "/missoes", label: "Missões", icon: Map },
  { to: "/aprender", label: "Aprender", icon: Library },
  { to: "/praticar", label: "Praticar", icon: Brain },
  { to: "/equipa", label: "Equipa", icon: Users },
  { to: "/definicoes", label: "Definições", icon: Settings },
];

export function AppHeader() {
  const { user, logout } = useSession();
  const state = useProgress((s) => s.state);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) void useProgress.getState().load(user.id);
  }, [user]);

  const belt = state ? BELTS[currentBelt(state)] : null;
  const xp = state ? xpTotal(state) : 0;
  const streak = state?.streak.n ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[#101728]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-[#f5ecd6] text-xl">
            🧠
          </div>
          <div>
            <div className="text-base font-extrabold tracking-wide text-primary">
              PHC TRAINER PRO
            </div>
            <div className="text-[11px] text-muted-foreground">
              Formação em equipa · <b>Gestão</b> Cegid PHC Evolution
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {state && (
            <>
              <Badge variant="warning" title="Dias consecutivos">
                🔥 {streak}d
              </Badge>
              <Badge variant="info" title="XP">
                {xp} XP
              </Badge>
              {belt && (
                <Badge variant="secondary" title="Nível atual">
                  <GraduationCap className="mr-1 h-3 w-3" /> {belt.name}
                </Badge>
              )}
            </>
          )}
          <span
            className="hidden max-w-[160px] truncate text-sm text-muted-foreground sm:inline"
            title={user?.email}
          >
            {user?.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            title="Terminar sessão"
            onClick={async () => {
              await logout();
              useProgress.getState().reset();
              navigate("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )
            }
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
      <div className="mx-auto max-w-6xl px-4">
        PHC Trainer Pro v6 (multiutilizador) · material educativo não oficial — Cegid PHC® é marca
        dos respetivos proprietários ·{" "}
        <a
          className="text-info hover:underline"
          href="https://github.com/bfrpaulondev/phc-trainer-pro"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>{" "}
        · progresso guardado na sua conta (servidor)
      </div>
    </footer>
  );
}
