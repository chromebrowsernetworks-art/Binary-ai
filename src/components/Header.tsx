import React from 'react';
import { 
  Trash2, 
  SlidersHorizontal,
  ChevronDown,
  Key
} from 'lucide-react';
import { Persona, AIModelOption } from '../types';

interface HeaderProps {
  currentPersona: Persona;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  availableModels: AIModelOption[];
  onOpenPersonaModal: () => void;
  onOpenGuideModal: () => void;
  onOpenApiKeyModal?: () => void;
  onClearChat: () => void;
  messageCount: number;
  isStreaming: boolean;
  apiKeyReady: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersona,
  selectedModel,
  onSelectModel,
  availableModels,
  onOpenPersonaModal,
  onOpenGuideModal,
  onOpenApiKeyModal,
  onClearChat,
  messageCount,
  isStreaming,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#f8faf9]/90 backdrop-blur-md border-b border-stone-200/80 px-3 py-3 sm:px-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Branding: { 01 } binary codex */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Logo Badge */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0a0f0d] border border-stone-800 flex items-center justify-center shadow-xs select-none shrink-0">
            <span className="font-mono text-sm sm:text-base font-bold text-[#00c853] tracking-tighter">
              &#123;<span className="text-white">01</span>&#125;
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono font-bold text-stone-900 text-base sm:text-xl tracking-tight leading-none">
                binary codex
              </h1>
            </div>
            <p className="font-mono text-[11px] sm:text-xs text-[#00c853] font-medium tracking-wide mt-0.5 sm:mt-1">
              decode. compute. create.
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Model switcher pill */}
          <div className="relative inline-flex items-center">
            <select
              id="model-selector-dropdown"
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              className="appearance-none bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 text-xs font-mono font-bold pl-2.5 pr-6 py-1.5 rounded-xl cursor-pointer transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
              title="Select Engine Model"
            >
              {availableModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2 pointer-events-none" />
          </div>

          {/* Status Indicator Pill: ONLINE */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-300 text-emerald-900 shadow-2xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00c853] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00c853]"></span>
            </span>
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase">
              ONLINE
            </span>
          </div>

          {/* Persona selector button */}
          <button
            id="persona-selector-btn"
            type="button"
            onClick={onOpenPersonaModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-stone-700 bg-white hover:bg-stone-50 transition-colors border border-stone-300 shadow-2xs cursor-pointer"
            title="Configure AI Specialist & Persona"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden md:inline text-stone-500">Mode:</span>
            <span className="font-bold text-stone-900 max-w-[80px] sm:max-w-[100px] truncate">
              {currentPersona.name}
            </span>
          </button>

          {/* Code symbol circle action button */}
          <button
            type="button"
            onClick={onOpenGuideModal}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-300 hover:border-[#00c853] bg-white hover:bg-emerald-50/50 flex items-center justify-center font-mono text-xs font-bold text-stone-700 hover:text-emerald-700 transition-all shadow-2xs cursor-pointer"
            title="Coding Guide & Help"
          >
            &lt;/&gt;
          </button>

          {/* API Key Modal Button */}
          {onOpenApiKeyModal && (
            <button
              type="button"
              onClick={onOpenApiKeyModal}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 flex items-center justify-center text-stone-700 hover:text-emerald-700 transition-all shadow-2xs cursor-pointer"
              title="Configure API Key (For GitHub Pages)"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Clear conversation */}
          {messageCount > 0 && (
            <button
              id="clear-chat-btn"
              type="button"
              onClick={onClearChat}
              disabled={isStreaming}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl font-mono text-xs font-medium text-stone-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors disabled:opacity-40 cursor-pointer"
              title="Clear terminal session"
            >
              <Trash2 className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
