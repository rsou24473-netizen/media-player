import React, { useState, useEffect, useRef } from 'react';
import { useMedia } from '../../context/MediaContext';
import { audioEngine } from '../../audio/audioEngine';
import { motion } from 'motion/react';
import { Play, Pause, Orbit, Sparkles, Disc, SkipBack, SkipForward } from 'lucide-react';

export const OrbitLayoutView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    filteredMedia,
    playTrack,
    themeConfig,
    currentTime,
    duration,
    seek,
    nextTrack,
    prevTrack
  } = useMedia();

  const [orbitAngle, setOrbitAngle] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [beatPulse, setBeatPulse] = useState(0);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      const freq = audioEngine.getFrequencyData();
      if (freq && freq.length > 0 && isPlaying) {
        const bass = (freq[1] + freq[2] + freq[3]) / 3 / 255;
        setBeatPulse(bass);
        setOrbitAngle((prev) => (prev + 0.3 * speed + bass * 0.8) % 360);
      } else {
        setBeatPulse(0);
        setOrbitAngle((prev) => (prev + 0.15 * speed) % 360);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed]);

  const totalTracks = filteredMedia.length || 1;

  return (
    <div className={`relative w-full h-full ${themeConfig.primaryBg} flex flex-col justify-between overflow-hidden p-6 select-none`}>
      {/* Top Header info */}
      <div className="flex items-center justify-between z-20">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl">
          <Orbit className="w-4 h-4 text-fuchsia-400 animate-spin" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Planetary Orbit System</span>
        </div>

        <div className="flex items-center gap-3 bg-black/60 border border-white/10 px-3 py-1 rounded-full text-xs text-neutral-300">
          <span>Speed:</span>
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded-md font-mono ${speed === s ? 'bg-white text-black font-bold' : 'hover:text-white'}`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Center Orbit Stage */}
      <div className="relative flex-1 flex items-center justify-center">
        {/* Orbital Track Rings */}
        <div 
          className="absolute w-[440px] h-[440px] rounded-full border border-dashed border-white/15 pointer-events-none transition-transform duration-300"
          style={{ transform: `scale(${1 + beatPulse * 0.05})` }}
        />
        <div 
          className="absolute w-[620px] h-[620px] rounded-full border border-white/5 pointer-events-none"
        />

        {/* Center Holographic Star / Active Track */}
        <motion.div
          animate={{ scale: isPlaying ? 1 + beatPulse * 0.08 : 1 }}
          transition={{ duration: 0.1 }}
          className="relative w-48 h-48 rounded-full overflow-hidden border-2 border-white/30 shadow-[0_0_80px_rgba(255,255,255,0.2)] bg-black z-20 flex items-center justify-center group cursor-pointer"
          onClick={togglePlayPause}
        >
          <img
            src={currentTrack?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop'}
            alt="Center Node"
            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-4 text-center">
            {isPlaying ? (
              <Pause className="w-10 h-10 text-white drop-shadow" />
            ) : (
              <Play className="w-10 h-10 text-white translate-x-0.5 drop-shadow" />
            )}
            <h3 className="text-xs font-bold text-white mt-1 line-clamp-1">{currentTrack?.title || 'Solar Core'}</h3>
            <span className="text-[10px] text-cyan-300 font-mono">{currentTrack?.bpm || 128} BPM</span>
          </div>
        </motion.div>

        {/* Orbiting Planetary Track Nodes */}
        {filteredMedia.map((track, idx) => {
          const isCurrent = currentTrack?.id === track.id;
          const radius = idx % 2 === 0 ? 220 : 310;
          const baseDeg = (360 / totalTracks) * idx;
          const currentDeg = (baseDeg + orbitAngle) % 360;
          const rad = (currentDeg * Math.PI) / 180;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;

          return (
            <motion.div
              key={track.id}
              onClick={() => playTrack(track)}
              className="absolute z-30 cursor-pointer group"
              style={{
                transform: `translate(${x}px, ${y}px)`,
                transition: 'transform 0.05s linear'
              }}
            >
              <div className={`p-1.5 rounded-full border shadow-xl transition-all ${
                isCurrent 
                  ? 'border-white bg-white/20 ring-4 ring-cyan-400/50 scale-125' 
                  : 'border-white/20 bg-[#171720] hover:border-white/60 hover:scale-110'
              }`}>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-black relative">
                  <img
                    src={track.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop'}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  {isCurrent && isPlaying && (
                    <div className="absolute inset-0 bg-cyan-500/40 animate-pulse flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    </div>
                  )}
                </div>
              </div>

              {/* Tooltip on hover */}
              <div className="absolute left-1/2 -bottom-7 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-white/20 px-2 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap pointer-events-none z-40">
                {track.title}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Waveform & Controls */}
      <div className="z-20 max-w-2xl mx-auto w-full bg-[#15151c]/95 border border-white/20 rounded-2xl p-3 backdrop-blur-xl flex items-center gap-4">
        <button onClick={() => prevTrack()} className="p-2 hover:bg-white/10 rounded-full text-neutral-300">
          <SkipBack className="w-4 h-4" />
        </button>
        <button onClick={togglePlayPause} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold shadow-md">
          {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
        </button>
        <button onClick={() => nextTrack(true)} className="p-2 hover:bg-white/10 rounded-full text-neutral-300">
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Mini Waveform */}
        <div 
          className="flex-1 h-8 bg-black/50 rounded-xl p-1 flex items-center gap-0.5 cursor-pointer overflow-hidden border border-white/10"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seek(((e.clientX - rect.left) / rect.width) * duration);
          }}
        >
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-full transition-all"
              style={{
                height: `${Math.sin(i * 0.3) * 35 + 45}%`,
                backgroundColor: i / 48 <= (currentTime / duration) ? (themeConfig.previewColor || '#ffffff') : 'rgba(255,255,255,0.2)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
