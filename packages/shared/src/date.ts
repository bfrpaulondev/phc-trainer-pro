/** Utilitários de data (ISO local, sem dependências) — portados do legado. */

export function p2(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

export function todayISO(now = new Date()): string {
  return `${now.getFullYear()}-${p2(now.getMonth() + 1)}-${p2(now.getDate())}`;
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}

export function fmtD(iso: string | null | undefined): string {
  if (!iso) return "—";
  const p = iso.split("-");
  return `${p[2]}/${p[1]}`;
}

/** hash determinístico curto (djb2) — chaves de cache de IA/voz */
export function hashStr(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return "h" + h.toString(36) + "_" + s.length;
}
