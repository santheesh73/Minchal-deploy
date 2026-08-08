import React, { useEffect, useRef } from 'react';

export interface WebThreadsProps {
  className?: string;
  amplitude?: number;
  distance?: number;
  color?: string[];
  enableMouseInteraction?: boolean;
}

export const WebThreads: React.FC<WebThreadsProps> = ({
  className = '',
  amplitude = 1,
  distance = 0,
  color = ['#38663d', '#ffbf00', '#213524'],
  enableMouseInteraction = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
    };

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableMouseInteraction || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const threadCount = 36;
    const pointsPerThread = 45;
    let step = 0;

    const render = () => {
      step += 0.006;

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < threadCount; i++) {
        const progress = i / threadCount;
        const colorIndex = Math.floor(progress * (color.length - 1));
        const c1 = color[colorIndex] || color[0];
        const c2 = color[Math.min(colorIndex + 1, color.length - 1)] || color[0];

        ctx.beginPath();
        ctx.lineWidth = 1.0 + (1 - Math.abs(progress - 0.5) * 2) * 1.8;

        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, `${c1}10`);
        gradient.addColorStop(0.5, `${c1}70`);
        gradient.addColorStop(1, `${c2}10`);
        ctx.strokeStyle = gradient;

        for (let j = 0; j <= pointsPerThread; j++) {
          const u = j / pointsPerThread;
          const x = u * width;

          const baseOffset = (i - threadCount / 2) * (16 + distance);
          const yCenter = height / 2 + baseOffset;

          const wave1 = Math.sin(u * Math.PI * 3 + step * 2 + i * 0.18) * 40 * amplitude;
          const wave2 = Math.cos(u * Math.PI * 4 - step * 1.4 + i * 0.12) * 22 * amplitude;

          const dx = x - mouse.x;
          const dy = yCenter - mouse.y;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);
          const mouseEffect = Math.max(0, 1 - distToMouse / 280);
          const mouseOffset = Math.sin(mouseEffect * Math.PI) * 50 * (i % 2 === 0 ? 1 : -1);

          const y = yCenter + wave1 + wave2 + mouseOffset;

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevU = (j - 1) / pointsPerThread;
            const prevX = prevU * width;
            const cx = (prevX + x) / 2;
            ctx.quadraticCurveTo(prevX, y, cx, y);
          }
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [amplitude, distance, color, enableMouseInteraction]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {/* 1. Desktop & Tablet Web Threads Canvas (ReactBits) */}
      <canvas
        ref={canvasRef}
        className="hidden md:block w-full h-full opacity-70 mix-blend-multiply"
        style={{
          maskImage: 'radial-gradient(ellipse 85% 75% at 50% 40%, black 30%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 40%, black 30%, transparent 95%)',
        }}
      />

      {/* 2. Mobile App Ambient Energy Orbs Glow (Ultra-Clean Mobile Viewports) */}
      <div className="block md:hidden absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-gradient-to-tr from-brand-500/25 via-amber-400/20 to-brand-600/15 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/3 w-60 h-60 rounded-full bg-gradient-to-br from-emerald-500/20 to-amber-300/15 blur-3xl" />
      </div>
    </div>
  );
};
