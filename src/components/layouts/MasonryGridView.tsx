import React from 'react';
import { useMedia } from '../../context/MediaContext';
import { motion } from 'motion/react';
import { Play, Pause, Grid3X3, Disc, Music } from 'lucide-react';

export const MasonryGridView: React.FC = () => {
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
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Masonry Media Wall</h2>
          </div>
          <span className="text-xs text-neutral-400 font-mono">{filteredMedia.length} Media Blocks</span>
        </div>

        {/* Masonry Columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {filteredMedia.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const aspectClass = idx % 3 === 0 ? 'aspect-square' : idx % 3 === 1 ? 'aspect-[4/5]' : 'aspect-[16/9]';

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={`break-inside-avoid relative rounded-3xl overflow-hidden border cursor-pointer group shadow-xl transition-all ${
                  isCurrent
                    ? 'border-white ring-2 ring-white/50 scale-[1.02]'
                    : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                }`}
              >
                <div className={`w-full ${aspectClass} relative bg-black`}>
                  <img
                    src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop'}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/20 text-[9px] font-bold uppercase text-white backdrop-blur-md">
                        {track.trackType || 'Track'}
                      </span>
                      {track.bpm && (
                        <span className="text-[10px] font-mono text-cyan-300 font-bold bg-black/50 px-2 py-0.5 rounded border border-white/10">
                          {track.bpm} BPM
                        </span>
                      )}
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">{track.title}</h4>
                        <p className="text-xs text-neutral-300 font-medium mt-0.5">{track.artist}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCurrent) togglePlayPause();
                          else playTrack(track);
                        }}
                        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold shadow-lg"
                      >
                        {isCurrent && isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
