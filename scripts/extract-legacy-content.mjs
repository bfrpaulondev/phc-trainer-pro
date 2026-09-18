#!/usr/bin/env node
/**
 * Extrai TODO o conteúdo do app legado (index.html na raiz, v5.3.0)
 * para pacotes JSON tipados em packages/content/src/data/.
 *
 * Uso: node scripts/extract-legacy-content.mjs [caminho/index.html]
 *
 * O ficheiro legado tem dois blocos:
 *  A) linhas ~153-420: dados puros (BELTS, DATA, SEGMENTOS, GLOSSARIO,
 *     CIRCUITOS, PAISES, GRADE_NOTES, ENC, SCHEMA, SQL_RULES, DISCOVERY_SQL,
 *     GUIA_HTML, GUIA_TOC)
 *  B) linhas ~422-2768: app React (JSX) com variáveis de dados/prompt no meio
 *     (PERSONA, ACHS, EL_VOICES, GR_VOICES, GEMINI_VOICES, GEMINI_MODELS,
 *     ENC_REF, TAB_HINTS, AI_PROVIDERS, GEN_TIPOS, GEN_GUIA, CODE_ROLE,
 *     GEN_CONTRACT, CHEERS, LADDER...)
 *
 * Estratégia: eval em VM (dados são literais JS; funções — ck/keyf — são
 * descartadas pelo JSON.stringify).
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const legacyPath = process.argv[2] || path.join(root, "index.html");
const outDir = path.join(root, "packages/content/src/data");
fs.mkdirSync(outDir, { recursive: true });

const lines = fs.readFileSync(legacyPath, "utf8").split("\n");

/** localiza a linha (1-based) que começa com `var NAME=` */
function varLine(name) {
  const i = lines.findIndex((l) => l.startsWith(`var ${name}=`));
  if (i < 0) throw new Error(`var ${name} não encontrada`);
  return i + 1;
}
/** eval de um intervalo de linhas (1-based, inclusivo) e devolve o valor de `var NAME=` */
function grab(name, from, to) {
  const src = lines.slice(from - 1, to).join("\n");
  const ctx = vm.createContext({ atob: (s) => Buffer.from(s, "base64").toString() });
  vm.runInContext(src + `\n;globalThis.__out=${name};`, ctx);
  return ctx.__out;
}
function write(file, data) {
  fs.writeFileSync(path.join(outDir, file), JSON.stringify(data, null, 1));
  const kb = (fs.statSync(path.join(outDir, file)).size / 1024).toFixed(1);
  console.log(`  ✔ ${file} (${kb} KB)`);
}

console.log("Extraindo conteúdo legado de", legacyPath);

/* ---------- Bloco A: dados puros (linha 153 até GUIA_TOC) ---------- */
const blockA = (() => {
  const from = lines.findIndex((l) => l.includes('"use strict"')) + 1; // pós <script>
  const to = varLine("GUIA_TOC");
  const src = lines.slice(from - 1, to).join("\n");
  const ctx = vm.createContext({});
  vm.runInContext(
    src +
      `\n;globalThis.__out={BELTS,DATA,SEGMENTOS,GLOSSARIO,CIRCUITOS,PAISES,GRADE_NOTES,ENC,SCHEMA,SQL_RULES,DISCOVERY_SQL,GUIA_HTML,GUIA_TOC};`,
    ctx,
  );
  return ctx.__out;
})();

const { DATA } = blockA;
write("belts.json", blockA.BELTS);
write("labs.json", DATA.labs);
write("theory.json", DATA.theory);
write("cards.json", DATA.cards);
write("quizzes.json", DATA.quizzes);
write("segments.json", blockA.SEGMENTOS);
write("glossary.json", blockA.GLOSSARIO);
write("circuits.json", blockA.CIRCUITOS);
write("countries.json", blockA.PAISES);
write("grade-notes.json", blockA.GRADE_NOTES);
write("encyclopedia.json", blockA.ENC);
write("schema.json", blockA.SCHEMA);
write("guide.json", { html: blockA.GUIA_HTML, toc: blockA.GUIA_TOC });
write("prompts-sql.json", {
  sqlRules: blockA.SQL_RULES,
  discoverySql: blockA.DISCOVERY_SQL,
});

