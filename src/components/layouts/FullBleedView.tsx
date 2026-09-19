import React from 'react';
import { useMedia } from '../../context/MediaContext';
import { Maximize2, Play, Pause, SkipBack, SkipForward, Disc } from 'lucide-react';

export const FullBleedView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    filteredMedia,
    playTrack,
    nextTrack,
    prevTrack
  } = useMedia();

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none flex flex-col justify-between p-8">
      {/* Full-bleed background media */}
      <img
        src={currentTrack?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop'}
        alt="Full bleed"
        className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />

      {/* Top Floating Glass Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/20 backdrop-blur-xl">
          <Maximize2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Full-Bleed Cinema</span>
        </div>
        <span className="text-xs font-mono text-neutral-300 bg-black/60 px-3 py-1 rounded-full border border-white/20 backdrop-blur-xl">
          IMMERSIVE VIEWPORT
        </span>
      </div>

      {/* Floating Bottom Glass Player */}
      <div className="relative z-10 max-w-3xl mx-auto w-full bg-black/70 border border-white/20 rounded-3xl p-6 backdrop-blur-2xl shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">{currentTrack?.title || 'No Track'}</h1>
            <p className="text-sm text-neutral-300 mt-0.5">{currentTrack?.artist} • {currentTrack?.bpm || 120} BPM</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => prevTrack()} className="p-2 hover:bg-white/10 rounded-full text-white">
              <SkipBack className="w-5 h-5" />
            </button>
            <button onClick={togglePlayPause} className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-bold shadow-xl">
              {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
            </button>
            <button onClick={() => nextTrack(true)} className="p-2 hover:bg-white/10 rounded-full text-white">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick horizontal track selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {filteredMedia.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <button
                key={track.id}
                onClick={() => playTrack(track)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
                  isCurrent ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                }`}
              >
                {track.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
