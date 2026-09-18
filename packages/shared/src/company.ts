/** Fábrica de empresa de treino a partir do segmento (portado do legado: companyFrom). */
import { SEGMENTS, type Segment } from "@phc/content";
import type { CompanyState } from "./types.ts";

export { SEGMENTS };

export function shortName(nome: string): string {
  const s = String(nome || "")
    .replace(/[,.\-–—]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (s.length <= 2) return s.join(" ");
  return s.slice(0, 2).join(" ");
}

export function segmentById(id: string): Segment | undefined {
  return SEGMENTS.find((s) => s.id === id);
}

export function companyFromSegment(segId: string, nome?: string, cidade?: string): CompanyState {
  const seg = segmentById(segId) ?? SEGMENTS[0];
  const e = seg.empresa;
  const nomeFinal = nome || String(e.nome);
  return {
    segId: seg.id,
    segNome: seg.nome,
    segIco: seg.ico,
    nome: nomeFinal,
    curto: shortName(nomeFinal),
    prefixo: String(e.prefixo ?? ""),
    nif: e.nif != null ? String(e.nif) : undefined,
    morada: String(e.morada ?? ""),
    cidade: cidade || String(e.cidade ?? ""),
    cae: String(e.cae ?? ""),
    cliente: String(e.cliente ?? ""),
    clienteCurto: String(e.clienteCurto ?? ""),
    nifCliente: e.nifCliente != null ? String(e.nifCliente) : undefined,
    fornecedor: String(e.fornecedor ?? ""),
    fornecedorCurto: String(e.fornecedorCurto ?? ""),
    nifForn: e.nifForn != null ? String(e.nifForn) : undefined,
    armazem1: e.armazem1 != null ? String(e.armazem1) : undefined,
    armazem2: e.armazem2 != null ? String(e.armazem2) : undefined,
    artigos: Array.isArray(e.artigos) ? (e.artigos as string[]) : undefined,
    necessidades: Array.isArray(e.necessidades) ? (e.necessidades as string[]) : undefined,
    phcForte: seg.phcForte != null ? String(seg.phcForte) : undefined,
    futuro: seg.futuro != null ? String(seg.futuro) : undefined,
  };
}

export function defaultCompany(): CompanyState {
  return companyFromSegment("distrib");
}

/** substituição dos nomes genéricos pelo nome da empresa do aluno (portado do legado: emp) */
export function applyCompanyText(text: string, c?: CompanyState | null): string {
  if (typeof text !== "string" || !c) return text;
  let out = text;
  const pairs: [string, string | undefined][] = [
    ["EMPRESA MODELO, LDA", c.nome],
    ["CLIENTE MODELO, LDA", c.cliente],
    ["FORNECEDOR MODELO, S.A.", c.fornecedor],
    ["ARMAZEM-CENTRAL", c.armazem1],
    ["ARMAZEM-LOJA2", c.armazem2],
    ["cliente Modelo", c.clienteCurto ? `cliente ${c.clienteCurto}` : undefined],
    ["fornecedor Modelo", c.fornecedorCurto ? `fornecedor ${c.fornecedorCurto}` : undefined],
    ["Cliente Modelo", c.clienteCurto || c.cliente],
    ["Fornecedor Modelo", c.fornecedorCurto || c.fornecedor],
    ["EMPRESA MODELO", c.curto || c.nome],
    ["Empresa Modelo", c.curto || c.nome],
    ["MOD-", c.prefixo ? `${c.prefixo}-` : undefined],
  ];
  for (const [from, to] of pairs) {
    if (to) out = out.split(from).join(to);
  }
  return out;
}
