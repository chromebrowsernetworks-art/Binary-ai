import React, { useRef, useEffect } from 'react';
import { Send, Square, Code } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSendMessage,
  isStreaming,
  onStopStreaming,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 2000;

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && input.trim()) {
        onSendMessage(input);
      }
    }
  };

  const handleInsertCodeBlock = () => {
    const codeSnippet = '```typescript\n// Write your code here\n\n```';
    setInput(input ? `${input}\n${codeSnippet}` : codeSnippet);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      {/* Input Box Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-3 sm:p-4 shadow-sm focus-within:border-stone-400 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          rows={2}
          disabled={disabled}
          className="w-full resize-none border-none bg-transparent font-mono text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-hidden disabled:opacity-50"
        />

        {/* Bottom controls row */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100/80 mt-1">
          {/* Character counter */}
          <span className="font-mono text-xs text-stone-400 select-none">
            {input.length} / {maxLength}
          </span>

          {/* Action icons & Send button */}
          <div className="flex items-center gap-2">
            {/* Code Block Shortcut */}
            <button
              type="button"
              onClick={handleInsertCodeBlock}
              className="p-2 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-xl transition-colors cursor-pointer font-mono text-xs font-bold flex items-center gap-1"
              title="Insert Markdown Code Block"
            >
              <Code className="w-4 h-4" />
            </button>

            {/* Send / Stop Button */}
            {isStreaming ? (
              <button
                id="stop-streaming-btn"
                type="button"
                onClick={onStopStreaming}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-transform active:scale-95 shadow-sm cursor-pointer"
                title="Stop generation"
              >
                <Square className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                id="send-message-btn"
                type="button"
                onClick={() => input.trim() && onSendMessage(input)}
                disabled={!input.trim() || disabled}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#00c853] hover:bg-[#00b047] text-white disabled:opacity-40 disabled:hover:bg-[#00c853] transition-all transform active:scale-95 shadow-xs cursor-pointer"
                title="Send query"
              >
                <Send className="w-4 h-4 translate-x-px" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Terminal status line at bottom */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5 text-xs font-mono text-stone-500 select-none min-h-[20px]">
        {isStreaming ? (
          <div className="flex items-center gap-2 text-emerald-700 font-medium">
            <span className="text-emerald-600 font-bold">&gt;_</span>
            <span>binary codex is thinking...</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c853] animate-ping" />
          </div>
        ) : (
          <div className="text-[11px] text-stone-400 flex items-center gap-1">
            <span className="text-[#00c853]">&gt;_</span>
            <span>binary codex ready • Press Enter to run</span>
          </div>
        )}
      </div>
    </div>
  );
};
