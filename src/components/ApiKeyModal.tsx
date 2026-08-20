import React, { useState } from 'react';
import { Key, X, ExternalLink, Check, ShieldCheck } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
  currentKey: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaveKey,
  currentKey,
}) => {
  const [keyValue, setKeyValue] = useState(currentKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(keyValue.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#fdfdfd] rounded-2xl border border-stone-300 shadow-2xl p-6 font-mono">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-[#00c853]">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">Gemini API Key</h3>
            <p className="text-xs text-stone-500">For GitHub Pages & Static Hosting</p>
          </div>
        </div>

        <p className="text-xs text-stone-600 mb-4 leading-relaxed">
          When hosted as a static site on GitHub Pages, enter your Gemini API key below. It is stored securely in your browser's local storage only.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              API Key
            </label>
            <input
              type="password"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline font-semibold"
            >
              Get a free API key <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="submit"
              className="px-4 py-2 bg-stone-950 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00c853]" />
                  Saved
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00c853]" />
                  Save Key
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
