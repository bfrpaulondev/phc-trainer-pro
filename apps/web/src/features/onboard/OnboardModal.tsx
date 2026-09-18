import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { create } from "zustand";
import { LABS, SEGMENTS, segmentById } from "@phc/content";
import type { PlanState } from "@phc/shared";
import { useProgress } from "../../stores/progress.ts";
import { useAi } from "../../hooks/useAi.ts";
import { useTts } from "../../hooks/useTts.ts";
import { useMascot } from "../../stores/mascot.ts";
import { Dialog } from "../../components/ui/dialog.tsx";
import { Button } from "../../components/ui/button.tsx";
import { Badge } from "../../components/ui/badge.tsx";
import { Alert } from "../../components/ui/alert.tsx";
import { Input, Select, Textarea } from "../../components/ui/input.tsx";
import { toast } from "../../components/ui/toast.tsx";
import { cn } from "../../lib/utils.ts";

/* ---------- store ---------- */
interface OnboardState {
  open: boolean;
  openWizard: () => void;
  close: () => void;
}

export const useOnboard = create<OnboardState>()((set) => ({
  open: false,
  openWizard: () => set({ open: true }),
  close: () => set({ open: false }),
}));

const OBJETIVOS_OPCOES = [
  "Dominar o módulo Gestão",
  "Preparar Contabilidade",
  "Preparar Vencimentos/RH",
  "POS & Retalho",
  "Integrações & e-commerce",
  "Desenvolvimento & personalização",
];

