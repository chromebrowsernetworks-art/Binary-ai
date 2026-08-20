import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { PersonaModal } from './components/PersonaModal';
import { BeginnerGuideModal } from './components/BeginnerGuideModal';
import { BinaryStreamBackground } from './components/BinaryStreamBackground';
import { Message, Persona, AIModelOption } from './types';
import { DEFAULT_PERSONAS } from './personas';

const DEFAULT_MODELS: AIModelOption[] = [
  { id: 'gemini-3.7-flash', name: 'Binary 2.0', provider: 'gemini', badge: 'Flagship' },
  { id: 'gemini-3.1-flash-lite', name: 'I model 1.5', provider: 'gemini', badge: 'Ultra Fast' },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentPersona, setCurrentPersona] = useState<Persona>(DEFAULT_PERSONAS[0]);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.7-flash');
  const [availableModels, setAvailableModels] = useState<AIModelOption[]>(DEFAULT_MODELS);
  const [isStreaming, setIsStreaming] = useState(false);
  const [apiKeyReady, setApiKeyReady] = useState(true);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check health status on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.availableModels && Array.isArray(data.availableModels)) {
          setAvailableModels(data.availableModels);
        }
        if (data.defaultModel) {
          setSelectedModel(data.defaultModel);
        }
        if (typeof data.hasApiKey === 'boolean') {
          setApiKeyReady(data.hasApiKey);
        }
      })
      .catch((err) => console.log('Health check error:', err));
  }, []);

  // Smooth scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle stopping active response generation
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((msg, index) =>
        index === prev.length - 1 && msg.isStreaming
          ? { ...msg, isStreaming: false }
          : msg
      )
    );
  };

  // Clear current conversation
  const handleClearChat = () => {
    handleStop();
    setMessages([]);
  };

  // Send a message
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend !== undefined ? textToSend : input).trim();
    if (!messageContent || isStreaming) return;

    setInput('');

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
    };

    const activeModelName = availableModels.find((m) => m.id === selectedModel)?.name || (selectedModel.includes('lite') || selectedModel.includes('3.1') ? 'I model 1.5' : 'Binary 2.0');

    const assistantPlaceholderId = `assistant-${Date.now()}`;
    const assistantPlaceholder: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
      modelUsed: activeModelName,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, assistantPlaceholder]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const payloadMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          systemInstruction: currentPersona.systemInstruction,
          model: selectedModel,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errDetails = 'Failed to generate response';
        try {
          const errJson = await response.json();
          errDetails = errJson.error || errDetails;
        } catch {
          // Fallback
        }
        throw new Error(errDetails);
      }

      if (!response.body) {
        throw new Error('No readable stream available in response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.replace('data: ', '').trim();
            if (!jsonStr) continue;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantPlaceholderId
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                );
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (jsonErr) {
              if (jsonErr instanceof Error && jsonErr.message !== 'Unexpected end of JSON input') {
                console.error('Error parsing SSE chunk:', jsonErr);
              }
            }
          }
        }
      }

      // Mark streaming completed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? { ...msg, isStreaming: false, content: accumulatedText || '(No output produced)' }
            : msg
        )
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred.';
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? {
                  ...msg,
                  isStreaming: false,
                  error: true,
                  content: errorMessage,
                }
              : msg
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#f8faf9] text-stone-900 font-mono antialiased selection:bg-[#c6f0ce] selection:text-stone-950 overflow-x-hidden">
      {/* 0 and 1 Binary Stream Animated Canvas in Top Right like screenshot */}
      <BinaryStreamBackground />

      {/* Top Header */}
      <Header
        currentPersona={currentPersona}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        availableModels={availableModels}
        onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onClearChat={handleClearChat}
        messageCount={messages.length}
        isStreaming={isStreaming}
        apiKeyReady={apiKeyReady}
      />

      {/* Main Chat Conversation Container */}
      <main className="relative z-10 flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 sm:p-6 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState
            currentPersona={currentPersona}
            onSelectPrompt={(prompt) => handleSendMessage(prompt)}
          />
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((message, idx) => (
              <ChatMessageItem
                key={message.id}
                message={message}
                personaName={currentPersona.name}
                onRetry={
                  message.error
                    ? () => {
                        const prevUserMsg = messages
                          .slice(0, idx)
                          .reverse()
                          .find((m) => m.role === 'user');
                        if (prevUserMsg) {
                          setMessages((prev) => prev.filter((m) => m.id !== message.id));
                          handleSendMessage(prevUserMsg.content);
                        }
                      }
                    : undefined
                }
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Sticky Bottom Input Bar */}
      <div className="relative z-20">
        <ChatInput
          input={input}
          setInput={setInput}
          onSendMessage={(text) => handleSendMessage(text)}
          isStreaming={isStreaming}
          onStopStreaming={handleStop}
        />
      </div>

      {/* Modals */}
      <PersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        currentPersona={currentPersona}
        onSelectPersona={(persona) => setCurrentPersona(persona)}
        onUpdateCustomPersona={(custom) => {
          setCurrentPersona(custom);
        }}
      />

      <BeginnerGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
