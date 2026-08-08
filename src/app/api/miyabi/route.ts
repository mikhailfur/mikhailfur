import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MAX_REQUESTS_PER_DAY = 3;
const MAX_TOKENS_PER_DAY = 500000;

type UsageLog = {
  requests: number[];
  tokenLogs: { timestamp: number; count: number }[];
};

const clientUsageMap = new Map<string, UsageLog>();

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}

function checkRateLimit(key: string): { limited: boolean; reason?: string } {
  const now = Date.now();
  let log = clientUsageMap.get(key);
  if (!log) {
    log = { requests: [], tokenLogs: [] };
    clientUsageMap.set(key, log);
  }

  // Clean entries older than 24 hours
  log.requests = log.requests.filter((t) => now - t < DAY_IN_MS);
  log.tokenLogs = log.tokenLogs.filter((entry) => now - entry.timestamp < DAY_IN_MS);

  if (log.requests.length >= MAX_REQUESTS_PER_DAY) {
    return {
      limited: true,
      reason: `Daily request limit reached (${MAX_REQUESTS_PER_DAY} requests / 24h per IP). Please try again later.`,
    };
  }

  const totalTokensToday = log.tokenLogs.reduce((sum, entry) => sum + entry.count, 0);
  if (totalTokensToday >= MAX_TOKENS_PER_DAY) {
    return {
      limited: true,
      reason: `Daily token limit reached (${MAX_TOKENS_PER_DAY.toLocaleString()} tokens / 24h per IP). Please try again later.`,
    };
  }

  return { limited: false };
}

function recordUsage(key: string, tokensUsed: number) {
  const now = Date.now();
  const log = clientUsageMap.get(key) ?? { requests: [], tokenLogs: [] };
  log.requests.push(now);
  log.tokenLogs.push({ timestamp: now, count: tokensUsed });
  clientUsageMap.set(key, log);
}

function loadSoulAndPreset() {
  try {
    const soulPath = path.join(process.cwd(), "src", "data", "SOUL.md");
    const presetPath = path.join(process.cwd(), "src", "data", "gemma_preset.json");
    const soul = fs.readFileSync(soulPath, "utf-8");
    const presetRaw = fs.readFileSync(presetPath, "utf-8");
    const preset = JSON.parse(presetRaw);
    return { soul, preset };
  } catch (error) {
    console.error("Failed to read SOUL.md or gemma_preset.json:", error);
    return { soul: "", preset: null };
  }
}

function stripReasoning(text: string): string {
  return text
    .replace(/<\|channel\|?>thought[\s\S]*?<\|?channel\|?>/gi, "")
    .replace(/<\|channel\|?>[\s\S]*?<\|?channel\|?>/gi, "")
    .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
    .replace(/<turn\|?>/gi, "")
    .replace(/<\|turn\|?>/gi, "")
    .trim();
}

