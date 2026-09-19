import React, { useEffect, useState, useRef } from 'react';
import { useMedia } from '../context/MediaContext';
import { audioEngine } from '../audio/audioEngine';
import { X, Activity, Cpu, Radio, Sparkles, Volume2 } from 'lucide-react';

interface BeatMatrixPopoutProps {
  onClose: () => void;
}

export const BeatMatrixPopout: React.FC<BeatMatrixPopoutProps> = ({ onClose }) => {
  const { isPlaying, currentTrack } = useMedia();
  const [metrics, setMetrics] = useState({
    bass: 0,
    lowMid: 0,
    mid: 0,
    high: 0,
    kickActive: false,
    snareActive: false
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Smooth springs for gauges
  const smoothedBass = useRef(0);
  const smoothedLowMid = useRef(0);
  const smoothedMid = useRef(0);
  const smoothedHigh = useRef(0);
  const kickTrigger = useRef(0);
  const snareTrigger = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI setup
    const dpr = window.devicePixelRatio || 1;
    const width = 360;
    const height = 150;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    let lastBeat = 0;

    const renderLoop = () => {
      const freqData = audioEngine.getFrequencyData();
      let rBass = 0;
      let rLowMid = 0;
      let rMid = 0;
      let rHigh = 0;

      if (freqData && freqData.length > 0 && isPlaying) {
        // Bass (bins 1-8)
        let sum = 0;
        for (let i = 1; i <= 8; i++) sum += freqData[i];
        rBass = sum / (8 * 255);

        // LowMid (bins 9-24)
        sum = 0;
        for (let i = 9; i <= 24; i++) sum += freqData[i];
        rLowMid = sum / (16 * 255);

        // Mid (bins 25-55)
        sum = 0;
        for (let i = 25; i <= 55; i++) sum += freqData[i];
        rMid = sum / (31 * 255);

        // High (bins 56-120)
        sum = 0;
        for (let i = 56; i <= 120; i++) sum += freqData[i];
        rHigh = sum / (65 * 255);

        // Kick spike detection
        const now = performance.now();
        if (rBass > 0.60 && rBass - smoothedBass.current > 0.16 && now - lastBeat > 220) {
          kickTrigger.current = 1.0;
          lastBeat = now;
        }

        // Snare detection
        if (rMid > 0.52 && rMid - smoothedMid.current > 0.13) {
          snareTrigger.current = 1.0;
        }
      }

      // Smooth decay springs
      smoothedBass.current += (rBass - smoothedBass.current) * 0.25;
      smoothedLowMid.current += (rLowMid - smoothedLowMid.current) * 0.20;
      smoothedMid.current += (rMid - smoothedMid.current) * 0.22;
      smoothedHigh.current += (rHigh - smoothedHigh.current) * 0.26;
      kickTrigger.current = Math.max(0, kickTrigger.current - 0.06);
      snareTrigger.current = Math.max(0, snareTrigger.current - 0.08);

      // Trigger state update
      setMetrics({
        bass: smoothedBass.current,
        lowMid: smoothedLowMid.current,
        mid: smoothedMid.current,
        high: smoothedHigh.current,
        kickActive: kickTrigger.current > 0.4,
        snareActive: snareTrigger.current > 0.4
      });

      // Draw real-time cyber spectrum in the canvas
      ctx.clearRect(0, 0, width, height);

      // Draw cyber Grid Background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 15;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw 16 spectrum bars
      const barCount = 20;
      const spacing = 4;
      const totalSpacing = spacing * (barCount - 1);
      const barWidth = (width - totalSpacing) / barCount;

      for (let i = 0; i < barCount; i++) {
        let value = 0;
        let color = '#22d3ee'; // cyan default

        // Distribute FFT bins onto 20 visual bars
        if (freqData && freqData.length > 0 && isPlaying) {
          const binIdx = Math.floor((i / barCount) * 80) + 1;
          value = freqData[binIdx] / 255;
        } else {
          // Subtle idle floating sine wave
          value = 0.05 + Math.sin(performance.now() * 0.003 + i * 0.3) * 0.04;
        }

        const barHeight = Math.max(4, value * (height - 20));
        const x = i * (barWidth + spacing);
        const y = height - barHeight;

        // Visual gradients per band category
        if (i < 4) {
          // Bass
          color = `rgba(244, 63, 94, ${0.4 + value * 0.6})`; // rose
        } else if (i < 9) {
          // Low Mid
          color = `rgba(251, 191, 36, ${0.4 + value * 0.6})`; // amber
        } else if (i < 15) {
          // Mid
          color = `rgba(34, 211, 238, ${0.4 + value * 0.6})`; // cyan
        } else {
          // Highs
          color = `rgba(168, 85, 247, ${0.4 + value * 0.6})`; // purple
        }

        // Draw bar
        ctx.fillStyle = color;
        // Rounded caps
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        // Glowing apex particle above each bar
        if (value > 0.3) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = color;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, y - 4, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Draw bottom horizontal dividing glow line
      const kickIntensity = kickTrigger.current;
      ctx.strokeStyle = kickIntensity > 0.1 ? `rgba(244, 63, 94, ${kickIntensity})` : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height - 1);
      ctx.lineTo(width, height - 1);
      ctx.stroke();

      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    animFrameId.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPlaying]);

  return (
    <div
      id="beat-matrix-floating-popout"
      className="absolute bottom-24 right-4 md:right-6 w-[390px] bg-[#0c0e12]/95 border-2 border-white/10 rounded-3xl p-5 shadow-[0_30px_90px_rgba(0,0,0,0.95)] z-[80] backdrop-blur-3xl select-none font-sans space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white tracking-widest uppercase">
              BEAT ANALYSIS RADAR
            </h3>
            <p className="text-[9px] font-mono text-cyan-400/80">
              {isPlaying ? 'FFT ANALYZER ACTIVE • 60 FPS' : 'STANDBY MODE'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Multi-Band Circular Reactive Gauges */}
      <div className="grid grid-cols-4 gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
        {/* Bass */}
        <div className="flex flex-col items-center space-y-1.5 text-center">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Bass</span>
          <div 
            style={{ 
              transform: `scale(${1 + metrics.bass * 0.15})`,
              boxShadow: metrics.kickActive ? '0 0 16px rgba(244, 63, 94, 0.4)' : 'none'
            }}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-75 ${
              metrics.kickActive 
                ? 'border-rose-400 bg-rose-500/10' 
                : 'border-rose-500/25 bg-rose-500/5'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-rose-300">
              {Math.round(metrics.bass * 100)}%
            </span>
          </div>
          <span className="text-[8px] text-neutral-400 font-mono">
            {metrics.kickActive ? '🔥 KICK' : 'SUB-FREQ'}
          </span>
        </div>

        {/* Low-Mid */}
        <div className="flex flex-col items-center space-y-1.5 text-center">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">L-Mid</span>
          <div 
            style={{ transform: `scale(${1 + metrics.lowMid * 0.12})` }}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-75 ${
              metrics.lowMid > 0.4 
                ? 'border-amber-400 bg-amber-500/10' 
                : 'border-amber-500/25 bg-amber-500/5'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-amber-300">
              {Math.round(metrics.lowMid * 100)}%
            </span>
          </div>
          <span className="text-[8px] text-neutral-400 font-mono">CHORDS</span>
        </div>

        {/* Mid */}
        <div className="flex flex-col items-center space-y-1.5 text-center">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Mid</span>
          <div 
            style={{ 
              transform: `scale(${1 + metrics.mid * 0.12})`,
              boxShadow: metrics.snareActive ? '0 0 16px rgba(34, 211, 238, 0.4)' : 'none'
            }}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-75 ${
              metrics.snareActive 
                ? 'border-cyan-400 bg-cyan-500/10' 
                : 'border-cyan-500/25 bg-cyan-500/5'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-cyan-300">
              {Math.round(metrics.mid * 100)}%
            </span>
          </div>
          <span className="text-[8px] text-neutral-400 font-mono">
            {metrics.snareActive ? '⚡ SNARE' : 'VOCAL'}
          </span>
        </div>

        {/* High */}
        <div className="flex flex-col items-center space-y-1.5 text-center">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">High</span>
          <div 
            style={{ transform: `scale(${1 + metrics.high * 0.10})` }}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-75 ${
              metrics.high > 0.4 
                ? 'border-purple-400 bg-purple-500/10' 
                : 'border-purple-500/25 bg-purple-500/5'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-purple-300">
              {Math.round(metrics.high * 100)}%
            </span>
          </div>
          <span className="text-[8px] text-neutral-400 font-mono">HI-HATS</span>
        </div>
      </div>

      {/* FFT 20-Band Bouncing Visualizer Canvas */}
      <div className="relative border border-white/5 rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center">
        <canvas ref={canvasRef} className="block" />
        
        {/* Floating overlays */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center space-y-1">
            <Volume2 className="w-5 h-5 text-neutral-500 animate-pulse" />
            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Play a track to analyze</span>
          </div>
        )}
      </div>

      {/* Dynamic 4x4 Flashing Peak Grid Matrix */}
      <div className="space-y-1.5">
        <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider block">
          PHYSICS COUPLING GRID
        </span>
        <div className="grid grid-cols-8 gap-1.5">
          {Array.from({ length: 16 }).map((_, i) => {
            // Distribute flashes across the grid matching beat states
            let flashState = false;
            let glowColor = 'shadow-[0_0_8px_rgba(34,211,238,0.5)] bg-cyan-400';
            if (i % 4 === 0) {
              flashState = metrics.kickActive;
              glowColor = 'shadow-[0_0_12px_rgba(244,63,94,0.7)] bg-rose-500';
            } else if (i % 3 === 0) {
              flashState = metrics.snareActive;
              glowColor = 'shadow-[0_0_10px_rgba(168,85,247,0.6)] bg-purple-500';
            } else if (i % 2 === 0) {
              flashState = metrics.bass > 0.4;
              glowColor = 'shadow-[0_0_8px_rgba(251,191,36,0.5)] bg-amber-400';
            } else {
              flashState = metrics.mid > 0.35;
              glowColor = 'shadow-[0_0_8px_rgba(34,211,238,0.4)] bg-cyan-400';
            }

            return (
              <div
                key={i}
                className={`h-2.5 rounded-full transition-all duration-75 ${
                  flashState && isPlaying
                    ? `${glowColor} scale-110`
                    : 'bg-white/5 border border-white/5'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
