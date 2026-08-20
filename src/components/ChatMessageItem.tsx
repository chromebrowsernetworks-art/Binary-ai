import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  RefreshCw,
  CheckCheck,
  Play,
  Film,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { Message } from '../types';

interface ChatMessageItemProps {
  message: Message;
  personaName: string;
  onRetry?: () => void;
}

// Media renderer components
const VideoPreview: React.FC<{ url: string }> = ({ url }) => {
  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-stone-800 bg-[#0a0f0d] shadow-md max-w-md w-full">
      <div className="flex items-center justify-between px-3 py-2 bg-stone-900/90 border-b border-stone-800 text-[11px] font-mono text-emerald-400">
        <span className="flex items-center gap-1.5 font-bold">
          <Film className="w-3.5 h-3.5 text-[#00c853]" />
          Video Preview (Autoplay)
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-stone-400 hover:text-white transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <div className="relative aspect-video bg-black flex items-center justify-center">
        <video
          src={url}
          autoPlay
          playsInline
          muted
          loop
          controls
          preload="auto"
          className="w-full h-full object-contain"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

const ImagePreview: React.FC<{ url: string; alt?: string }> = ({ url, alt = 'Visual Response' }) => {
  const [hasLoaded, setHasLoaded] = useState(false);

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 shadow-md max-w-md w-full">
      <div className="flex items-center justify-between px-3 py-2 bg-stone-900 border-b border-stone-800 text-[11px] font-mono text-stone-300">
        <span className="flex items-center gap-1.5 font-bold text-emerald-400">
          <ImageIcon className="w-3.5 h-3.5 text-[#00c853]" />
          Image Preview
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-stone-400 hover:text-white transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <div className="bg-[#0d1310] min-h-[160px] flex items-center justify-center p-2">
        <img
          src={url}
          alt={alt}
          onLoad={() => setHasLoaded(true)}
          className={`w-full max-h-[380px] object-contain rounded-xl transition-opacity duration-300 ${
            hasLoaded ? 'opacity-100' : 'opacity-80'
          }`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, personaName, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const isUser = message.role === 'user';

  const timeString = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="max-w-2xl bg-[#e8f8ec] border border-[#c6f0ce] text-stone-900 rounded-2xl p-4 sm:p-5 shadow-2xs font-mono">
          <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <div className="flex items-center justify-end gap-1.5 mt-2 text-[11px] text-emerald-800 font-medium select-none">
            <span>{timeString}</span>
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
          </div>
        </div>
      </div>
    );
  }

  // Helper to render text with embedded direct URLs converted to media previews
  const renderParagraphContent = (children: React.ReactNode) => {
    return React.Children.map(children, (child) => {
      if (typeof child === 'string') {
        const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
        const parts = child.split(urlRegex);
        if (parts.length > 1) {
          return parts.map((part, i) => {
            if (part.match(urlRegex)) {
              if (part.includes('.mp4') || part.includes('VN20260820')) {
                return <VideoPreview key={i} url={part} />;
              }
              if (part.match(/\.(jpeg|jpg|png|webp|gif)/i) || part.includes('SmartSelect')) {
                return <ImagePreview key={i} url={part} alt="Visual Attachment" />;
              }
              return (
                <a
                  key={i}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline font-semibold"
                >
                  {part}
                </a>
              );
            }
            return part;
          });
        }
      }
      return child;
    });
  };

  // Assistant / Bot message
  return (
    <div className="flex flex-col w-full max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 shadow-2xs font-mono">
        {/* Header inside card */}
        <div className="flex items-center gap-3 mb-3.5">
          {/* {01} circular avatar */}
          <div className="w-8 h-8 rounded-full bg-[#0a0f0d] border border-stone-800 flex items-center justify-center shrink-0">
            <span className="font-mono text-xs font-bold text-[#00c853]">
              &#123;01&#125;
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-stone-900 text-sm">
              {personaName || 'binary codex'}
            </span>
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              BOT
            </span>
            <span className="text-[11px] text-stone-400 font-mono ml-1">
              {timeString}
            </span>
          </div>
        </div>

        {/* Message Content */}
        {message.error ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs sm:text-sm font-mono space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Generation Notice</span>
            </div>
            <p className="text-red-700">{message.content}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-stone-800 text-sm sm:text-[15px] leading-relaxed break-words font-mono">
            <ReactMarkdown
              components={{
                // Custom Terminal Dark Block for code
                code({ inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');

                  if (!inline) {
                    return (
                      <div className="relative my-3 rounded-xl bg-[#0a0f0d] border border-stone-800 p-4 font-mono group">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-stone-400 text-xs">
                          <span className="text-emerald-500 font-semibold uppercase">
                            {match ? match[1] : 'Output'}
                          </span>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(codeString)}
                            className="p-1 rounded text-stone-400 hover:text-[#00c853] hover:bg-stone-800/60 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Copy code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Copy</span>
                          </button>
                        </div>
                        <pre className="overflow-x-auto terminal-scrollbar text-[#00ff66] text-xs sm:text-sm leading-relaxed">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    );
                  }

                  return (
                    <code
                      className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-semibold"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => (
                  <div className="mb-2.5 last:mb-0 leading-relaxed">
                    {renderParagraphContent(children)}
                  </div>
                ),
                img: ({ src, alt }: any) => {
                  const url = src || '';
                  if (url.includes('.mp4') || url.includes('VN20260820')) {
                    return <VideoPreview url={url} />;
                  }
                  return <ImagePreview url={url} alt={alt || 'Visual Response'} />;
                },
                a: ({ href, children }: any) => {
                  const url = href || '';
                  if (url.endsWith('.mp4') || url.includes('.mp4') || url.includes('VN20260820')) {
                    return <VideoPreview url={url} />;
                  }
                  if (url.match(/\.(jpeg|jpg|gif|png|webp)/i) || url.includes('SmartSelect')) {
                    return <ImagePreview url={url} alt="Visual Attachment" />;
                  }
                  return (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline font-semibold"
                    >
                      {children}
                    </a>
                  );
                },
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2.5">{children}</ol>,
                strong: ({ children }) => <strong className="font-bold text-stone-950">{children}</strong>,
                h1: ({ children }) => <h1 className="text-base font-bold text-stone-900 mt-3 mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold text-stone-900 mt-2.5 mb-1.5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold text-stone-900 mt-2 mb-1">{children}</h3>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Bot message actions bar: Thumbs up, thumbs down, copy */}
      {!message.error && (
        <div className="flex items-center gap-2 mt-2 ml-4">
          <button
            type="button"
            onClick={() => setLiked(liked === true ? null : true)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              liked === true
                ? 'bg-emerald-50 border-emerald-400 text-[#00c853]'
                : 'border-transparent text-stone-400 hover:text-emerald-600 hover:bg-emerald-50/50'
            }`}
            title="Helpful"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setLiked(liked === false ? null : false)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              liked === false
                ? 'bg-red-50 border-red-300 text-red-600'
                : 'border-transparent text-stone-400 hover:text-red-500 hover:bg-red-50/50'
            }`}
            title="Not helpful"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleCopyMessage}
            className="p-1.5 rounded-lg border border-transparent text-stone-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-colors cursor-pointer"
            title="Copy message"
          >
            {copied ? <Check className="w-4 h-4 text-[#00c853]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};
