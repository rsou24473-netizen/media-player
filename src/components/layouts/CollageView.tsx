import React from 'react';
import { useMedia } from '../../context/MediaContext';
import { Layers, Disc, Play, Pause, Sparkles } from 'lucide-react';

export const CollageView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    filteredMedia,
    playTrack,
    themeConfig
  } = useMedia();

  return (
    <div className={`w-full h-full ${themeConfig.primaryBg} overflow-y-auto p-6 custom-scrollbar select-none`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Tactile Collage & Vinyl Deck</h2>
          </div>
          <span className="text-xs font-mono text-neutral-400">ANALOG STICKERS & CASSETTES</span>
        </div>

        {/* Tactile Collage Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {filteredMedia.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const rotations = ['rotate-1', '-rotate-2', 'rotate-2', '-rotate-1', 'rotate-3', '-rotate-3'];
            const rot = rotations[idx % rotations.length];

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={`p-4 rounded-3xl border cursor-pointer transition-all duration-300 shadow-2xl bg-[#1c1c24] relative group ${rot} hover:rotate-0 hover:scale-105 ${
                  isCurrent ? 'border-amber-400 ring-4 ring-amber-400/30' : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* Vinyl Platter Sticker */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black mb-3 border border-white/20">
                  <img
                    src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop'}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono text-amber-300 border border-amber-400/30 font-bold uppercase">
                    SIDE {idx % 2 === 0 ? 'A' : 'B'}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white truncate">{track.title}</h4>
                    <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                  </div>
                  <button className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center font-bold shadow-md ml-2 shrink-0">
                    {isCurrent && isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
