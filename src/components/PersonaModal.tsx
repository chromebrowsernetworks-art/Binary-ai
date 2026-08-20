import React, { useState } from 'react';
import { 
  X, 
  Binary, 
  Code2, 
  Shield, 
  Cpu, 
  Bot,
  Check, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { Persona } from '../types';
import { DEFAULT_PERSONAS } from '../personas';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona: Persona;
  onSelectPersona: (persona: Persona) => void;
  onUpdateCustomPersona: (customPersona: Persona) => void;
}

export const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  currentPersona,
  onSelectPersona,
  onUpdateCustomPersona,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [customName, setCustomName] = useState(
    currentPersona.id === 'custom' ? currentPersona.name : 'Custom Engineer'
  );
  const [customInstruction, setCustomInstruction] = useState(
    currentPersona.id === 'custom'
      ? currentPersona.systemInstruction
      : 'You are an elite coding assistant specializing in...'
  );

  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Binary':
        return <Binary className="w-5 h-5 text-[#00c853]" />;
      case 'Code2':
        return <Code2 className="w-5 h-5 text-emerald-600" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-teal-600" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-green-600" />;
      default:
        return <Bot className="w-5 h-5 text-stone-700" />;
    }
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInstruction.trim()) return;

    const custom: Persona = {
      id: 'custom',
      name: customName.trim() || 'Custom AI',
      tagline: 'Custom engineering parameters',
      description: customInstruction.substring(0, 100) + '...',
      iconName: 'Binary',
      systemInstruction: customInstruction.trim(),
      starterPrompts: [
        'How can you assist me with this coding challenge?',
        'Analyze this architecture and optimize performance.',
      ],
    };

    onUpdateCustomPersona(custom);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs font-mono">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-stone-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-stone-800" />
            <h2 className="text-base font-bold text-stone-900">
              Select AI Engineering Mode
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 pt-3.5 flex gap-3 border-b border-stone-100 bg-stone-50/30 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'presets'
                ? 'border-[#00c853] text-stone-950 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Preset Specialists
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'border-[#00c853] text-stone-950 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Custom System Prompt
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {activeTab === 'presets' ? (
            <div className="space-y-3">
              {DEFAULT_PERSONAS.map((persona) => {
                const isSelected = currentPersona.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => {
                      onSelectPersona(persona);
                      onClose();
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-300'
                        : 'bg-white border-stone-200 hover:bg-stone-50 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-[#0a0f0d] border border-stone-800 shrink-0">
                        {getIcon(persona.iconName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-stone-900">
                            {persona.name}
                          </h3>
                        </div>
                        <p className="text-xs text-[#00c853] font-semibold mt-0.5">
                          {persona.tagline}
                        </p>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">
                          {persona.description}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="shrink-0 text-[#00c853] pt-1">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleSaveCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Specialist Title
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Rust Compiler Expert, Database Tuner"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-stone-300 font-mono focus:outline-hidden focus:border-stone-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  System Instructions / Coding Rules
                </label>
                <textarea
                  rows={5}
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="Describe your custom coding rules, language preferences, and formatting."
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-stone-300 font-mono focus:outline-hidden focus:border-stone-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#0a0f0d] hover:bg-black text-[#00c853] border border-stone-700 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Save & Apply
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
