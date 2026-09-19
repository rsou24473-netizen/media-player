import React from 'react';
import { useMedia } from '../../context/MediaContext';
import { Newspaper, Play, Pause, Disc } from 'lucide-react';

export const PosterLayoutView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    filteredMedia,
    playTrack,
    themeConfig
  } = useMedia();

  return (
    <div className={`w-full h-full ${themeConfig.primaryBg} overflow-y-auto p-8 lg:p-12 custom-scrollbar select-none`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Massive Swiss Typography Header */}
        <div className="border-b-4 border-white pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase">INTERNATIONAL TYPOGRAPHIC STYLE</span>
            <h1 className="text-6xl sm:text-8xl font-black text-white tracking-tighter uppercase leading-none mt-2">
              {currentTrack?.title || 'SOUNDSCAPE'}
            </h1>
          </div>
          <div className="space-y-2 text-right">
            <span className="text-sm font-bold font-mono text-cyan-400 block">{currentTrack?.bpm || 120} BPM • {currentTrack?.key || 'KEY 440HZ'}</span>
            <button
              onClick={togglePlayPause}
              className="px-8 py-3 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-neutral-200 transition-colors"
            >
              {isPlaying ? 'PAUSE MASTER' : 'TRIGGER AUDIO'}
            </button>
          </div>
        </div>

        {/* Poster Grid Composition */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {filteredMedia.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={`p-6 border-2 cursor-pointer transition-all flex flex-col justify-between h-56 ${
                  isCurrent ? 'border-white bg-white text-black' : 'border-white/20 bg-transparent text-white hover:border-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl font-black font-mono">{(idx + 1).toString().padStart(2, '0')}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${isCurrent ? 'border-black text-black' : 'border-white/30 text-neutral-300'}`}>
                    {track.trackType || 'TRACK'}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight truncate">{track.title}</h3>
                  <p className={`text-xs font-medium mt-1 truncate ${isCurrent ? 'text-neutral-800' : 'text-neutral-400'}`}>{track.artist}</p>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-current/20">
                  <span>{track.bpm || 120} BPM</span>
                  <span className="font-bold">{isCurrent && isPlaying ? 'PLAYING NOW' : 'SELECT →'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
