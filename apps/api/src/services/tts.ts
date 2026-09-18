/** TTS no servidor — Gemini (recomendado), ElevenLabs e Groq (porta do legado v4.1). */
import { ApiError } from "../lib/errors.ts";

export interface TtsResult {
  audio: string; // base64
  mimeType: string;
  provider: string;
}

const GEMINI_DEFAULT_MODEL = "gemini-3.1-flash-tts-preview";

export async function geminiTts(
  key: string,
  text: string,
  voice = "Sulafat",
  model = GEMINI_DEFAULT_MODEL,
): Promise<TtsResult> {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
            languageCode: "pt-BR",
          },
        },
      }),
    },
  );
  if (!r.ok)
    throw new ApiError(502, `Gemini TTS HTTP ${r.status}: ${(await r.text()).slice(0, 150)}`);
  const j = (await r.json()) as {
    candidates?: {
      content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] };
    }[];
  };
  const inline = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData;
  if (!inline?.data) throw new ApiError(502, "Gemini TTS: resposta sem áudio");
  return { audio: inline.data, mimeType: inline.mimeType || "audio/wav", provider: "gemini" };
}

export async function elevenlabsTts(
  key: string,
  text: string,
  voice = "ErXwobaYiN019PkySvjV",
): Promise<TtsResult> {
  const r = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  );
  if (!r.ok)
    throw new ApiError(502, `ElevenLabs HTTP ${r.status}: ${(await r.text()).slice(0, 150)}`);
  const buf = Buffer.from(await r.arrayBuffer());
  return { audio: buf.toString("base64"), mimeType: "audio/mpeg", provider: "elevenlabs" };
}

export async function groqTts(key: string, text: string, voice = "troy"): Promise<TtsResult> {
  const r = await fetch("https://api.groq.com/openai/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "canopylabs/orpheus-v1-english",
      voice,
      input: text,
      response_format: "mp3",
    }),
  });
  if (!r.ok)
    throw new ApiError(502, `Groq TTS HTTP ${r.status}: ${(await r.text()).slice(0, 150)}`);
  const buf = Buffer.from(await r.arrayBuffer());
  return { audio: buf.toString("base64"), mimeType: "audio/mpeg", provider: "groq" };
}
