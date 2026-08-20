import React, { useEffect, useRef } from 'react';

export const BinaryStreamBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = Math.min(canvas.parentElement.clientWidth, 480);
      height = canvas.height = 360;
    };

    window.addEventListener('resize', handleResize);

    // Columns of binary digits (0 and 1, with occasional 2 or hex for flavor)
    const fontSize = 14;
    const columns = Math.floor(width / (fontSize * 1.5));
    const drops: number[] = Array.from({ length: columns }, () => Math.random() * -20);
    const chars = ['0', '1', '1', '0', '1', '0', '0', '1', '0', '1', '2'];

    const render = () => {
      // Gentle fade effect for light background
      ctx.clearRect(0, 0, width, height);

      ctx.font = `600 ${fontSize}px 'JetBrains Mono', 'Space Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * (fontSize * 1.5) + 10;
        const y = drops[i] * fontSize;

        // Gradient fading: top is subtle, bottom fades away
        const normalizedY = y / height;
        
        if (normalizedY >= 0 && normalizedY <= 1) {
          // Calculate opacity based on position to match reference image (crisp in center, fading outwards)
          const opacity = Math.sin(normalizedY * Math.PI) * 0.75;
          
          // Random highlight in bright terminal green (#00c853), others in muted green/gray
          if (Math.random() > 0.85) {
            ctx.fillStyle = `rgba(0, 200, 83, ${opacity + 0.2})`; // Vibrant Emerald
          } else if (Math.random() > 0.6) {
            ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`; // Medium Emerald
          } else {
            ctx.fillStyle = `rgba(167, 243, 208, ${opacity * 0.7})`; // Soft Mint
          }

          ctx.fillText(char, x, y);
        }

        // Reset drop when offscreen with randomized delay
        if (y > height && Math.random() > 0.96) {
          drops[i] = -2;
        }

        drops[i] += 0.35; // Smooth slow rain speed
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute top-0 right-0 z-0 overflow-hidden opacity-90 max-w-[320px] sm:max-w-[420px] h-[320px]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
