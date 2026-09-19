import React from 'react';
import { useMedia } from '../../context/MediaContext';
import { motion } from 'motion/react';
import { 
  Play, 
  Pause, 
  LayoutGrid, 
  Layers, 
  Sparkles, 
  Activity, 
  Tag, 
  Sliders, 
  Disc, 
  Clock,
  Radio
} from 'lucide-react';

export const BentoGridView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    filteredMedia,
    packs,
    playTrack,
    themeConfig,
    setIsEqOpen,
    allUserTags,
    openPackDetail
  } = useMedia();

  return (
    <div className={`w-full h-full ${themeConfig.primaryBg} overflow-y-auto p-6 custom-scrollbar select-none`}>
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Bento Grid Studio</h2>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-neutral-300 font-bold">
              Modular Composition
            </span>
          </div>
          <div className="text-xs text-neutral-400 font-mono">
            {filteredMedia.length} TRACK TILES • {packs.length} PACKS
          </div>
        </div>

        {/* Bento Composition Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[160px]">
          {/* Main Hero Visualizer Tile (2 cols, 2 rows) */}
          <div className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden border border-white/15 bg-black p-6 flex flex-col justify-between shadow-2xl group">
            <img
              src={currentTrack?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop'}
              alt={currentTrack?.title}
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-black/60 border border-white/20 text-[10px] font-bold uppercase text-white backdrop-blur-md">
                {currentTrack?.trackType || 'Master Stem'}
              </span>
              <span className="text-xs font-mono text-cyan-300 bg-black/50 px-2.5 py-1 rounded-lg border border-white/10">
                {currentTrack?.bpm || 120} BPM • {currentTrack?.key || 'C min'}
              </span>
            </div>

            <div className="relative z-10 flex items-end justify-between">
              <div>
                <h1 className="text-2xl font-black text-white">{currentTrack?.title || 'No Track'}</h1>
                <p className="text-xs text-neutral-300 font-medium mt-0.5">{currentTrack?.artist}</p>
              </div>

              <button
                onClick={togglePlayPause}
                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black translate-x-0.5" />}
              </button>
            </div>
          </div>

          {/* Quick Audio Equalizer Tile */}
          <div 
            onClick={() => setIsEqOpen(true)}
            className="rounded-3xl border border-white/10 bg-[#16161e] p-4 flex flex-col justify-between cursor-pointer hover:border-white/30 hover:bg-[#1f1f2a] transition-all shadow-md group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300">5-Band EQ</span>
              <Sliders className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-end gap-1.5 h-12 justify-center">
              {[60, 40, 85, 30, 70].map((v, i) => (
                <div key={i} className="w-2 rounded-full bg-cyan-400/80" style={{ height: `${v}%` }} />
              ))}
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">Launch Studio Deck →</span>
          </div>

          {/* Packs Collection Tile */}
          <div className="rounded-3xl border border-white/10 bg-[#16161e] p-4 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300">Sound Packs</span>
              <Layers className="w-4 h-4 text-rose-400" />
            </div>
            <div className="space-y-1.5 overflow-y-auto max-h-20 custom-scrollbar">
              {packs.length === 0 ? (
                <span className="text-xs text-neutral-500 italic">No packs yet</span>
              ) : (
                packs.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => openPackDetail(p.id)}
                    className="w-full text-left text-xs font-bold text-white hover:text-amber-300 truncate flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span className="truncate">{p.title}</span>
                  </button>
                ))
              )}
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">{packs.length} Active Packs</span>
          </div>

          {/* Individual Media Tiles */}
          {filteredMedia.slice(0, 10).map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={`relative rounded-3xl border p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 ease-out shadow-md group overflow-hidden ${
                  isCurrent
                    ? 'border-white bg-white/15 ring-2 ring-white/40 translate-x-1.5'
                    : 'border-white/10 bg-[#171720] hover:border-white/30 hover:bg-[#1e1e28] hover:translate-x-2.5 hover:shadow-xl'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate max-w-[100px]">
                    {track.trackType || 'Track'}
                  </span>
                  {track.bpm && (
                    <span className="text-[10px] font-mono font-bold text-cyan-300">
                      {track.bpm} BPM
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-black shrink-0 border border-white/15 relative">
                    <img src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop'} alt={track.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      {isCurrent && isPlaying ? <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /> : <Play className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{track.title}</h4>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                  <span>{track.key || 'FLAC'}</span>
                  <span>{Math.floor((track.duration || 180) / 60)}:{(Math.floor((track.duration || 180) % 60)).toString().padStart(2, '0')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
