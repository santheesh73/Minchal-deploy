import React, { useEffect, useRef } from 'react';

export interface ChromaGridProps {
  className?: string;
  gridSize?: number;
  chromaColors?: string[];
  spotlightRadius?: number;
  fadeEdges?: boolean;
  isDark?: boolean;
}

export const ChromaGrid: React.FC<ChromaGridProps> = ({
  className = '',
  gridSize = 32,
  chromaColors = ['#ffbf00', '#38663d', '#ec4899', '#3b82f6', '#8b5cf6'],
  spotlightRadius = 320,
  fadeEdges = true,
  isDark = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

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
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;

    const render = () => {
      time += 0.012;

      // Mouse smooth lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / gridSize) + 1;
      const rows = Math.ceil(height / gridSize) + 1;

      // 1. Draw Colorful Grid Lines
      ctx.lineWidth = 1.2;

      // Vertical Colorful Lines
      for (let i = 0; i <= cols; i++) {
        const x = i * gridSize;
        const color = chromaColors[i % chromaColors.length] || chromaColors[0];
        const distToMouse = Math.abs(x - mouse.x);
        const influence = Math.max(0, 1 - distToMouse / spotlightRadius);

        const baseAlpha = isDark ? 0.08 : 0.12;
        const lineAlpha = baseAlpha + influence * 0.35;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.strokeStyle = `${color}${Math.floor(lineAlpha * 255).toString(16).padStart(2, '0')}`;
        ctx.stroke();
      }

      // Horizontal Colorful Lines
      for (let j = 0; j <= rows; j++) {
        const y = j * gridSize;
        const color = chromaColors[(j + 2) % chromaColors.length] || chromaColors[0];
        const distToMouse = Math.abs(y - mouse.y);
        const influence = Math.max(0, 1 - distToMouse / spotlightRadius);

        const baseAlpha = isDark ? 0.08 : 0.12;
        const lineAlpha = baseAlpha + influence * 0.35;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.strokeStyle = `${color}${Math.floor(lineAlpha * 255).toString(16).padStart(2, '0')}`;
        ctx.stroke();
      }

      // 2. Draw Vivid Chromatic Glowing Intersection Nodes
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;

          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < spotlightRadius) {
            const factor = Math.pow(1 - dist / spotlightRadius, 2);
            const colorIndex = (i + j) % chromaColors.length;
            const color = chromaColors[colorIndex] || chromaColors[0];

            ctx.beginPath();
            ctx.arc(x, y, 2 + factor * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = factor * 16;
            ctx.globalAlpha = 0.3 + factor * 0.7;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
          }
        }
      }

      // 3. Dynamic Colorful Chromatic Spotlight Glow Base
      const glowGrad = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        spotlightRadius
      );
      glowGrad.addColorStop(0, 'rgba(255, 191, 0, 0.18)');
      glowGrad.addColorStop(0.4, 'rgba(56, 102, 61, 0.12)');
      glowGrad.addColorStop(0.8, 'rgba(236, 72, 153, 0.08)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gridSize, chromaColors, spotlightRadius, isDark]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={
          fadeEdges
            ? {
                maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 40%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 40%, transparent 100%)',
              }
            : undefined
        }
      />
    </div>
  );
};