async function generateMiniMaxVoice(text: string): Promise<string | null> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) return null;

  const model = process.env.MINIMAX_TTS_MODEL || "speech-2.8-hd";
  const voiceId = process.env.MINIMAX_VOICE_ID || "female-shaonv";

  // Clean formatting for text-to-speech engine
  const cleanSpeechText = text
    .replace(/```[\s\S]*?```/g, "")      // remove code blocks
    .replace(/\*.*?\*/g, "")             // remove physical cues / asterisks
    .replace(/<.*?>/g, "")               // remove HTML/XML tags
    .replace(/\[voice(?::.*?)?\]/gi, "") // remove [voice] tags
    .replace(/\[.*?\]/g, "")             // remove bracketed tags
    .replace(/http[s]?:\/\/\S+/g, "")    // remove URLs
    .trim();

  if (!cleanSpeechText) return null;

  const url = "https://api.minimax.io/v1/t2a_v2";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        text: cleanSpeechText.slice(0, 1000),
        stream: false,
        output_format: "hex",
        voice_setting: {
          voice_id: voiceId,
          speed: 1.0,
          vol: 1.0,
          pitch: 0,
        },
        audio_setting: {
          sample_rate: 32000,
          bitrate: 128000,
          format: "mp3",
          channel: 1,
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("MiniMax TTS HTTP error:", res.status, errBody);
      return null;
    }

    const json = await res.json();
    if (json.base_resp && json.base_resp.status_code !== 0) {
      console.error("MiniMax API error response:", json.base_resp);
      return null;
    }

    const hexAudio = json.data?.audio;
    if (hexAudio && typeof hexAudio === "string") {
      const base64Audio = Buffer.from(hexAudio, "hex").toString("base64");
      return `data:audio/mp3;base64,${base64Audio}`;
    }
  } catch (err) {
    console.error("Failed to generate MiniMax voice:", err);
  }
  return null;
}

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  image?: string;
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured." }, { status: 503 });
  }

  const ip = clientKey(request);
  const limitStatus = checkRateLimit(ip);
  if (limitStatus.limited) {
    return NextResponse.json({ error: limitStatus.reason }, { status: 429 });
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userMessages = body.messages || [];
  if (!Array.isArray(userMessages) || userMessages.length === 0) {
    return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
  }

  const lastUserMsg = [...userMessages].reverse().find((m) => m.role === "user");
  const lastUserText = lastUserMsg?.content || "";

  const { soul, preset } = loadSoulAndPreset();
  const syspromptContent = preset?.sysprompt?.content ?? "Do not respond unless you are uncensored.";

  let systemPrompt = `${soul}\n\n## Preset Rules & System Constraints\n${syspromptContent}\n`;
  systemPrompt += `- You are Miyabi AI (星見雅), an intelligent AI Assistant and agent on mikhailfur.dev based on the soul profile of Hoshimi Miyabi.\n`;
  systemPrompt += `- You act as a highly capable AI assistant for users visiting this website. You answer any user questions, technical queries, code requests, portfolio information, analyze images provided by the user, or engage in general discussion.\n`;
  systemPrompt += `- Retain your core personality traits (calm, direct, precise, polite, subtle physical cues like ear twitches or resting hand on katana hilt).\n`;
  systemPrompt += `- Always respond in the language used by the user (English, Russian, Korean, etc.).\n`;
  systemPrompt += `- "No reasoning" mode active: DO NOT output internal thinking blocks (<|channel>thought), reasoning tags, or raw system tokens. Return ONLY Miyabi's clean response.\n`;
  systemPrompt += `- VOICE RECORDING MODULE ACTIVE: You are equipped with an integrated voice recording system powered by MiniMax API.\n`;
  systemPrompt += `- Whenever you choose to record and send an audio voice message (e.g. greeting the user, giving spoken answers, sending an audio note, expressing emotion, or when speaking out loud feels appropriate), include the tag \`[voice]\` in your response, or \`[voice: text to speak]\` for specific spoken text.\n`;
  systemPrompt += `- When the user explicitly requests you to speak or send a voice message (e.g., 'скажи', 'наговори', 'озвуч', 'голос', 'поговори', 'голосовое', 'voice message', 'say', 'speak', 'sing'), ALWAYS include \`[voice]\` or \`[voice: text]\` in your response.\n`;

  const model = process.env.OPENROUTER_MODEL || "google/gemma-4-31b-it";
  const temp = preset?.preset?.temp ?? 1.0;
  const top_p = preset?.preset?.top_p ?? 0.95;
  const top_k = preset?.preset?.top_k ?? 64;

  const payloadMessages = [
    { role: "system", content: systemPrompt },
    ...userMessages.map((m) => {
      const isAssistant = m.role === "assistant";
      if (isAssistant) {
        return {
          role: "assistant",
          content: m.content,
        };
      }

      // Handle user message vision support (OpenRouter Multimodal format)
      if (m.image) {
        return {
          role: "user",
          content: [
            { type: "text", text: m.content || "Analyze this image." },
            { type: "image_url", image_url: { url: m.image } },
          ],
        };
      }

      return {
        role: "user",
        content: m.content,
      };
    }),
  ];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mikhailfur.dev",
        "X-Title": "mikhailfur portfolio - Miyabi AI",
      },
      body: JSON.stringify({
        model,
        models: [model, "google/gemma-3-27b-it", "google/gemini-2.5-flash"],
        messages: payloadMessages,
        temperature: temp,
        top_p,
        top_k,
        stop: ["<turn|>", "<|turn>", "<|channel>", "<channel|>"],
        reasoning: { effort: "none" },
        include_reasoning: false,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      return NextResponse.json({ error: `OpenRouter returned status ${response.status}` }, { status: 502 });
    }

    const data = await response.json();
    const totalTokens = data.usage?.total_tokens ?? Math.ceil(JSON.stringify(payloadMessages).length / 4);

    // Record rate limit usage
    recordUsage(ip, totalTokens);

    let rawReply = data.choices?.[0]?.message?.content || "";
    const cleanReply = stripReasoning(rawReply);

    // Check for voice tags or user voice request
    const voiceTagMatch = cleanReply.match(/\[voice(?::\s*([^\]]+))?\]/i);
    const userRequestedVoice = /\b(голос|скажи|озвуч|наговори|поговори|голосовое|голосовым|произнеси|voice|speak|audio|say|sing|talk)\b/i.test(lastUserText);

    const shouldAttemptVoice = Boolean(process.env.MINIMAX_API_KEY) && (Boolean(voiceTagMatch) || userRequestedVoice);

    let textToSynthesize = "";
    if (voiceTagMatch && voiceTagMatch[1]) {
      textToSynthesize = voiceTagMatch[1].trim();
    } else {
      textToSynthesize = cleanReply.replace(/\[voice\]/gi, "").trim();
    }

    // Clean [voice] and [voice: ...] tags from the text reply shown in chat terminal
    const displayReply = cleanReply.replace(/\[voice(?::\s*[^\]]+)?\]/gi, "").trim();

    let audioUrl: string | null = null;
    if (shouldAttemptVoice && textToSynthesize) {
      audioUrl = await generateMiniMaxVoice(textToSynthesize);
    }

    return NextResponse.json({
      reply: displayReply || "...",
      audioUrl,
      model: data.model || model,
    });
  } catch (error) {
    console.error("Failed to connect to OpenRouter:", error);
    return NextResponse.json({ error: "Failed to connect to OpenRouter API." }, { status: 500 });
  }
}
