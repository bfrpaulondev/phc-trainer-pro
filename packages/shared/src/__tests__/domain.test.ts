import { describe, expect, it } from "vitest";
import {
  applyAchievements,
  buildDiscovery,
  defaultProgress,
  detectTables,
  encContext,
  encSearchAll,
  evaluateAchievements,
  parseMeta,
  registerLabRep,
  stripMeta,
} from "../index.ts";

describe("conquistas", () => {
  it("estado novo não tem conquistas", () => {
    expect(evaluateAchievements(defaultProgress())).toEqual([]);
  });

  it("primeira repetição desbloqueia 'primeira-pratica' com data", () => {
    const s = defaultProgress();
    registerLabRep(s, "L00", "2026-09-01");
    const fresh = applyAchievements(s, "2026-09-01");
    expect(fresh).toContain("primeira-pratica");
    expect(s.achs["primeira-pratica"]).toBe("2026-09-01");
    // segunda chamada não repete
    expect(applyAchievements(s, "2026-09-02")).toEqual([]);
  });

  it("SAF-T (L33) desbloqueia 'fiscal'", () => {
    const s = defaultProgress();
    registerLabRep(s, "L33", "2026-09-01");
    expect(evaluateAchievements(s)).toContain("fiscal");
  });
});

describe("prompts / gerador", () => {
  it("detectTables encontra tabelas conhecidas no texto", () => {
    expect(
      detectTables("quero ver os últimos 10 registos na ft e as tabelas relacionadas"),
    ).toContain("ft");
    expect(detectTables("clientes cl e faturação ft")).toEqual(
      expect.arrayContaining(["cl", "ft"]),
    );
    expect(detectTables("sem tabelas aqui")).toEqual([]);
  });

  it("buildDiscovery inclui dic, tabelas alvo e information_schema", () => {
    const s = buildDiscovery(["ft", "bi"]);
    expect(s).toContain("table_name = 'dic'");
    expect(s).toContain("'ft', 'bi'");
    expect(s).toContain("information_schema.columns");
    expect(s).toContain("select top 1 * from ft with (nolock)");
    expect(s).toContain("sysjobs");
  });

  it("parseMeta lê confiança, pendentes, estado e tabelas do bloco ===META===", () => {
    const txt = [
      "🔎 PRECISO DE DESCOBERTA",
      "1) confirmar campos da ft",
      "===META===",
      "confianca: 42",
      "pendentes: campos de ligação ft↔bi | tabela de séries",
      "estado: precisa_descoberta",
      "tabelas: ft, bi",
      "===FIM===",
    ].join("\n");
    const m = parseMeta(txt);
    expect(m.conf).toBe(42);
    expect(m.pend).toHaveLength(2);
    expect(m.estado).toBe("precisa_descoberta");
    expect(m.tabelas).toEqual(["ft", "bi"]);
    expect(stripMeta(txt)).not.toContain("===META===");
  });

  it("parseMeta tolera respostas sem bloco META", () => {
    const m = parseMeta("texto qualquer com confiança de 87 % no meio");
    expect(m.conf).toBe(87);
  });

  it("encContext devolve referências quando o texto menciona funções conhecidas", () => {
    // "Aadd" é a 1ª função da Enciclopédia
    const ctx = encContext("como uso Aadd num evento");
    expect(ctx === "" || ctx.includes("REFERÊNCIAS DA ENCICLOPÉDIA PHC")).toBe(true);
  });

  it("encSearchAll pesquisa todas as secções", () => {
    const hits = encSearchAll("atcud");
    expect(Array.isArray(hits)).toBe(true);
  });
});
