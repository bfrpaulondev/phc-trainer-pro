/**
 * Construção de prompts de IA — portado do legado (personaSys, empresaResumo,
 * encContext, schemaContext, detectTables, buildDiscovery, parseMeta).
 * Usado pelo servidor (autoritativo) e pela web (previews).
 */
import {
  COUNTRIES,
  ENCYCLOPEDIA,
  PHC_SCHEMA,
  PROMPTS,
  SQL_PROMPTS,
  type Lab,
  type MissionTheory,
} from "@phc/content";
import type { CompanyState, PlanState, ProgressState } from "./types.ts";

export const PERSONA = PROMPTS.persona;
export const CODE_ROLE = PROMPTS.codeRole;
export const GEN_CONTRACT = PROMPTS.genContract;
export const SQL_RULES = SQL_PROMPTS.sqlRules;
export const DISCOVERY_SQL = SQL_PROMPTS.discoverySql;

export interface PromptContext {
  company?: CompanyState | null;
  contexto?: { pais: string; gama: string } | null;
  plan?: PlanState | null;
}

export function empresaResumo(c?: CompanyState | null, plan?: PlanState | null): string {
  if (!c) return "";
  return (
    `EMPRESA EM FOCO (use em TODOS os exemplos): ${c.nome} (${c.segNome}), ${c.cidade}, NIF ${c.nif ?? "-"}, CAE ${c.cae}.` +
    ` Armazéns: ${c.armazem1 ?? "-"} e ${c.armazem2 ?? "-"}. Cliente típico: ${c.cliente}. Fornecedor típico: ${c.fornecedor}.` +
    ` Artigos/serviços: ${(c.artigos ?? []).join("; ")}. Necessidades reais: ${(c.necessidades ?? []).join("; ")}` +
    (plan?.nota ? `. Foco do curso: ${plan.nota}` : "")
  );
}

export function contextoImplementacao(ctx?: { pais: string; gama: string } | null): string {
  if (!ctx) return "";
  const p = COUNTRIES.find((c) => c.id === ctx.pais);
  return (
    `\n\nCONTEXTO DE IMPLEMENTAÇÃO: país=${p ? p.nome : ctx.pais} (moeda ${p ? p.moeda : "-"}); gama=${ctx.gama}.` +
    " Adapte obrigações fiscais, terminologia e funcionalidades a este contexto" +
    " (PT → AT/SAF-T/ATCUD; ES → SII/TicketBAI/IRPF; AO → AGT/SAF-T AO; MZ/CV → regras locais; PE → retenção nas vendas)." +
    " Na gama Corporate, não sugira funcionalidades exclusivas de Advanced/Enterprise sem o assinalar."
  );
}

/** system prompt completo do Professor Einstein para um aluno */
export function buildSystemPrompt(c: PromptContext): string {
  return (
    PERSONA +
    "\n\nTens acesso à Enciclopédia PHC destilada (154 funções internas, Xbase, dicas, artigos técnicos, índice do manual)." +
    ' Quando o prompt incluir REFERÊNCIAS DA ENCICLOPÉDIA PHC, usa-as e cita "segundo a Enciclopédia PHC".\n\n' +
    empresaResumo(c.company, c.plan) +
    contextoImplementacao(c.contexto) +
    (c.plan?.nota ? `\nPLANO DO ALUNO: ${c.plan.nota}` : "")
  );
}

/** mini-RAG por palavras-chave sobre a Enciclopédia (funções internas + Xbase) */
export function encContext(q: string): string {
  try {
    const low = String(q).toLowerCase();
    const out: string[] = [];
    const seen: Record<string, boolean> = {};
    const tryMatch = (list: [string, string][], tag: string) => {
      for (let i = 0; i < list.length && out.length < 4; i++) {
        const n = list[i][0] || "";
        const key = n.toLowerCase();
        if (key.length < 4 || seen[key]) continue;
        let hit = low.indexOf(key) >= 0;
        if (!hit) {
          const bare = key.split(/[^a-z0-9_]+/);
          for (const b of bare) {
            if (b.length >= 5 && low.indexOf(b) >= 0) {
              hit = true;
              break;
            }
          }
        }
        if (hit) {
          seen[key] = true;
          out.push(`${tag} ${n} — ${list[i][1] || "(ver Enciclopédia)"}`);
        }
      }
    };
    tryMatch(ENCYCLOPEDIA.funcoes, "[Função interna PHC]");
    tryMatch(ENCYCLOPEDIA.vfp, "[Função Xbase]");
    return out.length
      ? "REFERÊNCIAS DA ENCICLOPÉDIA PHC (use se relevante, cite como 'Enciclopédia PHC'):\n" +
          out.join("\n")
      : "";
  } catch {
    return "";
  }
}

export interface EncHit {
  tag: string;
  n: string;
  d: string;
}

