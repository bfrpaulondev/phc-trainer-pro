/** Cache IndexedDB de áudio TTS (o mesmo texto nunca gera custo 2×) — porta do VOICEIDB legado. */
import { hashStr } from "@phc/shared";

const DB_NAME = "phc-voice-v6";
const STORE = "audio";
let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export async function audioCacheGet(key: string): Promise<Blob | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const rq = tx.objectStore(STORE).get(key);
      rq.onsuccess = () => resolve((rq.result as Blob) ?? null);
      rq.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function audioCacheSet(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, key);
  } catch {
    /* quota — ignora */
  }
}

export function audioKeyFor(provider: string, voice: string, text: string): string {
  return hashStr(`${provider}|${voice}|${text}`);
}

function base64ToBlob(b64: string, mime: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

let current: HTMLAudioElement | null = null;

export function stopAudio(): void {
  if (current) {
    current.pause();
    current = null;
  }
}

/** pede TTS ao servidor (com cache IDB) e reproduz; fallback: voz do navegador */
export async function speakCloud(
  text: string,
  provider: "gemini" | "elevenlabs" | "groq",
  voice?: string,
): Promise<void> {
  const key = audioKeyFor(provider, voice || "", text);
  let blob = await audioCacheGet(key);
  if (!blob) {
    const { apiFetch } = await import("./api.ts");
    const r = await apiFetch<{ audio: string; mimeType: string }>("/api/ai/tts", {
      method: "POST",
      body: { text, provider, voice },
    });
    blob = base64ToBlob(r.audio, r.mimeType);
    await audioCacheSet(key, blob);
  }
  stopAudio();
  const url = URL.createObjectURL(blob);
  const a = new Audio(url);
  current = a;
  await new Promise<void>((resolve, reject) => {
    a.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    a.onerror = () => reject(new Error("falha ao reproduzir áudio"));
    void a.play();
  });
}

/** voz do navegador (grátis/offline) */
export function speakBrowser(text: string, rate = 1): Promise<void> {
  return new Promise((resolve) => {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-BR";
      u.rate = rate;
      const voices = speechSynthesis.getVoices();
      const pt =
        voices.find((v) => /pt[-_]BR/i.test(v.lang) && /natural|online/i.test(v.name)) ||
        voices.find((v) => /pt/i.test(v.lang));
      if (pt) u.voice = pt;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      speechSynthesis.speak(u);
    } catch {
      resolve();
    }
  });
}
