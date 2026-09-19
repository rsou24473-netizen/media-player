import React from 'react';
import { useMedia } from '../../context/MediaContext';
import { Square, Play, Pause } from 'lucide-react';

export const MinimalistGalleryView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    filteredMedia,
    playTrack,
    themeConfig
  } = useMedia();

  return (
    <div className={`w-full h-full ${themeConfig.primaryBg} overflow-y-auto p-12 custom-scrollbar select-none`}>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <Square className="w-5 h-5 text-neutral-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">Monolith Gallery</h2>
          </div>
          <span className="text-xs font-mono text-neutral-500">MINIMAL ARCHITECTURE</span>
        </div>

        {/* Minimal High-Contrast List */}
        <div className="space-y-6">
          {filteredMedia.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={`py-6 px-4 border-b border-white/5 cursor-pointer transition-all flex items-center justify-between group ${
                  isCurrent ? 'bg-white/5 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-8 min-w-0">
                  <span className="text-xs font-mono text-neutral-600">{(idx + 1).toString().padStart(2, '0')}</span>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-white group-hover:translate-x-2 transition-transform truncate">{track.title}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-xs font-mono">
                  {track.bpm && <span>{track.bpm} BPM</span>}
                  <button className="w-10 h-10 rounded-full border border-white/20 group-hover:border-white flex items-center justify-center transition-colors">
                    {isCurrent && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
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
