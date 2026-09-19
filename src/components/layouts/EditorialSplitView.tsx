import React from 'react';
import { useMedia } from '../../context/MediaContext';
import { motion } from 'motion/react';
import { Play, Pause, SplitSquareVertical, Clock, Disc, Sparkles } from 'lucide-react';

export const EditorialSplitView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    filteredMedia,
    playTrack,
    themeConfig
  } = useMedia();

  return (
    <div className={`w-full h-full ${themeConfig.primaryBg} flex flex-col lg:flex-row overflow-hidden select-none`}>
      {/* Left Column: Monumental Hero Visual & Typography */}
      <div className="lg:w-1/2 h-full p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden bg-black">
        <img
          src={currentTrack?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop'}
          alt="Hero Cover"
          className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />

        {/* Top Editorial Mark */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SplitSquareVertical className="w-5 h-5 text-rose-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-white">Editorial Spread</span>
          </div>
          <span className="text-xs font-mono text-neutral-400">VOL. 24 / STUDIO EDITION</span>
        </div>

        {/* Big Editorial Headline */}
        <div className="relative z-10 space-y-4 my-auto">
          <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-mono text-neutral-300 font-bold uppercase tracking-widest border border-white/15">
            {currentTrack?.trackType || 'FEATURED MASTER'}
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none uppercase">
            {currentTrack?.title || 'Tessera Studio'}
          </h1>
          <p className="text-lg text-neutral-300 font-medium">
            Composed by <span className="text-white font-bold">{currentTrack?.artist || 'Anonymous'}</span>
          </p>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={togglePlayPause}
              className="px-8 py-3 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-2xl transition-all active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
              <span>{isPlaying ? 'Pause Experience' : 'Listen Now'}</span>
            </button>
            <span className="text-xs font-mono text-neutral-400">
              {currentTrack?.bpm || 120} BPM • {currentTrack?.key || 'C MIN'}
            </span>
          </div>
        </div>

        {/* Bottom Metadata Footnote */}
        <div className="relative z-10 flex items-center justify-between text-xs text-neutral-500 font-mono pt-4 border-t border-white/10">
          <span>HIGH-RESOLUTION 24-BIT FLAC</span>
          <span>GENRE: {currentTrack?.genre?.toUpperCase() || 'ELECTRONIC / BEAT'}</span>
        </div>
      </div>

      {/* Right Column: Clean Editorial Typography Tracklist */}
      <div className="lg:w-1/2 h-full overflow-y-auto p-8 lg:p-12 space-y-4 custom-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Selected Track Index</span>
          <span className="text-xs font-mono text-neutral-500">{filteredMedia.length} Tracks</span>
        </div>

        <div className="space-y-2">
          {filteredMedia.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ease-out flex items-center justify-between group ${
                  isCurrent
                    ? 'border-white bg-white/15 text-white ring-1 ring-white/30 translate-x-2'
                    : 'border-white/5 hover:border-white/20 hover:bg-white/10 hover:translate-x-3.5 hover:shadow-lg text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xs font-mono text-neutral-500 w-6">{(idx + 1).toString().padStart(2, '0')}</span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:underline truncate">{track.title}</h4>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-xs font-mono text-neutral-400">
                  {track.bpm && <span>{track.bpm} BPM</span>}
                  <button className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white group-hover:text-black flex items-center justify-center transition-colors">
                    {isCurrent && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
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
