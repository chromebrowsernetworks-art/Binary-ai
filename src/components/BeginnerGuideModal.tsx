import React from 'react';
import { 
  X, 
  Binary, 
  Terminal, 
  Zap, 
  CheckCircle2, 
  Code2, 
  Cpu
} from 'lucide-react';

interface BeginnerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BeginnerGuideModal: React.FC<BeginnerGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs font-mono">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0a0f0d] text-[#00c853] flex items-center justify-center font-bold text-xs">
              &lt;/&gt;
            </div>
            <h2 className="text-base font-bold text-stone-900">
              binary codex • Developer Guide
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

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Status banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-[#00c853] shrink-0" />
              <span>Ready &amp; Optimized for Coding &amp; Binary Logic</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              binary codex is connected to Google Gemini intelligence and tuned for software engineering, binary decoding, bitwise calculations, and algorithmic problem-solving.
            </p>
          </div>

          {/* Capabilities Grid */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Specialized Commands &amp; Queries:
            </h3>

            <div className="grid gap-2.5">
              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#0a0f0d] text-[#00c853] shrink-0">
                  <Binary className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Binary &amp; Hex Conversion</h4>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    Paste raw binary (e.g. <code>01001000 01101001</code>), hex strings, or ask to convert decimal numbers to 2&apos;s complement binary representation.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#0a0f0d] text-[#00c853] shrink-0">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Code Generation &amp; Refactoring</h4>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    Ask for complete implementations in TypeScript, Python, C++, Rust, Go, SQL, or Assembly with Big-O complexity breakdowns.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#0a0f0d] text-[#00c853] shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Algorithms &amp; Security Audits</h4>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    Paste code snippets to detect security vulnerabilities, race conditions, memory leaks, or ask for dynamic programming solutions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-[#0a0f0d] hover:bg-black text-[#00c853] border border-stone-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Start Coding &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
