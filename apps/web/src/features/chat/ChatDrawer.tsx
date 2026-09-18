import { useEffect, useRef, useState } from "react";
import { X, Send, Volume2, Square } from "lucide-react";
import { useUi } from "../../stores/ui.ts";
import { useProgress } from "../../stores/progress.ts";
import { useAi } from "../../hooks/useAi.ts";
import { useTts } from "../../hooks/useTts.ts";
import { useMascot } from "../../stores/mascot.ts";
import { EinsteinSVG } from "../../components/mascot/Mascot.tsx";
import { Button } from "../../components/ui/button.tsx";
import { Textarea } from "../../components/ui/input.tsx";
import { Badge } from "../../components/ui/badge.tsx";
import { toast } from "../../components/ui/toast.tsx";

interface Msg {
  role: "user" | "assistant";
  txt: string;
}

const GREETING: Msg = {
  role: "assistant",
  txt: "Olá! 🎓 Sou o Professor Einstein, o seu tutor de IA. Pergunte o que quiser sobre o PHC Gestão — explico de forma simples, sempre aplicado à sua empresa de treino. E lembre: sem evidência, não há aprendizado.",
};

const QUICK = [
  "Explica-me o que é o stamp",
  "Como funciona uma série de documentos?",
  "O que é o SAF-T (PT)?",
  "Diferença entre grupos e perfis de acesso?",
];

/** Chat global com o Professor (drawer lateral) — contexto da missão atual injetado no servidor */
export function ChatDrawer() {
  const { chatOpen, closeChat, lastLab } = useUi();
  const state = useProgress((s) => s.state);
  const ai = useAi();
  const tts = useTts();
  const setMood = useMascot((s) => s.setMood);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, chatOpen]);

  useEffect(() => {
    if (!chatOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeChat();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen, closeChat]);

  if (!chatOpen) return null;

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || ai.loading) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", txt: q }]);
    setMood("think");
    try {
      const r = await ai.chat({
        kind: "chat",
        labId: lastLab ?? undefined,
        maxTokens: 600,
        messages: [{ role: "user", content: q }],
      });
      setMsgs((m) => [...m, { role: "assistant", txt: r.text }]);
      setMood("talk");
      if (state?.settings.tts) {
        setSpeaking(true);
        await tts.speak(r.text);
        setSpeaking(false);
      }
      setMood("idle");
    } catch (e) {
      setMood("idle");
      toast.error((e as Error).message);
      setMsgs((m) => [...m, { role: "assistant", txt: `⚠ ${(e as Error).message}` }]);
    }
  }

  return (
    <>
      <div className="drawerOverlay" onClick={closeChat} />
      <div className="drawerPanel" role="dialog" aria-label="Chat com o Professor Einstein">
        <div className="drawerHead">
          <div className="flex items-center gap-2">
            <div className="chatAv">
              <EinsteinSVG mood="idle" />
            </div>
            <div>
              <b className="text-sm text-primary">Professor Einstein</b>
              <div className="text-xs text-muted-foreground">
                Tutor IA{" "}
                {lastLab ? (
                  <Badge variant="info" className="ml-1">
                    missão {lastLab}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={closeChat} aria-label="Fechar chat">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="drawerBody" ref={listRef}>
          <div className="chatList">
            {msgs.map((m, i) => (
              <div key={i} className={`chatMsg ${m.role === "user" ? "user" : ""}`}>
                {m.role === "assistant" && (
                  <div className="chatAv">
                    <EinsteinSVG mood={ai.loading ? "think" : "idle"} />
                  </div>
                )}
                <div className="chatTxt">{m.txt}</div>
              </div>
            ))}
            {ai.loading && (
              <div className="text-xs text-muted-foreground">O professor está a pensar… ⚛️</div>
            )}
          </div>
          {msgs.length <= 1 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {QUICK.map((q) => (
                <button
                  key={q}
                  className="cursor-pointer rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
                  onClick={() => void send(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="drawerFoot">
          <div className="flex items-end gap-2">
            <Textarea
              rows={2}
              value={input}
              placeholder="Pergunte sobre o PHC Gestão… (Enter envia, Shift+Enter nova linha)"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <div className="flex flex-col gap-1">
              <Button
                size="icon"
                onClick={() => void send()}
                disabled={ai.loading || !input.trim()}
                aria-label="Enviar"
              >
                <Send className="h-4 w-4" />
              </Button>
              {speaking ? (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    tts.stop();
                    setSpeaking(false);
                  }}
                  aria-label="Parar voz"
                >
                  <Square className="h-3 w-3" />
                </Button>
              ) : msgs.length > 1 ? (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => void tts.speak(msgs[msgs.length - 1].txt)}
                  aria-label="Ouvir última"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