/** pesquisa global na Enciclopédia (todas as secções) — usada na aba 📕 */
export function encSearchAll(q: string, limit = 150): EncHit[] {
  const low = q.toLowerCase();
  const out: EncHit[] = [];
  const scan = (list: [string, string][], tag: string) => {
    for (const [n, d] of list) {
      if (n.toLowerCase().indexOf(low) >= 0 || (d || "").toLowerCase().indexOf(low) >= 0) {
        out.push({ tag, n, d: d || "" });
      }
      if (out.length >= limit) return;
    }
  };
  scan(ENCYCLOPEDIA.funcoes, "Função PHC");
  scan(ENCYCLOPEDIA.vfp, "Xbase");
  scan(ENCYCLOPEDIA.dicas, "Dica");
  scan(ENCYCLOPEDIA.erros, "Erro comum");
  scan(ENCYCLOPEDIA.prog, "Programação");
  for (const m in ENCYCLOPEDIA.artigos) {
    scan(
      ENCYCLOPEDIA.artigos[m].map((x) => [`${m}: ${x[0]}`, x[1]] as [string, string]),
      "Artigo",
    );
  }
  for (const sec in ENCYCLOPEDIA.manual) {
    for (const t of ENCYCLOPEDIA.manual[sec]) {
      if (t.toLowerCase().indexOf(low) >= 0) out.push({ tag: `Manual · ${sec}`, n: t, d: "" });
      if (out.length >= limit) break;
    }
    if (out.length >= limit) break;
  }
  return out;
}

/** deteta tabelas PHC conhecidas mencionadas num texto */
export function detectTables(text: string): string[] {
  const low = String(text || "").toLowerCase();
  const toks = low.split(/[^a-z0-9_]+/);
  const known = new Set<string>(["dic"]);
  for (const t of PHC_SCHEMA.core) known.add(t[0]);
  for (const tb in PHC_SCHEMA.harvest) known.add(tb);
  const found: string[] = [];
  for (const tk of toks) {
    if (known.has(tk) && tk.length >= 2 && !found.includes(tk)) found.push(tk);
  }
  return found.slice(0, 8);
}

/** script T-SQL de descoberta sob medida para as tabelas do pedido */
export function buildDiscovery(tabs?: string[]): string {
  const t = tabs && tabs.length ? [...tabs] : ["ft", "cl"];
  const inList = t.map((x) => `'${x.toLowerCase()}'`).join(", ");
  let s = "";
  s +=
    "## 0. inspect the phc internal dictionary table (dic) structure\n" +
    "select column_name, data_type\nfrom information_schema.columns\nwhere table_name = 'dic'\norder by ordinal_position\n\n";
  s +=
    "## 1. sample dic content (metadata about tables and fields)\nselect top 30 * from dic with (nolock)\n\n";
  s +=
    "## 2. dic rows about the target tables (after step 0 reveals dic columns, a targeted query can be built)\nselect top 200 * from dic with (nolock)\n\n";
  s +=
    "## 3. columns of target tables\nselect table_name, column_name, data_type, character_maximum_length\n" +
    `from information_schema.columns\nwhere table_name in (${inList})\norder by table_name, ordinal_position\n\n`;
  s +=
    "## 4. custom user columns (u_ prefix) on target tables\nselect table_name, column_name\n" +
    `from information_schema.columns\nwhere table_name in (${inList}) and column_name like 'u[_]%'\norder by table_name, column_name\n\n`;
  s +=
    "## 5. declared foreign keys (phc relations are usually logical via stamp - this may return zero rows)\n" +
    "select fk.name, tp.name as parent_table, cp.name as parent_col, tr.name as ref_table, cr.name as ref_col\n" +
    "from sys.foreign_keys fk\njoin sys.foreign_key_columns fkc on fk.object_id = fkc.constraint_object_id\n" +
    "join sys.tables tp on fk.parent_object_id = tp.object_id\njoin sys.tables tr on fk.referenced_object_id = tr.object_id\n" +
    "join sys.columns cp on fkc.parent_object_id = cp.object_id and fkc.parent_column_id = cp.column_id\n" +
    "join sys.columns cr on fkc.referenced_object_id = cr.object_id and fkc.referenced_column_id = cr.column_id\n" +
    `where tp.name in (${inList}) or tr.name in (${inList})\n\n`;
  s += "## 6. one sample row per target table\n";
  for (const tb of t) s += `select top 1 * from ${tb.toLowerCase()} with (nolock)\n`;
  s +=
    "\n## 7. stored procedures and views (names)\nselect name from sys.procedures order by name\n" +
    "select table_name from information_schema.views order by table_name\n\n";
  s +=
    "## 8. sql agent jobs (may fail without msdb permission - ignore the error if so)\nselect name from msdb.dbo.sysjobs order by name\n";
  return s;
}

