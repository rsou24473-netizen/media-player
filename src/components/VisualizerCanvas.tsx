import React, { useEffect, useRef } from 'react';
import { useMedia } from '../context/MediaContext';
import { audioEngine } from '../audio/audioEngine';

interface VisualizerCanvasProps {
  className?: string;
  height?: number;
  width?: number;
  compact?: boolean;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  className = '',
  height = 120,
  width,
  compact = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { visualizerMode, isPlaying } = useMedia();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      animationId = requestAnimationFrame(render);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (visualizerMode === 'off') {
        return;
      }

      const freqData = audioEngine.getFrequencyData();
      const timeData = audioEngine.getTimeDomainData();

      if (!freqData || !isPlaying) {
        // Subtle resting idle wave
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        for (let x = 0; x < w; x += 4) {
          const y = h / 2 + Math.sin(x * 0.05 + Date.now() * 0.002) * (compact ? 2 : 4);
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        return;
      }

      if (visualizerMode === 'spectrum') {
        // High quality spectrum frequency bars with gradient
        const barCount = compact ? 24 : 48;
        const barWidth = (w / barCount) - 2;
        const step = Math.floor(freqData.length / barCount);

        const gradient = ctx.createLinearGradient(0, h, 0, 0);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.7)'); // blue
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.85)'); // purple
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0.95)'); // pink

        for (let i = 0; i < barCount; i++) {
          const value = freqData[i * step] || 0;
          const barHeight = Math.max(3, (value / 255) * h * 0.92);
          const x = i * (barWidth + 2);
          const y = h - barHeight;

          ctx.fillStyle = gradient;
          // Rounded top bars
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
          ctx.fill();

          // Highlight cap
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(x, y, barWidth, 1.5);
        }
      } else if (visualizerMode === 'bars') {
        // Retro LED style block meters
        const numCols = compact ? 16 : 32;
        const colWidth = (w / numCols) - 2;
        const numRows = 12;
        const rowHeight = (h / numRows) - 1.5;
        const step = Math.floor(freqData.length / numCols);

        for (let i = 0; i < numCols; i++) {
          const value = freqData[i * step] || 0;
          const activeRows = Math.floor((value / 255) * numRows);

          for (let r = 0; r < numRows; r++) {
            const rowIndexFromBottom = r;
            const x = i * (colWidth + 2);
            const y = h - (r + 1) * (rowHeight + 1.5);

            if (rowIndexFromBottom < activeRows) {
              if (r > numRows * 0.8) {
                ctx.fillStyle = '#ef4444'; // Red peak
              } else if (r > numRows * 0.5) {
                ctx.fillStyle = '#f59e0b'; // Amber mid
              } else {
                ctx.fillStyle = '#10b981'; // Green low
              }
            } else {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            }

            ctx.fillRect(x, y, colWidth, rowHeight);
          }
        }
      } else if (visualizerMode === 'wave' && timeData) {
        // Oscilloscope Neon Waveform
        ctx.beginPath();
        const sliceWidth = w / timeData.length;
        let x = 0;

        for (let i = 0; i < timeData.length; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(w, h / 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (visualizerMode === 'radial') {
        // Circular Beat Glow
        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(centerX, centerY) * 0.55;
        const numPoints = 64;
        const step = Math.floor(freqData.length / numPoints);

        ctx.save();
        ctx.translate(centerX, centerY);

        ctx.beginPath();
        for (let i = 0; i < numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          const val = (freqData[i * step] || 0) / 255;
          const r = radius + val * (Math.min(centerX, centerY) * 0.4);
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();

        const radialGrad = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius * 1.4);
        radialGrad.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        radialGrad.addColorStop(1, 'rgba(236, 72, 153, 0.8)');

        ctx.strokeStyle = radialGrad;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [visualizerMode, isPlaying, compact]);

  return (
    <canvas
      ref={canvasRef}
      width={width || (compact ? 120 : 360)}
      height={height}
      className={`rounded-md ${className}`}
    />
  );
};
