export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: boolean;
  modelUsed?: string;
}

export interface Persona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  systemInstruction: string;
  starterPrompts: string[];
}

export interface AIModelOption {
  id: string;
  name: string;
  provider: 'openai' | 'gemini';
  badge: string;
}