/* ---------- Bloco B: variáveis dentro do JSX ---------- */
const B = {};
B.LADDER = grab("LADDER", varLine("LADDER"), varLine("LADDER"));
{
  // REP_TARGET=5, CARD_TARGET=5 na mesma linha
  const repLine = lines.findIndex((l) => l.startsWith("var REP_TARGET="));
  const m = lines[repLine].match(/REP_TARGET=(\d+),\s*CARD_TARGET=(\d+)/);
  B.REP_TARGET = Number(m[1]);
  B.CARD_TARGET = Number(m[2]);
}
B.PERSONA = grab("PERSONA", varLine("PERSONA"), varLine("PERSONA"));
B.CHEERS = grab("CHEERS", varLine("CHEERS"), varLine("CHEERS"));
B.TAB_HINTS = grab("TAB_HINTS", varLine("TAB_HINTS"), varLine("TAB_HINTS"));
B.ACHS = grab("ACHS", varLine("ACHS"), varLine("ACH_BUSY") - 1).map(
  ({ ck, ...rest }) => rest,
);
B.EL_VOICES = grab("EL_VOICES", varLine("EL_VOICES"), varLine("GR_VOICES") - 1);
B.GR_VOICES = grab("GR_VOICES", varLine("GR_VOICES"), varLine("GR_VOICES"));
B.GEMINI_VOICES = grab("GEMINI_VOICES", varLine("GEMINI_VOICES"), varLine("GEMINI_MODELS") - 1);
B.GEMINI_MODELS = grab("GEMINI_MODELS", varLine("GEMINI_MODELS"), varLine("GEMINI_MODELS"));
B.ENC_REF = grab("ENC_REF", varLine("ENC_REF"), varLine("ENCUI") - 1);
B.AI_PROVIDERS = grab("AI_PROVIDERS", varLine("AI_PROVIDERS"), varLine("LAST_PROVIDER") - 1).map(
  ({ keyf, ...rest }) => rest,
);
B.GEN_TIPOS = grab("GEN_TIPOS", varLine("GEN_TIPOS"), varLine("GEN_TIPOS"));
B.GEN_GUIA = grab("GEN_GUIA", varLine("GEN_GUIA"), varLine("CODE_ROLE") - 1);
B.CODE_ROLE = grab("CODE_ROLE", varLine("CODE_ROLE"), varLine("CODE_ROLE"));
const detectTablesLine = lines.findIndex((l) => l.startsWith("function detectTables")) + 1;
B.GEN_CONTRACT = grab("GEN_CONTRACT", varLine("GEN_CONTRACT"), detectTablesLine - 1);

write("achievements.json", B.ACHS);
write("voices.json", {
  elevenlabs: B.EL_VOICES,
  groq: B.GR_VOICES,
  geminiVoices: B.GEMINI_VOICES,
  geminiModels: B.GEMINI_MODELS,
});
write("enc-ref.json", B.ENC_REF);
write("ai-providers.json", B.AI_PROVIDERS);
write("prompts.json", {
  persona: B.PERSONA,
  codeRole: B.CODE_ROLE,
  genContract: B.GEN_CONTRACT,
  genTipos: B.GEN_TIPOS,
  genGuia: B.GEN_GUIA,
  cheers: B.CHEERS,
  tabHints: B.TAB_HINTS,
  ladder: B.LADDER,
  repTarget: B.REP_TARGET,
  cardTarget: B.CARD_TARGET,
});

console.log("Concluído —", fs.readdirSync(outDir).length, "ficheiros em packages/content/src/data/");
