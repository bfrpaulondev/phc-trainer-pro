import { Button } from "../../components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.tsx";
import { Table, TBody, TD, TH, THead, TR } from "../../components/ui/table.tsx";
import { useOnboard } from "../onboard/OnboardModal.tsx";

const METAS = [
  { t: "Emitir fatura simples completa", i: "10 min", e: "< 3 min" },
  { t: "Criar série de documentos configurada", i: "20 min", e: "< 8 min" },
  { t: "Criar artigo com família/unidades/preços", i: "8 min", e: "< 3 min" },
  { t: "Circuito orçamento→encomenda→guia→fatura→recibo", i: "40 min", e: "< 15 min" },
  { t: "Exportar e validar SAF-T", i: "20 min", e: "< 8 min" },
  { t: "Instalação completa do zero (SQL+PHC+ODBC)", i: "3 h", e: "< 1 h" },
  { t: "Criar campo+regra+evento de utilizador", i: "45 min", e: "< 15 min" },
];

export function ProtocolTab() {
  const openWizard = useOnboard((s) => s.openWizard);
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div
          className="flex h-32 items-end bg-cover bg-center"
          style={{ backgroundImage: "url(/img/hero-pro.jpg)" }}
        >
          <div className="w-full bg-gradient-to-t from-black/85 to-transparent p-4">
            <h2 className="text-lg font-bold text-accent">📜 Protocolo de Treino</h2>
            <p className="text-sm text-foreground/90">
              O método da prática deliberada: estudar, executar, provar e repetir até dominar.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🎧 Boas-vindas do Professor</CardTitle>
        </CardHeader>
        <CardContent>
          <audio controls preload="none" src="/audio/bemvindo.mp3" className="w-full max-w-md" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>As regras do treino</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li>
              <b>0. Conceito antes da prática.</b> Toda missão abre com o bloco 📖 Conceito. Quer
              mais fácil? 🎓 Aula guiada: o Professor explica cada parágrafo em linguagem simples,
              aplicado à sua empresa de treino — com voz!
            </li>
            <li>
              <b>1. Toda missão exige PROVA.</b> Print nomeado, SQL, ficheiro ou áudio. Sem prova =
              não aconteceu. (O que não está documentado pode ser questionado.)
            </li>
            <li>
              <b>2. Pasta de evidências.</b>{" "}
              <code className="rounded bg-secondary px-1">
                C:\PHC-Treino\evidencias\L&lt;nn&gt;\AAAA-MM-DD-&lt;descricao&gt;.png
              </code>{" "}
              + registo no 📸 portefólio da missão.
            </li>
            <li>
              <b>3. Repetição espaçada.</b> ✅ Registar repetição → volta em 1, 2, 4, 7, 14, 30, 60
              dias. Em cada retorno, refaça SEM ler os passos.
            </li>
            <li>
              <b>4. Desafio cronometrado.</b> A partir da 3ª repetição, cronometre. Bateu a meta 2×?
              🧠 Sei de cor.
            </li>
            <li>
              <b>5. Explique em voz alta (Feynman).</b> 2 min a ensinar o que fez — como o Professor
              ensina você. Errou? Ainda não sabe.
            </li>
            <li>
              <b>6. Sessão diária (45–90 min):</b> conceito → cartas → repetições → missão nova →
              provas → teach-back.
            </li>
            <li>
              <b>7. O nível só avança</b> com missões 🧠 + teste ≥ 80%.
            </li>
            <li>
              <b>8. Ambiente sagrado:</b> treine na empresa demo/clonada — nunca na produção do
              cliente. Testes fazem-se em ambiente controlado.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>⏱ Metas de tempo (desafios)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>Tarefa</TH>
                <TH className="w-28">Iniciante</TH>
                <TH className="w-28">Expert 🏁</TH>
              </TR>
            </THead>
            <TBody>
              {METAS.map((m) => (
                <TR key={m.t}>
                  <TD>{m.t}</TD>
                  <TD>{m.i}</TD>
                  <TD className="text-success">{m.e}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🧰 Antes de começar (hoje!)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
            <li>
              Garanta um PHC instalado (licença própria, demo de parceiro Cegid PHC ou NFR) —
              missões L00 a L02 preparam tudo.
            </li>
            <li>
              Defina a sua <b>empresa de treino</b> (12 segmentos realistas) e o <b>contexto</b>{" "}
              (país PT/ES/AO/MZ/CV/PE e gama Corporate/Advanced/Enterprise) em ⚙️ Definições — ou
              faça a entrevista e deixe a IA gerar o seu <b>curso personalizado</b>:
              <Button size="sm" variant="secondary" className="ml-2" onClick={openWizard}>
                🎓 Criar curso personalizado
              </Button>
            </li>
            <li>Instale SQL Server Express + SSMS; (opcional) Anki para os flashcards.</li>
            <li>
              O tutor IA é configurado <b>uma vez pela equipa</b> (👥 Equipa → Fornecedores de IA,
              pelo formador) — as chaves ficam cifradas no servidor.
            </li>
            <li>
              Pede ao formador o <b>código de convite</b> da equipa para o seu progresso aparecer no
              painel dele.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
