import React from 'react';
import { useMedia } from '../../context/MediaContext';
import { Film, Play, Pause, Disc } from 'lucide-react';

export const FilmstripView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    filteredMedia,
    playTrack,
    themeConfig
  } = useMedia();

  return (
    <div className={`w-full h-full ${themeConfig.primaryBg} flex flex-col justify-between p-6 select-none overflow-hidden`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-tight">35mm Filmstrip Reel</h2>
        </div>
        <span className="text-xs font-mono text-neutral-400">FRAME RATIO 2.39:1 CINEMA</span>
      </div>

      {/* Horizontal Film Reel Strip */}
      <div className="relative py-6 bg-[#0a0a0e] border-y-4 border-dashed border-white/20 my-auto overflow-x-auto custom-scrollbar flex gap-4 px-6 items-center">
        {filteredMedia.map((track, idx) => {
          const isCurrent = currentTrack?.id === track.id;

          return (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              className={`w-72 h-44 rounded-xl overflow-hidden shrink-0 border-2 cursor-pointer relative group shadow-2xl transition-all ${
                isCurrent ? 'border-white scale-105 ring-4 ring-cyan-400/40' : 'border-white/20 hover:border-white/50 opacity-75 hover:opacity-100'
              }`}
            >
              <img
                src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop'}
                alt={track.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-300">
                  <span>FRAME #{idx + 1}</span>
                  <span>{track.bpm || 120} BPM</span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white truncate max-w-[170px]">{track.title}</h4>
                    <p className="text-[11px] text-neutral-400 truncate">{track.artist}</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold">
                    {isCurrent && isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Transport Strip */}
      <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
        <span>KODAK VISION3 500T EMULATION</span>
        <span>{filteredMedia.length} CINEMATIC FRAMES LOADED</span>
      </div>
    </div>
  );
};
