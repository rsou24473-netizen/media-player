import React from 'react';
import { useMedia } from '../../context/MediaContext';
import { MoveHorizontal, Play, Pause, Disc } from 'lucide-react';

export const HorizontalScrollView: React.FC = () => {
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
          <MoveHorizontal className="w-5 h-5 text-rose-400" />
          <h2 className="text-base font-bold text-white tracking-tight">Horizontal Showcase Reel</h2>
        </div>
        <span className="text-xs font-mono text-neutral-400">PANORAMIC SCROLL</span>
      </div>

      {/* Horizontal Cards Reel */}
      <div className="my-auto flex gap-6 overflow-x-auto py-8 px-4 custom-scrollbar items-center">
        {filteredMedia.map((track) => {
          const isCurrent = currentTrack?.id === track.id;

          return (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              className={`w-80 h-[380px] rounded-3xl overflow-hidden shrink-0 border-2 cursor-pointer relative group shadow-2xl transition-all flex flex-col justify-between p-6 bg-black ${
                isCurrent ? 'border-white scale-105 ring-4 ring-white/30' : 'border-white/10 hover:border-white/40'
              }`}
            >
              <img
                src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop'}
                alt={track.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-black/60 border border-white/20 text-[10px] font-bold uppercase text-white backdrop-blur-md">
                  {track.trackType || 'Track'}
                </span>
                <span className="text-xs font-mono text-cyan-300 font-bold bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                  {track.bpm || 120} BPM
                </span>
              </div>

              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <h3 className="text-lg font-black text-white leading-snug">{track.title}</h3>
                  <p className="text-xs text-neutral-300 font-medium mt-1">{track.artist}</p>
                </div>
                <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-bold shadow-xl">
                  {isCurrent && isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
        <span>HORIZONTAL INERTIA ACTIVE</span>
        <span>{filteredMedia.length} TRACK CARDS</span>
      </div>
    </div>
  );
};
