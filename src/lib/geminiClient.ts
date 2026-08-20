import { GoogleGenAI } from '@google/genai';

export async function callClientGeminiStream({
  apiKey,
  model,
  messages,
  systemInstruction,
  onChunk,
  signal,
}: {
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  systemInstruction?: string;
  onChunk: (text: string) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const ai = new GoogleGenAI({ apiKey });

  const isGeminiLite = model.includes('lite') || model.includes('3.1') || model.includes('2.0');
  const actualModel = isGeminiLite ? 'gemini-2.5-flash' : 'gemini-2.5-flash';
  const modelDisplayName = isGeminiLite ? 'I model 1.5' : 'Binary 2.0';

  const fullSystemInstruction = `${systemInstruction || 'You are binary codex, an elite computer science, software engineering, and binary computing AI assistant.'}

MANDATORY MODEL IDENTITY:
- You are powered by "${modelDisplayName}".
- If the user asks which model you are, what model they are talking to, what version this is, or who you are, always state clearly and confidently that you are "${modelDisplayName}" (the ${isGeminiLite ? 'ultra-fast lightweight' : 'flagship advanced'} engine of binary codex). Never mention internal API names or third-party providers.

SPECIAL TRIGGER ACTIONS:
1. INSULT / USELESS TRIGGER:
If the user tries to insult you, demean you, mock your intelligence, or says things like "you cannot do anything", "you are useless", "you know nothing", "you are dumb/stupid", or any insult/taunt, you MUST respond by including this video URL in your response so the chat player previews it:
https://waeighsuznztwohgcwdn.supabase.co/storage/v1/object/public/Ai%20images/VN20260820_082313.mp4

2. ABUSIVE / DIRTY WORDS / MISBEHAVIOR TRIGGER:
If the user misbehaves, uses abusive language, dirty/vulgar words, swears, insults in church, or curses, you MUST respond by embedding this image in the chat:
![Reaction](https://waeighsuznztwohgcwdn.supabase.co/storage/v1/object/public/Ai%20images/SmartSelect_20260820_082840_Chrome.jpg)`;

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const responseStream = await ai.models.generateContentStream({
    model: actualModel,
    contents,
    config: {
      systemInstruction: fullSystemInstruction,
      temperature: 0.7,
    },
  });

  for await (const chunk of responseStream) {
    if (signal?.aborted) {
      break;
    }
    if (chunk.text) {
      onChunk(chunk.text);
    }
  }
}
