import { Link } from "react-router-dom";
import { BELTS, labById } from "@phc/content";
import {
  applyCompanyText,
  currentBelt,
  currentMission,
  DAILY_GOAL,
  dailyActions,
  dueCardsN,
  dueLabs,
  labsMastered,
  newCardsN,
  overallPct,
  totalReps,
  xpTotal,
  fmtD,
} from "@phc/shared";
import { useProgress } from "../stores/progress.ts";
import { useSession } from "../stores/session.ts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.tsx";
import { Badge } from "../components/ui/badge.tsx";
import { Button, buttonVariants } from "../components/ui/button.tsx";
import { cn } from "../lib/utils.ts";
import { CircleProgress, ProgressBar } from "../components/ui/progress.tsx";
import { Spinner } from "../components/ui/misc.tsx";
import { ArrowRight, BookOpen, Brain, Flame, Target } from "lucide-react";

export function JourneyPage() {
  const state = useProgress((s) => s.state);
  const status = useProgress((s) => s.status);
  const user = useSession((s) => s.user);

  if (!state || status !== "ready") {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const company = state.company;
  const emp = (t: string) => applyCompanyText(t, company);
  const current = currentMission(state);
  const curLab = current ? labById(current) : null;
  const due = dueLabs(state);
  const dueCards = dueCardsN(state);
  const freshCards = newCardsN(state);
  const actions = dailyActions(state);
  const belt = BELTS[currentBelt(state)];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Olá, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-sm text-muted-foreground">
            A treinar em{" "}
            <b className="text-foreground">
              {company?.segIco} {company?.nome}
            </b>{" "}
            · {state.contexto.pais} · gama {state.contexto.gama}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <CircleProgress value={(actions / DAILY_GOAL) * 100} label={`${actions}/${DAILY_GOAL}`} />
          <div className="text-xs text-muted-foreground">
            meta diária
            <br />
            (5 ações)
          </div>
        </div>
      </div>

      {/* missão atual */}
      {curLab ? (
        <Card className="border-primary/40">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-primary">
              <Target className="mr-2 inline h-5 w-5" />
              Missão atual · {curLab.id}
            </CardTitle>
            <Badge variant="secondary">
              Nível {curLab.lv} · {belt.name}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <h2 className="text-lg font-semibold">{emp(curLab.t)}</h2>
            <p className="text-sm text-muted-foreground">{emp(curLab.goal)}</p>
            <div className="flex flex-wrap gap-2">
              <Link to={`/missoes/${curLab.id}`} className={cn(buttonVariants(), "gap-2")}>
                ▶ Abrir missão <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/praticar?tab=cartas"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                🃏 Cartas do dia ({dueCards + Math.min(freshCards, 20)})
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-lg font-semibold text-success">🎖️ Todas as missões concluídas!</p>
            <p className="text-sm text-muted-foreground">
              Continue com as revisões e os testes para consolidar.
            </p>
          </CardContent>
        </Card>
      )}

      {/* revisões vencidas */}
      {(due.length > 0 || dueCards > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-accent">🔔 Revisões de hoje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {due.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Missões vencidas:</span>
                {due.slice(0, 12).map((id) => {
                  const l = labById(id)!;
                  return (
                    <Link key={id} to={`/missoes/${id}`}>
                      <Badge variant="warning" className="cursor-pointer hover:opacity-80">
                        {id} · {emp(l.t).slice(0, 28)}… ({fmtD(state.labs[id]?.due)})
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
            {dueCards > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{dueCards} cartas vencidas</span>
                <Link to="/praticar?tab=cartas">
                  <Button size="sm" variant="secondary">
                    Revisar agora
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* números */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<Flame className="h-5 w-5 text-primary" />}
          label="Sequência"
          value={`${state.streak.n} dias`}
        />
        <Stat
          icon={<BookOpen className="h-5 w-5 text-info" />}
          label="Repetições"
          value={String(totalReps(state))}
        />
        <Stat
          icon={<Brain className="h-5 w-5 text-success" />}
          label="Missões 🧠"
          value={`${labsMastered(state)}/90`}
        />
        <Stat
          icon={<Target className="h-5 w-5 text-accent" />}
          label="XP total"
          value={String(xpTotal(state))}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progresso geral</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressBar
            value={overallPct(state)}
            label="Domínio do curso (missões 70% + testes 20% + cartas 10%)"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        {icon}
        <div>
          <div className="text-lg font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
