import React, { useState } from 'react';
import { useMedia } from '../context/MediaContext';
import { VisualizerCanvas } from './VisualizerCanvas';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  Sliders,
  ListPlus,
  Trash2,
  Tag,
  Activity,
  Music4
} from 'lucide-react';

export const NowPlayingDrawer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    queue,
    queueIndex,
    isNowPlayingOpen,
    setIsNowPlayingOpen,
    togglePlayPause,
    seek,
    setVolumeLevel,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleShuffle,
    cycleRepeatMode,
    toggleFavorite,
    playTrack,
    removeFromQueue,
    clearQueue,
    setIsEqOpen,
    visualizerMode,
    setVisualizerMode
  } = useMedia();

  const [activeTab, setActiveTab] = useState<'visualizer' | 'queue' | 'info'>('visualizer');

  if (!isNowPlayingOpen || !currentTrack) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      id="now-playing-full-stage"
      className="fixed inset-0 z-50 bg-[#100f13]/95 backdrop-blur-2xl flex flex-col text-white animate-in slide-in-from-bottom duration-300 overflow-hidden select-none"
    >
      {/* Top Header Bar */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 shrink-0">
        <button
          id="close-now-playing-stage-btn"
          onClick={() => setIsNowPlayingOpen(false)}
          className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors text-xs font-semibold"
        >
          <ChevronDown className="w-5 h-5" />
          <span>Collapse Stage</span>
        </button>

        {/* Tab switchers */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'visualizer' ? 'bg-white/20 text-white font-bold shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-400" /> Visualizer & Artwork
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'queue' ? 'bg-white/20 text-white font-bold shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Music4 className="w-3.5 h-3.5 text-blue-400" /> Playing Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'info' ? 'bg-white/20 text-white font-bold shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-emerald-400" /> Audio Metadata
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEqOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5"
            title="Open Equalizer"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Stage Area */}
      <div className="flex-1 overflow-hidden p-6 md:p-8 flex items-center justify-center">
        {activeTab === 'visualizer' && (
          <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-10">
            {/* Artwork Card with Ambient Glow */}
            <div className="relative group shrink-0">
              <div
                style={{
                  backgroundImage: `url(${currentTrack.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'})`
                }}
                className="absolute inset-0 rounded-3xl blur-2xl opacity-40 scale-95 transition-all group-hover:scale-105"
              />
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl bg-neutral-900">
                <img
                  src={currentTrack.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'}
                  alt={currentTrack.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                />
              </div>
            </div>

            {/* Visualizer and Live Details */}
            <div className="flex-1 w-full flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-xs font-mono font-bold uppercase">
                    {currentTrack.typeTag || 'Track'}
                  </span>
                  {currentTrack.bpm && (
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                      {currentTrack.bpm} BPM
                    </span>
                  )}
                  {currentTrack.key && (
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-xs font-mono">
                      Key: {currentTrack.key}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
                  {currentTrack.title}
                </h1>
                <p className="text-base text-neutral-300 font-medium">
                  {currentTrack.artist}
                </p>
                {currentTrack.album && (
                  <p className="text-xs text-neutral-500 font-mono">
                    Album: {currentTrack.album}
                  </p>
                )}
              </div>

              {/* Real-time Visualizer Canvas */}
              <div className="w-full bg-[#16161c] p-4 rounded-2xl border border-white/10 shadow-inner flex flex-col items-center">
                <div className="w-full flex items-center justify-between text-xs text-neutral-400 mb-2">
                  <span className="font-mono uppercase font-bold text-purple-400">
                    Mode: {visualizerMode}
                  </span>
                  <div className="flex gap-1">
                    {(['spectrum', 'bars', 'wave', 'radial'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setVisualizerMode(mode)}
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono transition-colors ${
                          visualizerMode === mode ? 'bg-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-neutral-400'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <VisualizerCanvas width={420} height={110} className="w-full" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="w-full max-w-2xl h-full flex flex-col bg-[#161619] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-sm">Up Next in Queue ({queue.length})</h3>
              <button
                onClick={clearQueue}
                className="text-xs text-neutral-400 hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Queue
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2">
              {queue.map((track, i) => {
                const isCurrent = i === queueIndex;
                return (
                  <div
                    key={`${track.id}-${i}`}
                    onClick={() => playTrack(track, queue)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ease-out ${
                      isCurrent 
                        ? 'bg-blue-600/25 text-white font-bold translate-x-2' 
                        : 'hover:bg-white/10 hover:translate-x-3 text-neutral-300 hover:text-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="font-mono text-xs text-neutral-500 w-5">{i + 1}</span>
                      <img
                        src={track.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <div className="truncate">
                        <div className="text-xs truncate">{track.title}</div>
                        <div className="text-[10px] text-neutral-400 truncate">{track.artist}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-neutral-400">
                        {formatTime(track.duration)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(i);
                        }}
                        className="p-1 hover:text-rose-400 text-neutral-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="w-full max-w-xl bg-[#161619] p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <h3 className="font-bold text-base border-b border-white/10 pb-3">
              Media File & Tag Information
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-neutral-500 block mb-1">Title</span>
                <span className="font-semibold text-white">{currentTrack.title}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-neutral-500 block mb-1">Artist / Producer</span>
                <span className="font-semibold text-white">{currentTrack.artist}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-neutral-500 block mb-1">Genre</span>
                <span className="font-semibold text-white">{currentTrack.genre || 'General'}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-neutral-500 block mb-1">Mood</span>
                <span className="font-semibold text-white">{currentTrack.mood || 'Standard'}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-neutral-500 block mb-1">Tempo (BPM)</span>
                <span className="font-mono font-semibold text-emerald-400">{currentTrack.bpm || '140'} BPM</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-neutral-500 block mb-1">Musical Key</span>
                <span className="font-mono font-semibold text-purple-400">{currentTrack.key || 'C Major'}</span>
              </div>
            </div>

            <div>
              <span className="text-neutral-500 text-xs block mb-2">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {currentTrack.customTags?.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-md bg-white/10 text-xs text-neutral-300">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stage Scrubber & Big Transport Controls */}
      <div className="p-6 md:px-12 border-t border-white/10 bg-[#121115] flex flex-col items-center space-y-4 shrink-0">
        {/* Scrubber */}
        <div className="w-full max-w-3xl flex items-center gap-4">
          <span className="text-xs font-mono text-neutral-400 w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              seek(ratio * (duration || 1));
            }}
            className="flex-1 h-3 flex items-center cursor-pointer group relative"
          >
            <div className="w-full h-2 bg-white/10 group-hover:h-3 rounded-full overflow-hidden transition-all">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
              />
            </div>
            <div
              style={{ left: `${progressPercent}%` }}
              className="absolute -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-lg"
            />
          </div>
          <span className="text-xs font-mono text-neutral-400 w-12">
            {formatTime(duration)}
          </span>
        </div>

        {/* Big Buttons */}
        <div className="flex items-center gap-8">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-xl transition-colors ${isShuffled ? 'text-blue-400' : 'text-neutral-400 hover:text-white'}`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button onClick={prevTrack} className="text-white hover:text-blue-400 transition-colors">
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-xl"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          <button onClick={() => nextTrack(true)} className="text-white hover:text-blue-400 transition-colors">
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={cycleRepeatMode}
            className={`p-2 rounded-xl transition-colors ${repeatMode !== 'off' ? 'text-blue-400' : 'text-neutral-400 hover:text-white'}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