/* ---------- wizard ---------- */
export function OnboardModal() {
  const { open, close } = useOnboard();
  const state = useProgress((s) => s.state);
  const store = useProgress.getState;
  const ai = useAi();
  const tts = useTts();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [segId, setSegId] = useState<string | null>(state?.company?.segId ?? null);
  const [nome, setNome] = useState(state?.company?.nome ?? "");
  const [cidade, setCidade] = useState(state?.company?.cidade ?? "");
  const [tipo, setTipo] = useState("ambos");
  const [tam, setTam] = useState("micro");
  const [interesses, setInteresses] = useState("");
  const [objetivos, setObjetivos] = useState<string[]>(["Dominar o módulo Gestão"]);
  const [minutos, setMinutos] = useState(60);
  const [plano, setPlano] = useState<PlanState | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!open || !state) return null;
  const seg = segId ? segmentById(segId) : null;

  const STEPS = ["Segmento", "Empresa", "Objetivos", "Gerar curso"];

  const gerarCursoIA = async () => {
    if (!seg) return;
    setErr(null);
    useMascot.getState().setMood("think");
    try {
      const ids = LABS.map((l) => `${l.id} (${l.t})`).join("; ");
      const usr =
        "Crie um plano de curso personalizado para este aluno.\n" +
        `PERFIL: interesses='${interesses || "(não indicados)"}'; objetivos=${JSON.stringify(objetivos)}; tempo/dia=${minutos} min; ` +
        `empresa-treino=${nome || seg.empresa.nome} (segmento: ${seg.nome}, ${seg.empresa.cidade}); vende ` +
        `${tipo === "ambos" ? "produtos e serviços" : tipo}; dimensão ${tam}.\n` +
        `NECESSIDADES DO NEGÓCIO: ${(seg.empresa.necessidades as string[] | undefined)?.join("; ") ?? "-"}.\n` +
        `MISSÕES DISPONÍVEIS: ${ids}\n` +
        'Responda APENAS com JSON válido, sem texto à volta: {"nota":"frase de foco do curso, máx 40 palavras",' +
        '"destaques":["L##",... até 8 missões prioritárias para este negócio],' +
        '"ordem":["L##",... de 12 a 20 missões em sequência pedagógica]}';
      const r = await ai.chat({
        kind: "chat",
        maxTokens: 900,
        messages: [{ role: "user", content: usr }],
      });
      const jm = r.text.match(/\{[\s\S]*\}/);
      if (!jm) throw new Error("A IA não devolveu JSON — use o plano padrão.");
      const pl = JSON.parse(jm[0]) as { nota?: string; destaques?: string[]; ordem?: string[] };
      const valid = new Set(LABS.map((l) => l.id));
      const destaques = (pl.destaques ?? []).filter((x) => valid.has(x)).slice(0, 10);
      let ordem = (pl.ordem ?? []).filter((x) => valid.has(x)).slice(0, 30);
      if (!destaques.length) throw new Error("Destaques inválidos — use o plano padrão.");
      if (!ordem.length) ordem = destaques;
      setPlano({ nota: String(pl.nota || seg.plano.nota), destaques, ordem, porIA: true });
      useMascot
        .getState()
        .say("🎓 Curso personalizado gerado! Reveja os destaques e aplique.", "cheer", 7000);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      useMascot.getState().setMood("idle");
    }
  };

  const usarPlanoPadrao = () => {
    if (!seg) return;
    setPlano({
      nota: seg.plano.nota,
      destaques: seg.plano.destaques,
      ordem: [...seg.plano.destaques, "L00", "L01", "L02"],
      porIA: false,
    });
    setErr(null);
  };

  const aplicar = async () => {
    if (!seg) return;
    await store().setCompany(seg.id, nome || undefined, cidade || undefined);
    await store().syncFull({
      plan: plano ?? {
        nota: seg.plano.nota,
        destaques: seg.plano.destaques,
        ordem: seg.plano.destaques,
        porIA: false,
      },
      onboarded: true,
    });
    close();
    useMascot
      .getState()
      .say(
        `🏢 ${seg.empresa.curto ?? seg.nome} definida. Missões e aulas passam a usar este contexto.`,
        "cheer",
        8000,
      );
    if (state.settings.tts) {
      setTimeout(
        () => void tts.speak(`Empresa ${seg.empresa.curto ?? seg.nome} configurada. Bom treino!`),
        300,
      );
    }
    toast.success("Empresa de treino + curso aplicados! 🎓");
    navigate("/");
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      wide
      title="🎓 Criar a minha empresa de treino + curso personalizado"
    >
      {/* steps indicator */}
      <div className="mb-5 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                i < step && "bg-success text-black",
                i === step && "bg-primary text-primary-foreground",
                i > step && "bg-secondary text-muted-foreground",
              )}
            >
              {i + 1}
            </div>
            <span
              className={cn(
                "hidden text-xs sm:inline",
                i === step ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn("h-px flex-1", i < step ? "bg-success" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            Que tipo de negócio você quer dominar? (Pode trocar depois — o curso adapta-se.) Escolha
            o que mais lhe interessa ou o segmento dos seus clientes reais.
          </p>
          <div className="segGrid">
            {SEGMENTS.map((sg) => (
              <button
                key={sg.id}
                className={cn(
                  "cursor-pointer rounded-lg border p-3 text-left transition-colors",
                  segId === sg.id
                    ? "border-primary bg-primary/10 shadow-[0_0_0_2px_rgba(245,166,35,0.25)]"
                    : "border-border hover:border-primary/50",
                )}
                onClick={() => {
                  setSegId(sg.id);
                  setNome(String(sg.empresa.nome));
                  setCidade(String(sg.empresa.cidade));
                }}
              >
                <div className="text-2xl">{sg.ico}</div>
                <b className="text-sm">{sg.nome}</b>
                <p className="mt-0.5 text-xs text-muted-foreground">{String(sg.empresa.nome)}</p>
              </button>
            ))}
          </div>
          <Button className="mt-4" disabled={!segId} onClick={() => setStep(1)}>
            Continuar ➡
          </Button>
        </div>
      )}

      {step === 1 && seg && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground">Nome da empresa</label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Cidade</label>
              <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="text-xs text-muted-foreground">Vende</label>
              <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="ambos">Produtos e serviços</option>
                <option value="produtos">Só produtos</option>
                <option value="servicos">Só serviços</option>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Dimensão</label>
              <Select value={tam} onChange={(e) => setTam(e.target.value)}>
                <option value="micro">Micro (1-9)</option>
                <option value="pequena">Pequena (10-49)</option>
                <option value="media">Média (50+)</option>
              </Select>
            </div>
          </div>
          <div className="rounded-md border border-border bg-secondary/40 p-3">
            <b className="text-sm">Pré-visualização</b>
            <p className="mt-1 text-sm">
              {nome || String(seg.empresa.nome)} · {cidade || String(seg.empresa.cidade)} · NIF{" "}
              {String(seg.empresa.nif)} · CAE {String(seg.empresa.cae)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {((seg.empresa.artigos as string[] | undefined) ?? []).map((a, i) => (
                <Badge key={i} variant="muted">
                  {a}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)}>
              ⬅ Voltar
            </Button>
            <Button onClick={() => setStep(2)}>Continuar ➡</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">
              Do que você gosta / o que quer dominar? (a IA usa isto — ex.: "hotéis, eletrónicos,
              quero trabalhar com clientes de retalho")
            </label>
            <Textarea
              rows={2}
              value={interesses}
              onChange={(e) => setInteresses(e.target.value)}
              placeholder="Ex.: gosto de hotelaria e eletrónica; quero implementar clientes de retalho e oficinas…"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Objetivos:</label>
            <div className="mt-1 grid gap-1 sm:grid-cols-2">
              {OBJETIVOS_OPCOES.map((o) => (
                <label key={o} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#f5a623]"
                    checked={objetivos.includes(o)}
                    onChange={(e) =>
                      setObjetivos((v) => (e.target.checked ? [...v, o] : v.filter((x) => x !== o)))
                    }
                  />
                  {o}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Tempo de treino por dia:</label>
            <Select
              className="ml-2 w-40"
              value={String(minutos)}
              onChange={(e) => setMinutos(Number(e.target.value))}
            >
              <option value="30">30 min</option>
              <option value="60">1 hora</option>
              <option value="90">1,5 horas</option>
              <option value="120">2+ horas</option>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              ⬅ Voltar
            </Button>
            <Button onClick={() => setStep(3)}>Gerar curso ➡</Button>
          </div>
        </div>
      )}

      {step === 3 && seg && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button loading={ai.loading} onClick={() => void gerarCursoIA()}>
              🧠 Gerar curso com IA
            </Button>
            <Button variant="outline" onClick={usarPlanoPadrao}>
              ⚡ Usar plano padrão do segmento (sem IA)
            </Button>
          </div>
          {err && (
            <Alert variant="warning">
              {err}
              <br />
              <span className="text-xs text-muted-foreground">
                Sem problema — o plano padrão do segmento é ótimo para começar.
              </span>
            </Alert>
          )}
          {plano ? (
            <div className="rounded-md border border-success/40 bg-success/5 p-3">
              <b className="text-sm">
                📋 Plano gerado{" "}
                {plano.porIA && (
                  <Badge variant="warning" className="ml-1">
                    por IA
                  </Badge>
                )}
              </b>
              <p className="mt-1 text-sm">{plano.nota}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {(plano.destaques ?? []).map((id) => {
                  const l = LABS.find((x) => x.id === id);
                  return l ? (
                    <Badge key={id} variant="warning">
                      {id} · {l.t.slice(0, 40)}
                    </Badge>
                  ) : null;
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Sequência pedagógica: {(plano.ordem ?? []).join(" → ")}
              </p>
              <Button className="mt-3" onClick={() => void aplicar()}>
                ✅ Aplicar empresa + curso
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Escolha uma das opções acima. A IA personaliza destaques e ordem das missões para o
              seu perfil; o plano padrão já vem calibrado por segmento.
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              ⬅ Voltar
            </Button>
            <Button variant="ghost" onClick={() => void aplicar()}>
              Aplicar só a empresa (decidir curso depois)
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
