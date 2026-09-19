import React, { useState, useEffect, useRef } from 'react';
import { useMedia } from '../context/MediaContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  PictureInPicture2,
  ArrowLeft,
  Settings,
  Gauge,
  Sliders,
  Layers
} from 'lucide-react';

export const VideoPlayerView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    togglePlayPause,
    seek,
    setVolumeLevel,
    toggleMute,
    setSpeed,
    nextTrack,
    prevTrack,
    triggerPiP,
    triggerFullscreen,
    setUiMode,
    videoRef,
    setIsEqOpen
  } = useMedia();

  const [controlsVisible, setControlsVisible] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<'fit' | 'fill' | '16:9' | '4:3'>('fit');
  const [isHoveringScrubber, setIsHoveringScrubber] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = () => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3500);
    }
  };

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isPlaying]);

  if (!currentTrack || currentTrack.type !== 'video') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black text-neutral-400 p-8 space-y-4">
        <p className="text-sm">No video is currently loaded in the theater.</p>
        <button
          onClick={() => setUiMode('offtop')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(ratio * (duration || 1));
  };

  const getObjectFitClass = () => {
    switch (aspectRatio) {
      case 'fill':
        return 'object-cover w-full h-full';
      case '16:9':
        return 'aspect-video object-contain max-h-full max-w-full';
      case '4:3':
        return 'aspect-[4/3] object-contain max-h-full max-w-full';
      default:
        return 'object-contain max-h-full max-w-full';
    }
  };

  return (
    <div
      id="video-theater-container"
      onMouseMove={resetHideTimer}
      onClick={resetHideTimer}
      className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden select-none pb-20"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={currentTrack.url}
        crossOrigin="anonymous"
        className={getObjectFitClass()}
        onClick={togglePlayPause}
        onTimeUpdate={() => {
          if (videoRef.current) {
            seek(videoRef.current.currentTime);
          }
        }}
        onEnded={() => nextTrack(false)}
        playsInline
      />

      {/* Top Overlay Banner (Back + Video Title) */}
      <div
        className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 z-20 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setUiMode('offtop')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white drop-shadow">{currentTrack.title}</h2>
            <p className="text-xs text-neutral-300 drop-shadow">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Aspect Ratio + Settings */}
        <div className="flex items-center gap-2">
          <div className="flex bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 text-xs">
            {(['fit', 'fill', '16:9', '4:3'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setAspectRatio(mode)}
                className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-bold font-mono transition-colors ${
                  aspectRatio === mode ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsEqOpen(true)}
            className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md"
            title="Video Audio EQ"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Play/Pause indicator on click */}
      {!isPlaying && (
        <button
          onClick={togglePlayPause}
          className="absolute w-20 h-20 rounded-full bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-transform z-10"
        >
          <Play className="w-10 h-10 fill-current ml-1" />
        </button>
      )}

      {/* Floating Bottom Video Controls */}
      <div
        className={`absolute bottom-24 left-6 right-6 p-4 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-xl transition-opacity duration-300 z-20 space-y-3 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber Bar */}
        <div
          onClick={handleScrubberClick}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoverTime(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * (duration || 1));
          }}
          onMouseEnter={() => setIsHoveringScrubber(true)}
          onMouseLeave={() => setIsHoveringScrubber(false)}
          className="relative h-4 flex items-center cursor-pointer group"
        >
          {isHoveringScrubber && hoverTime !== null && (
            <div
              style={{ left: `${(hoverTime / (duration || 1)) * 100}%` }}
              className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[10px] font-mono text-white pointer-events-none"
            >
              {formatTime(hoverTime)}
            </div>
          )}
          <div className="w-full h-1.5 bg-white/20 group-hover:h-2.5 rounded-full overflow-hidden transition-all relative">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            />
          </div>
          <div
            style={{ left: `${progressPercent}%` }}
            className="absolute -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>

        {/* Video Transport Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={prevTrack} className="text-white hover:text-blue-400 transition-colors">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button onClick={() => nextTrack(true)} className="text-white hover:text-blue-400 transition-colors">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            {/* Time label */}
            <span className="text-xs font-mono text-neutral-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Speed toggle */}
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg text-xs font-mono text-neutral-200">
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={playbackRate}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="0.5" className="bg-neutral-900">0.5x</option>
                <option value="0.75" className="bg-neutral-900">0.75x</option>
                <option value="1" className="bg-neutral-900">1x</option>
                <option value="1.25" className="bg-neutral-900">1.25x</option>
                <option value="1.5" className="bg-neutral-900">1.5x</option>
                <option value="2" className="bg-neutral-900">2x</option>
              </select>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white hover:text-blue-400">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                className="w-16 h-1 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Picture in Picture */}
            <button
              onClick={triggerPiP}
              title="Picture-in-Picture"
              className="p-1.5 text-neutral-300 hover:text-white transition-colors"
            >
              <PictureInPicture2 className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={triggerFullscreen}
              title="Toggle Fullscreen"
              className="p-1.5 text-neutral-300 hover:text-white transition-colors"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
