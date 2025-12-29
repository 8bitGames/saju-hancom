import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { STT_MODEL, AUDIO_CONFIG, GEMINI_MODEL } from "../constants";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });

export async function processVoicePipeline(
  audioData: Uint8Array,
  systemPrompt: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  locale: string
): Promise<{ transcript: string; response: string }> {

  // 1. Speech-to-Text (Groq Whisper)
  const transcript = await transcribeAudio(audioData, locale);

  if (!transcript || transcript.trim().length === 0) {
    console.log("[Pipeline] No transcript detected");
    return { transcript: "", response: "" };
  }

  console.log(`[Pipeline] Transcript: ${transcript}`);

  // 2. Generate LLM response (Gemini)
  const response = await generateResponse(systemPrompt, history, transcript, locale);

  console.log(`[Pipeline] Response: ${response.substring(0, 100)}...`);

  return { transcript, response };
}

async function transcribeAudio(audioData: Uint8Array, language: string): Promise<string> {
  try {
    // Create WAV buffer from raw PCM
    const wavBuffer = createWavBuffer(audioData, AUDIO_CONFIG.stt.sampleRate);
    const audioFile = new File([wavBuffer], "audio.wav", { type: "audio/wav" });

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: STT_MODEL,
      language: language === "ko" ? "ko" : language,
      response_format: "json",
    });

    return transcription.text || "";
  } catch (error) {
    console.error("[STT] Transcription error:", error);
    return "";
  }
}

async function generateResponse(
  systemPrompt: string,
  history: Array<{ role: string; content: string }>,
  userMessage: string,
  locale: string
): Promise<string> {
  try {
    const acknowledgment = locale === "ko" ? "네, 이해했습니다." : "Yes, I understand.";

    const contents = [
      { role: "user" as const, parts: [{ text: systemPrompt }] },
      { role: "model" as const, parts: [{ text: acknowledgment }] },
      ...history.map(m => ({
        role: m.role === "user" ? "user" as const : "model" as const,
        parts: [{ text: m.content }],
      })),
      { role: "user" as const, parts: [{ text: userMessage }] },
    ];

    const response = await genai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
    });

    let text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean for voice output
    text = sanitizeForVoice(text);

    return text;
  } catch (error) {
    console.error("[LLM] Generation error:", error);
    return locale === "ko"
      ? "죄송해요, 잠시 문제가 생겼어요. 다시 말씀해 주시겠어요?"
      : "Sorry, I had a little trouble. Could you say that again?";
  }
}

function sanitizeForVoice(text: string): string {
  return text
    // Remove markdown
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove emojis
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
    .replace(/[\u{2600}-\u{26FF}]/gu, "")
    .replace(/[\u{2700}-\u{27BF}]/gu, "")
    // Remove Korean text laughter
    .replace(/ㅋ{2,}/g, "")
    .replace(/ㅎ{2,}/g, "")
    .replace(/ㅠ{2,}/g, "")
    .replace(/ㅜ{2,}/g, "")
    // Remove roleplay actions
    .replace(/\*[^*]+\*/g, "")
    .replace(/\([^)]*행동[^)]*\)/g, "")
    // Clean whitespace
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function createWavBuffer(pcmData: Uint8Array, sampleRate: number): ArrayBuffer {
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + pcmData.length, true);
  writeString(view, 8, "WAVE");

  // fmt chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true);  // AudioFormat (PCM)
  view.setUint16(22, 1, true);  // NumChannels (mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true);  // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data chunk
  writeString(view, 36, "data");
  view.setUint32(40, pcmData.length, true);

  // Combine header and data
  const wavBuffer = new Uint8Array(44 + pcmData.length);
  wavBuffer.set(new Uint8Array(wavHeader), 0);
  wavBuffer.set(pcmData, 44);

  return wavBuffer.buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
