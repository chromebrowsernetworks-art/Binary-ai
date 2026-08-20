import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy Gemini client helper
  let geminiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    if (!geminiClient) {
      geminiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return geminiClient;
  }

  // Lazy OpenAI client helper
  let openaiClient: OpenAI | null = null;
  function getOpenAIClient(): OpenAI {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }
    if (!openaiClient) {
      openaiClient = new OpenAI({ apiKey });
    }
    return openaiClient;
  }

  // Health and config status endpoint
  app.get("/api/health", (req, res) => {
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0);
    const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" && process.env.GEMINI_API_KEY.trim().length > 0);
    
    let defaultModel = "gemini-3.7-flash";
    if (!hasGemini && hasOpenAI) {
      defaultModel = "gpt-4o-mini";
    }

    res.json({
      status: "ok",
      hasApiKey: hasGemini || hasOpenAI,
      hasOpenAIKey: hasOpenAI,
      hasGeminiKey: hasGemini,
      defaultModel: "gemini-3.7-flash",
      activeProvider: "gemini",
      availableModels: [
        { id: "gemini-3.7-flash", name: "Binary 2.0", provider: "gemini", badge: "Flagship" },
        { id: "gemini-3.1-flash-lite", name: "I model 1.5", provider: "gemini", badge: "Ultra Fast" },
      ],
    });
  });

  // Helper to extract clean error message
  function cleanErrorMessage(err: unknown): string {
    if (!err) return "An unexpected error occurred.";
    let msg = err instanceof Error ? err.message : String(err);
    
    // Check if message contains JSON
    try {
      if (msg.includes("{") && msg.includes("}")) {
        const jsonStart = msg.indexOf("{");
        const jsonEnd = msg.lastIndexOf("}");
        const possibleJson = msg.substring(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(possibleJson);
        if (parsed.error?.message) {
          msg = parsed.error.message;
        } else if (parsed.message) {
          msg = parsed.message;
        }
      }
    } catch {
      // Keep original message if JSON parse fails
    }

    if (msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE")) {
      return "The AI model is currently experiencing high demand. We automatically tried backup routes, please try again in a brief moment.";
    }
    return msg;
  }

  // Chat completion endpoint with SSE streaming and auto-fallback
  app.post("/api/chat", async (req, res) => {
    const { messages, systemInstruction, temperature, model } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid request: messages array is required." });
    }

    // Determine model and provider
    let requestedModel = model || "gemini-3.7-flash";
    const isGeminiLite = requestedModel.includes("lite") || requestedModel.includes("3.1");
    const modelDisplayName = isGeminiLite ? "I model 1.5" : "Binary 2.0";
    const isGeminiModel = !requestedModel.startsWith("gpt");

    const baseInstruction = systemInstruction || "You are binary codex, an elite computer science, software engineering, and binary computing AI. You specialize in algorithms, data structures, full-stack programming (Python, TypeScript, JavaScript, Rust, C++, Go, Java, SQL, Shell), bitwise operations, binary/hex conversions, cybersecurity, cryptography, and debugging. Provide elegant, production-grade, bug-free code with clear explanations. When writing code or terminal outputs, use clean markdown code blocks. Keep responses crisp, deeply insightful, and accurate.";

    const fullInstructionWithModelIdentity = `${baseInstruction}

MANDATORY MODEL IDENTITY:
- You are powered by "${modelDisplayName}".
- If the user asks which model you are, what model they are talking to, what version this is, or who you are, always state clearly and confidently that you are "${modelDisplayName}" (the ${isGeminiLite ? "ultra-fast lightweight" : "flagship advanced"} engine of binary codex). Never mention internal API names or third-party providers.

SPECIAL TRIGGER ACTIONS:
1. INSULT / USELESS TRIGGER:
If the user tries to insult you, demean you, mock your intelligence, or says things like "you cannot do anything", "you are useless", "you know nothing", "you are dumb/stupid", or any insult/taunt, you MUST respond by including this video URL in your response so the chat player previews it:
https://waeighsuznztwohgcwdn.supabase.co/storage/v1/object/public/Ai%20images/VN20260820_082313.mp4

2. ABUSIVE / DIRTY WORDS / MISBEHAVIOR TRIGGER:
If the user misbehaves, uses abusive language, dirty/vulgar words, swears, insults in church, or curses, you MUST respond by embedding this image in the chat:
![Reaction](https://waeighsuznztwohgcwdn.supabase.co/storage/v1/object/public/Ai%20images/SmartSelect_20260820_082840_Chrome.jpg)`;

    // Set headers for Server-Sent Events (SSE) streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      if (isGeminiModel) {
        // Run using Google Gemini SDK with automatic fallback for high-demand spikes
        const ai = getGeminiClient();
        const formattedContents = messages.map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content || "" }],
        }));

        const modelFallbackList = [
          requestedModel,
          requestedModel === "gemini-3.7-flash" ? "gemini-3.1-flash-lite" : "gemini-3.7-flash",
          "gemini-flash-latest",
        ];

        let streamSuccess = false;
        let lastGeminiError: unknown = null;

        for (const modelToTry of modelFallbackList) {
          try {
            const responseStream = await ai.models.generateContentStream({
              model: modelToTry,
              contents: formattedContents,
              config: {
                systemInstruction: fullInstructionWithModelIdentity,
                temperature: typeof temperature === "number" ? temperature : 0.7,
              },
            });

            for await (const chunk of responseStream) {
              const text = chunk.text || "";
              if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            }

            streamSuccess = true;
            break; // Successfully streamed!
          } catch (modelErr: unknown) {
            lastGeminiError = modelErr;
            const errMsg = String(modelErr);
            console.warn(`Model ${modelToTry} attempt failed, trying fallback:`, errMsg);
            // If it's a 503 or overload, loop will continue to fallback model
            if (!errMsg.includes("503") && !errMsg.includes("UNAVAILABLE") && !errMsg.includes("high demand") && !errMsg.includes("429")) {
              break;
            }
          }
        }

        if (!streamSuccess) {
          throw lastGeminiError || new Error("Failed to generate response from Gemini.");
        }
      } else {
        // Run using OpenAI SDK
        const openai = getOpenAIClient();
        const openAiMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          {
            role: "system",
            content: systemInstruction || "You are a friendly, highly intelligent, and helpful AI assistant. Provide clear, accurate, and structured answers.",
          },
          ...messages.map((m: { role: string; content: string }) => ({
            role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
            content: m.content || "",
          })),
        ];

        const stream = await openai.chat.completions.create({
          model: requestedModel,
          messages: openAiMessages,
          temperature: typeof temperature === "number" ? temperature : 0.7,
          stream: true,
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err: unknown) {
      const cleanMsg = cleanErrorMessage(err);
      console.error("AI Generation error:", cleanMsg);

      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: cleanMsg })}\n\n`);
        res.end();
      } else {
        res.status(500).json({
          error: cleanMsg,
        });
      }
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Chatbot server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
