import React, { useState, useEffect } from 'react';
import { useMedia } from '../../context/MediaContext';
import { audioEngine } from '../../audio/audioEngine';
import { motion } from 'motion/react';
import { Activity, Play, Pause, Zap, Disc, Sliders } from 'lucide-react';

export const LivingInterfaceView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    filteredMedia,
    playTrack,
    themeConfig,
    currentTime,
    duration,
    seek
  } = useMedia();

  const [energy, setEnergy] = useState(0);
  const [kick, setKick] = useState(false);

  useEffect(() => {
    let animId: number;
    let lastKick = 0;
    const loop = () => {
      const freq = audioEngine.getFrequencyData();
      if (freq && freq.length > 0 && isPlaying) {
        const bass = (freq[1] + freq[2] + freq[3]) / 3 / 255;
        setEnergy(bass);
        const now = Date.now();
        if (bass > 0.65 && now - lastKick > 250) {
          setKick(true);
          lastKick = now;
          setTimeout(() => setKick(false), 100);
        }
      } else {
        setEnergy(0);
        setKick(false);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <div 
      className={`relative w-full h-full ${themeConfig.primaryBg} flex flex-col justify-between p-6 overflow-hidden select-none transition-all duration-75`}
      style={{
        transform: `scale(${1 + (kick ? 0.02 : 0) + energy * 0.01})`
      }}
    >
      {/* Dynamic Laser Lines on Kick */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-100"
        style={{
          opacity: kick ? 0.4 : 0.08,
          backgroundImage: `radial-gradient(circle at 50% 50%, ${themeConfig.previewColor}40 0%, transparent 70%)`
        }}
      />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-xl">
          <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Living Interface Engine</span>
          <span className="text-[10px] font-mono text-cyan-300">{(energy * 100).toFixed(0)}% VOLTAGE</span>
        </div>

        <div className="text-xs font-mono text-neutral-400">
          BEAT REACTIVE AUDIOMETER
        </div>
      </div>

      {/* Center Dynamic Typography & Floating Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center text-center z-10 space-y-6">
        <motion.div
          animate={{
            scale: isPlaying ? 1 + energy * 0.15 : 1,
            rotate: isPlaying ? Math.sin(energy * 5) * 2 : 0
          }}
          transition={{ duration: 0.05 }}
          className="relative group cursor-pointer"
          onClick={togglePlayPause}
        >
          <div 
            className="w-44 h-44 rounded-3xl overflow-hidden border-2 border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative bg-black"
            style={{
              boxShadow: `0 0 ${energy * 60}px ${themeConfig.previewColor}40`
            }}
          >
            <img
              src={currentTrack?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop'}
              alt={currentTrack?.title}
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              {isPlaying ? <Pause className="w-12 h-12 text-white drop-shadow-lg" /> : <Play className="w-12 h-12 text-white translate-x-1 drop-shadow-lg" />}
            </div>
          </div>
        </motion.div>

        {/* Floating Typography */}
        <div className="space-y-1">
          <h1 
            className="text-3xl sm:text-4xl font-black text-white tracking-tight transition-transform duration-75"
            style={{ transform: `scale(${1 + energy * 0.05})` }}
          >
            {currentTrack?.title || 'No Track Loaded'}
          </h1>
          <p className="text-sm font-semibold text-neutral-400">
            {currentTrack?.artist} • <span className="text-cyan-300 font-mono">{currentTrack?.bpm || 124} BPM</span>
          </p>
        </div>

        {/* Dynamic Spectrum Ring */}
        <div className="flex items-center gap-1 h-14 max-w-md w-full justify-center">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full transition-all duration-75"
              style={{
                height: `${Math.max(12, Math.sin(i * 0.2 + energy * 3) * 50 + energy * 45)}%`,
                backgroundColor: themeConfig.previewColor || '#ffffff'
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Floating Track Chips */}
      <div className="z-10 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {filteredMedia.map((track) => {
          const isCurrent = currentTrack?.id === track.id;
          return (
            <button
              key={track.id}
              onClick={() => playTrack(track)}
              className={`px-3.5 py-2 rounded-2xl border shrink-0 text-left transition-all flex items-center gap-2.5 ${
                isCurrent 
                  ? 'border-white bg-white/20 text-white ring-2 ring-white/40' 
                  : 'border-white/10 bg-[#16161d] text-neutral-300 hover:border-white/30 hover:bg-[#20202a]'
              }`}
            >
              <Disc className={`w-3.5 h-3.5 ${isCurrent && isPlaying ? 'animate-spin text-cyan-400' : 'text-neutral-400'}`} />
              <span className="text-xs font-bold truncate max-w-[120px]">{track.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
