import React, { useState, useMemo } from 'react';
import { useMedia } from '../context/MediaContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Share2,
  ListMusic,
  MoreHorizontal,
  Check,
  ChevronDown,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles
} from 'lucide-react';

export const TransportBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    togglePlayPause,
    seek,
    setVolumeLevel,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleShuffle,
    cycleRepeatMode,
    setIsEqOpen,
    setIsNowPlayingOpen,
    toastNotification,
    setToastNotification,
    openEditTrack,
    themeConfig
  } = useMedia();

  const [isHoveringScrubber, setIsHoveringScrubber] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(ratio * (duration || 1));
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(ratio * (duration || 1));
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Waveform generation
  const waveformBars = useMemo(() => {
    const barCount = 72;
    const seed = (currentTrack?.title || 'track').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const bars: number[] = [];
    for (let i = 0; i < barCount; i++) {
      const base = Math.sin((i / barCount) * Math.PI) * 0.45 + 0.25;
      const variation = Math.sin((i * 11 + seed) % 17) * 0.3;
      const peak = Math.min(1, Math.max(0.18, base + variation));
      bars.push(peak);
    }
    return bars;
  }, [currentTrack?.id, currentTrack?.title]);

  return (
    <>
      {/* Centered Floating Transport Player with Cool Flowing Animated Border Aura */}
      <footer
        id="media-transport-bar"
        className={`fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-5xl ${themeConfig.cardBg} backdrop-blur-3xl border ${themeConfig.borderColor} rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between select-none shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,0,0,0.4)] transition-all duration-300 relative before:absolute before:-inset-[1.5px] before:rounded-2xl before:bg-gradient-to-r before:from-cyan-500/35 before:via-fuchsia-500/35 before:to-amber-400/35 before:animate-aura-flow before:-z-10 before:blur-[2px]`}
      >
        {/* Left: Artwork + Animated Live Equalizer + Title + Subtitle */}
        <div className="flex items-center gap-3 w-52 sm:w-64 shrink-0">
          {currentTrack ? (
            <>
              {/* Artwork with Live Equalizer Overlay when Playing */}
              <div
                onClick={() => setIsNowPlayingOpen(true)}
                className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-black/60 border ${themeConfig.borderColor} cursor-pointer shrink-0 shadow-md group`}
              >
                <img
                  src={currentTrack.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'}
                  alt={currentTrack.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                    isPlaying ? 'scale-105' : ''
                  }`}
                />

                {/* Animated Spectrum Overlay when Playing */}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-end justify-center gap-[2.5px] pb-2 px-2">
                    <div className="w-[3px] rounded-full bg-cyan-400 animate-eq-1 shadow-[0_0_6px_#22d3ee]" />
                    <div className="w-[3px] rounded-full bg-fuchsia-400 animate-eq-2 shadow-[0_0_6px_#e879f9]" />
                    <div className="w-[3px] rounded-full bg-amber-400 animate-eq-3 shadow-[0_0_6px_#fbbf24]" />
                    <div className="w-[3px] rounded-full bg-emerald-400 animate-eq-4 shadow-[0_0_6px_#34d399]" />
                  </div>
                )}
              </div>

              {/* Title & Artist */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    onClick={() => setIsNowPlayingOpen(true)}
                    className="text-xs sm:text-sm font-bold text-white truncate cursor-pointer hover:underline leading-tight"
                  >
                    {currentTrack.title}
                  </span>
                  {isPlaying && (
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </div>
                <div className={`text-[11px] sm:text-xs ${themeConfig.accentTextColor || 'text-neutral-400'} truncate mt-0.5 font-medium`}>
                  {currentTrack.artist || 'Master Audio'}
                </div>
              </div>
            </>
          ) : (
            <div className="text-xs font-medium text-neutral-500 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
              <span>Select track to play</span>
            </div>
          )}
        </div>

        {/* Middle: Waveform Bar + Bigger Transport Controls */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-4 flex flex-col items-center gap-1 sm:gap-1.5">
          {/* Waveform Scrubber with Timestamp on Right */}
          <div className="w-full flex items-center gap-2 sm:gap-3">
            <div
              onMouseEnter={() => setIsHoveringScrubber(true)}
              onMouseLeave={() => setIsHoveringScrubber(false)}
              onMouseMove={handleScrubberMouseMove}
              onClick={handleScrubberClick}
              className="relative flex-1 h-6 flex items-center cursor-pointer group"
            >
              {/* Tooltip */}
              {isHoveringScrubber && hoverTime !== null && (
                <div
                  style={{ left: `${(hoverTime / (duration || 1)) * 100}%` }}
                  className={`absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md ${themeConfig.cardBg} border ${themeConfig.borderColor} text-[10px] font-mono text-white pointer-events-none shadow-xl z-20`}
                >
                  {formatTime(hoverTime)}
                </div>
              )}

              {/* Glowing playhead needle */}
              <div
                style={{ left: `${progressPercent}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] pointer-events-none z-10 transition-all duration-75 group-hover:scale-125"
              />

              {/* Audio Waveform Bars with Color Dynamics */}
              <div className="w-full h-full flex items-center justify-between gap-[2px]">
                {waveformBars.map((heightMultiplier, idx) => {
                  const barProgress = (idx / waveformBars.length) * 100;
                  const isPlayed = barProgress <= progressPercent;
                  const heightPercent = Math.round(heightMultiplier * 100);

                  return (
                    <div
                      key={idx}
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: isPlayed 
                          ? (themeConfig.previewColor || '#00f0ff') 
                          : 'rgba(255, 255, 255, 0.16)'
                      }}
                      className={`flex-1 min-w-[2px] max-w-[4px] rounded-full transition-all duration-75 ${
                        isPlayed ? 'opacity-100 shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'opacity-80 group-hover:opacity-100'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Time: 00:01 / 02:49 */}
            <span className="text-[11px] sm:text-xs font-mono font-medium text-neutral-300 shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Transport Controls Row - BIGGER BUTTONS with tactile animations */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-neutral-300">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                isShuffled 
                  ? `${themeConfig.accentTextColor} bg-white/10 font-bold shadow-sm` 
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Prev Track - Bigger Button */}
            <button
              onClick={prevTrack}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-neutral-200 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Play/Pause: BIGGER Prominent Button with dynamic color animation and glowing rings */}
            <div className="relative flex items-center justify-center">
              {isPlaying && (
                <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping pointer-events-none" />
              )}
              <button
                onClick={togglePlayPause}
                className={`relative w-11 h-11 sm:w-13 sm:h-13 rounded-full ${themeConfig.accentColor || 'bg-white'} text-black flex items-center justify-center shadow-[0_6px_25px_rgba(0,0,0,0.6),0_0_18px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all duration-150 z-10`}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-black" />
                ) : (
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-black ml-0.5" />
                )}
              </button>
            </div>

            {/* Next Track - Bigger Button */}
            <button
              onClick={() => nextTrack(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-neutral-200 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            {/* Repeat */}
            <button
              onClick={cycleRepeatMode}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                repeatMode !== 'off' 
                  ? `${themeConfig.accentTextColor} bg-white/10 font-bold shadow-sm` 
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title="Repeat"
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>

            {/* Share / Export */}
            <button
              onClick={() => {
                if (currentTrack) {
                  navigator.clipboard.writeText(currentTrack.url);
                  setToastNotification({
                    title: '1 file ready',
                    subtitle: `${currentTrack.title} Ready`
                  });
                }
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
              title="Share / Copy Link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Queue / List */}
            <button
              onClick={() => setIsNowPlayingOpen(true)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
              title="Open Playing Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* More Options */}
            <div className="relative">
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                title="More Studio Tools"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMoreMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute right-0 bottom-full mb-2 w-52 ${themeConfig.cardBg} backdrop-blur-3xl border ${themeConfig.borderColor} rounded-xl p-1.5 shadow-2xl z-50 text-xs text-white space-y-1`}
                >
                  {currentTrack && (
                    <button
                      onClick={() => {
                        openEditTrack(currentTrack);
                        setIsMoreMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg ${themeConfig.hoverBg} transition-colors`}
                    >
                      Edit Track Metadata
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsEqOpen(true);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg ${themeConfig.hoverBg} flex items-center justify-between transition-colors`}
                  >
                    <span>5-Band Studio EQ</span>
                    <Sliders className={`w-3.5 h-3.5 ${themeConfig.accentIconColor}`} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Bigger Volume Button & Smooth Slider */}
        <div className="w-44 sm:w-56 flex items-center justify-end gap-2 shrink-0">
          <div className="flex items-center gap-2.5 bg-black/30 px-3 py-1.5 rounded-full border border-white/10">
            <button
              onClick={toggleMute}
              className="text-neutral-300 hover:text-white transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-rose-400" />
              ) : (
                <Volume2 className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${themeConfig.accentIconColor || 'text-neutral-200'}`} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
              style={{ accentColor: themeConfig.previewColor || '#00f0ff' }}
              className="w-16 sm:w-24 h-1.5 cursor-pointer rounded-lg bg-neutral-700"
            />
          </div>
        </div>
      </footer>

      {/* Floating Bottom-Right Toast Notification */}
      {toastNotification && (
        <div
          id="ready-toast-notification"
          className={`fixed bottom-4 right-4 z-50 w-64 ${themeConfig.cardBg} backdrop-blur-2xl border ${themeConfig.borderColor} rounded-xl p-3 text-white shadow-2xl select-none`}
        >
          {/* Header: 1 file ready | More Clear ⌄ */}
          <div className={`flex items-center justify-between text-[11px] text-neutral-400 pb-1.5 border-b ${themeConfig.borderColor}`}>
            <span className="font-semibold text-white">{toastNotification.title || '1 file ready'}</span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="hover:text-white cursor-pointer">More</span>
              <span
                onClick={() => setToastNotification(null)}
                className="hover:text-white cursor-pointer"
              >
                Clear
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-500" />
            </div>
          </div>

          {/* Body: ✓ file Ready */}
          <div className="flex items-center gap-2 pt-2">
            <div className={`w-4 h-4 rounded-full ${themeConfig.accentColor} flex items-center justify-center shrink-0`}>
              <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                {currentTrack?.title || 'Audio Track'}
              </div>
              <div className={`text-[10px] ${themeConfig.accentTextColor}`}>Ready</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
