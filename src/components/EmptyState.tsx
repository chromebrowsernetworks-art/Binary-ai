import React from 'react';
import { Persona } from '../types';

interface EmptyStateProps {
  currentPersona: Persona;
  onSelectPrompt: (promptText: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ currentPersona, onSelectPrompt }) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pt-2 pb-6 animate-in fade-in duration-300">
      {/* Title greeting like mockup */}
      <div className="space-y-1.5 font-mono">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
          Hello, Developer <span className="text-2xl select-none">👋</span>
        </h2>
        <p className="text-stone-600 text-sm sm:text-base">
          Ask me anything about binary, coding, encryption and more.
        </p>
      </div>

      {/* Initial Welcome message card matching reference mockup */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs font-mono">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#0a0f0d] border border-stone-800 flex items-center justify-center shrink-0">
            <span className="font-mono text-xs font-bold text-[#00c853]">
              &#123;01&#125;
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-stone-900 text-sm">
              binary codex
            </span>
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
              BOT
            </span>
            <span className="text-[11px] text-stone-400 font-mono ml-1">
              {currentTime}
            </span>
          </div>
        </div>

        <div className="text-stone-800 text-sm sm:text-[15px] space-y-1 leading-relaxed pl-1">
          <p>Hello! I&apos;m binary codex 🤖</p>
          <p className="text-stone-600">How can I help you today?</p>
        </div>
      </div>

      {/* Quick starter questions matching prompt examples */}
      <div className="space-y-2.5 pt-2">
        <p className="font-mono text-xs text-stone-500 font-bold uppercase tracking-wider">
          Suggested Prompts:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {currentPersona.starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              className="text-left font-mono text-xs sm:text-[13px] text-stone-700 bg-white hover:bg-emerald-50/60 hover:text-emerald-950 border border-stone-200/90 hover:border-emerald-300 rounded-xl p-3.5 transition-all shadow-2xs cursor-pointer group flex flex-col justify-between gap-2"
            >
              <span className="leading-snug">{prompt}</span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Run prompt &rarr;
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
