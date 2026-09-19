import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useMedia } from '../context/MediaContext';
import { audioEngine } from '../audio/audioEngine';
import { Play, Pause } from 'lucide-react';

interface WaveformSeekerProps {
  peaks?: number[];
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onTogglePlayPause: () => void;
  onSeek: (seconds: number) => void;
}

export const WaveformSeeker: React.FC<WaveformSeekerProps> = ({
  peaks,
  duration,
  currentTime,
  isPlaying,
  onTogglePlayPause,
  onSeek
}) => {
  const { themeConfig } = useMedia();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState({ width: 600, height: 64 });

  // Handle dynamic sizing & high-DPI scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  // Generate fallback peaks if track peaks aren't available
  const defaultPeaks = useRef<number[]>(
    Array.from({ length: 90 }, (_, i) => {
      const x = i / 90;
      return 0.15 + 0.7 * Math.sin(x * Math.PI) * (0.5 + 0.5 * Math.sin(x * 16));
    })
  ).current;

  const activePeaks = peaks && peaks.length > 20 ? peaks : defaultPeaks;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Draw audio-reactive dynamic waveform
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.floor(dimensions.width * dpr);
    const targetH = Math.floor(dimensions.height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Audio frequency modulation if playing
    const freqData = audioEngine.getFrequencyData();
    const liveMod = (freqData && freqData.length > 0 && isPlaying) ? freqData : null;

    const barCount = activePeaks.length;
    const containerWidth = dimensions.width;
    const containerHeight = dimensions.height;

    // Calculate dynamic crisp widths
    const barWidth = Math.max(1.5, (containerWidth / barCount) * 0.65);
    const gap = (containerWidth - (barCount * barWidth)) / barCount;
    const progressRatio = duration > 0 ? currentTime / duration : 0;
    const progressPixel = progressRatio * containerWidth;

    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + gap);
      let peakVal = activePeaks[i];

      // Oscillate peak subtly if music is actively playing
      if (liveMod) {
        const binIndex = Math.floor((i / barCount) * 40);
        const liveVal = (liveMod[binIndex] || 0) / 255;
        peakVal = Math.min(1, peakVal * 0.7 + liveVal * 0.45);
      }

      const barHeight = Math.max(3, peakVal * (containerHeight - 16));
      const y = (containerHeight - barHeight) / 2;

      const isPlayed = x <= progressPixel;

      // Color styling
      if (isPlayed) {
        ctx.fillStyle = themeConfig.waveformColor || '#22d3ee';
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      }

      // Rounded bar
      const radius = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, radius);
      ctx.fill();
    }
    ctx.restore();
  }, [activePeaks, currentTime, duration, isPlaying, themeConfig, dimensions]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      drawWaveform();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [drawWaveform]);

  // Handle seeking click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, hoverX / rect.width));
    setHoverTime(ratio * duration);
    setIsHovering(true);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className="relative w-full select-none"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setHoverTime(null);
      }}
    >
      {/* Waveform Container */}
      <div
        ref={containerRef}
        onClick={handleSeek}
        onMouseMove={handleMouseMove}
        className="relative w-full h-16 bg-[#0f1115] hover:bg-[#14161c] border border-white/10 hover:border-cyan-400/40 rounded-2xl cursor-pointer overflow-hidden transition-all shadow-inner group flex items-center"
      >
        {/* Waveform Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={64}
          className="w-full h-full block"
        />

        {/* Progress Fill Background Overlay */}
        <div 
          className="absolute inset-y-0 left-0 bg-cyan-400/10 pointer-events-none transition-all duration-75"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Scrubber Playhead Line */}
        <div 
          className="absolute inset-y-0 w-0.5 bg-cyan-300 shadow-[0_0_12px_#22d3ee] pointer-events-none transition-all duration-75"
          style={{ left: `${progressPercent}%` }}
        />

        {/* Hover Time Tooltip */}
        {isHovering && hoverTime !== null && (
          <div 
            className="absolute top-1 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[10px] font-mono text-cyan-300 pointer-events-none z-20 shadow-xl"
            style={{ left: `${(hoverTime / duration) * 100}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}

        {/* Integrated Play/Pause Button on Waveform */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 z-20 transition-transform hover:scale-110 active:scale-95"
          style={{ 
            left: `max(12px, calc(${progressPercent}% - 18px))`
          }}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlayPause();
          }}
        >
          <button
            type="button"
            title={isPlaying ? 'Pause' : 'Play'}
            className="w-9 h-9 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.7)] border-2 border-black cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black stroke-black" />
            ) : (
              <Play className="w-4 h-4 fill-black stroke-black ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Time Stamps below waveform */}
      <div className="flex items-center justify-between px-1 mt-1.5 text-[11px] font-mono text-neutral-400">
        <span className="text-cyan-400 font-bold">{formatTime(currentTime)}</span>
        <span className="text-neutral-500">Waveform Seeker • Click to Jump</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};