/** contexto de esquema injetado nos prompts SQL/Gerador */
export function schemaContext(q: string, userSchema?: string | null): string {
  const out = [
    "ESQUEMA PHC CONHECIDO (colhido da Enciclopédia PHC/Help Center — usar APENAS estes nomes; o que não estiver aqui é incerto):",
  ];
  for (const t of PHC_SCHEMA.core) out.push(`${t[0]} — ${t[1]}: ${t[2]}`);
  out.push("Universal: " + PHC_SCHEMA.universal);
  for (const c of PHC_SCHEMA.conv) out.push("Convenção: " + c);
  const low = String(q || "").toLowerCase();
  const extra: string[] = [];
  for (const tb in PHC_SCHEMA.harvest) {
    const re = new RegExp("(^|[^a-z0-9_])" + tb + "([^a-z0-9_]|$)");
    if (re.test(low) && extra.length < 8) {
      extra.push(`${tb}: ${PHC_SCHEMA.harvest[tb].f.slice(0, 20).join(", ")}`);
    }
  }
  if (extra.length)
    out.push("Tabelas mencionadas no pedido (campos vistos na documentação):\n" + extra.join("\n"));
  if (userSchema && String(userSchema).trim()) {
    out.push(
      "ESQUEMA REAL DA BD DO UTILIZADOR (colado por ele — AUTORIDADE MÁXIMA, prevalece sobre tudo o resto):\n" +
        String(userSchema).slice(0, 7000),
    );
  } else {
    out.push(
      "O utilizador AINDA não colou o esquema real da BD. Se precisares de campos/tabelas fora das listas:" +
        " (a) indica o pressuposto com o comentário -- [confirmar no Dicionário de Dados];" +
        " (b) sugere correr o script de descoberta (Gerador → 📐 Esquema) e colar o resultado.",
    );
  }
  return out.join("\n");
}

export interface GenMeta {
  conf: number | null;
  pend: string[];
  estado: "precisa_descoberta" | "pronto" | null;
  tabelas: string[];
}

/** interpreta o bloco ===META=== devolvido pelo modelo no Gerador */
export function parseMeta(txt: string): GenMeta {
  const meta: GenMeta = { conf: null, pend: [], estado: null, tabelas: [] };
  const src = String(txt);
  const m = src.match(/===META===([\s\S]*?)===FIM===/i);
  const blk = m ? m[1] : src;
  const c = blk.match(/confian[çc]a\s*:\s*(\d{1,3})/i);
  if (c) meta.conf = Math.max(0, Math.min(100, parseInt(c[1], 10)));
  const pd = blk.match(/pendentes\s*:\s*([^\n]*)/i);
  if (pd) {
    meta.pend = pd[1]
      .split("|")
      .map((x) => x.replace(/^[\s\-\d.)]+/, "").trim())
      .filter((x) => x && !/^nenhum/i.test(x));
  }
  const es = blk.match(/estado\s*:\s*(precisa_descoberta|pronto)/i);
  if (es) meta.estado = es[1].toLowerCase() as GenMeta["estado"];
  const tb = blk.match(/tabelas\s*:\s*([^\n]*)/i);
  if (tb) {
    meta.tabelas = tb[1]
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean);
  }
  if (!m && meta.conf === null) {
    const c2 = src.match(/confian[çc]a[^\d]{0,12}(\d{1,3})\s*%/i);
    if (c2) meta.conf = Math.max(0, Math.min(100, parseInt(c2[1], 10)));
  }
  return meta;
}

export function stripMeta(txt: string): string {
  return String(txt)
    .replace(/===META===[\s\S]*?===FIM===/i, "")
    .trim();
}

/** contexto de missão para o chat/aulas (igual ao legado) */
export function missionContext(lab: Lab, theory?: MissionTheory): string {
  return (
    `CONTEXTO — o aluno está na missão ${lab.id} (${lab.t}). Objetivo: ${lab.goal}` +
    (theory ? `\nConceito: ${theory.c}` : "") +
    `\nPassos: ${lab.steps.slice(0, 12).join(" | ")}`
  );
}

/** prompt de explicação simples (botão 🧠 Explicar) */
export function explainUserPrompt(text: string, ctxTitle = "missão"): string {
  const enc = encContext(text);
  return (
    `CONTEÚDO ORIGINAL (${ctxTitle}):\n${text.slice(0, 2600)}` +
    (enc ? `\n\n${enc}` : "") +
    "\n\nExplique em linguagem muito simples (para um leigo), em no máximo 110 palavras," +
    " aplicando à EMPRESA EM FOCO (dada no contexto), com exemplos simples. Pode citar números/valores quando ajudar."
  );
}

export function contextFromProgress(
  p: Pick<ProgressState, "company" | "contexto" | "plan">,
): PromptContext {
  return { company: p.company, contexto: p.contexto, plan: p.plan };
}
