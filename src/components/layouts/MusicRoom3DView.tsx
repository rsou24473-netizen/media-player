import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMedia } from '../../context/MediaContext';
import { audioEngine } from '../../audio/audioEngine';
import { ThreeMusicRoom } from '../ThreeMusicRoom';
import { BeatMatrixPopout } from '../BeatMatrixPopout';
import { WaveformSeeker } from '../WaveformSeeker';
import { initDatabase } from '../../db/indexedDB';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Upload, 
  Sparkles, 
  Music, 
  Activity, 
  Tag, 
  Film, 
  Layers, 
  Disc, 
  RotateCcw,
  CheckCircle2,
  Trash2
} from 'lucide-react';

// Sample royalty-free cybernetic / abstract visualizer videos for instant testing
const SAMPLE_PRESET_VIDEOS = [
  {
    name: 'Cyber Neon Wireframe',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    name: 'Cosmic Nebula Flow',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  },
  {
    name: 'Liquid Abstract Spectrum',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  }
];

export const MusicRoom3DView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    currentTime,
    duration,
    seek,
    volume,
    setVolumeLevel,
    isMuted,
    toggleMute,
    nextTrack,
    prevTrack,
    filteredMedia,
    playTrack,
    updateTrack,
    themeConfig,
    setToastNotification,
    setIsImportOpen,
    importFiles,
    mediaList
  } = useMedia();

  // Video file input ref
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Floating Beat Matrix & Cinematic mode states
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const centerContainerRef = useRef<HTMLDivElement | null>(null);

  const toggleNativeFullscreen = useCallback(() => {
    if (!centerContainerRef.current) return;
    if (!document.fullscreenElement) {
      centerContainerRef.current.requestFullscreen().catch(err => {
        console.warn('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.warn('Error exiting fullscreen:', err);
      });
    }
  }, []);

  // Real-time audio analysis for left physical track slabs
  const [bassEnergy, setBassEnergy] = useState<number>(0);
  const [highEnergy, setHighEnergy] = useState<number>(0);

  // Keep track of active video URL for the currently selected track
  useEffect(() => {
    if (currentTrack?.videoUrl) {
      setActiveVideoUrl(currentTrack.videoUrl);
    } else {
      setActiveVideoUrl(null);
    }
  }, [currentTrack]);

  // Audio analysis loop to physically vibrate the active track slab on the left
  useEffect(() => {
    let animId: number;

    const loop = () => {
      const freq = audioEngine.getFrequencyData();
      if (freq && freq.length > 0 && isPlaying) {
        let bSum = 0;
        for (let i = 1; i <= 8; i++) bSum += freq[i];
        const b = bSum / (8 * 255);
        setBassEnergy(prev => prev + (b - prev) * 0.35);

        let hSum = 0;
        for (let i = 50; i <= 100; i++) hSum += freq[i];
        const h = hSum / (51 * 255);
        setHighEnergy(prev => prev + (h - prev) * 0.3);
      } else {
        setBassEnergy(0);
        setHighEnergy(0);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Handle local video file import (.mp4, .webm, .mov)
  const handleVideoFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentTrack) return;

    const blobUrl = URL.createObjectURL(file);
    setActiveVideoUrl(blobUrl);

    await updateTrack(currentTrack.id, {
      videoUrl: blobUrl,
      videoFileName: file.name
    });

    setToastNotification({
      title: '3D Video Attached',
      subtitle: `Mapped "${file.name}" to 3D surface`
    });

    // Reset input
    if (videoInputRef.current) videoInputRef.current.value = '';
  }, [currentTrack, updateTrack, setToastNotification]);

  // Handle drag and drop video
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file || !currentTrack) return;

    if (!file.type.includes('video')) {
      setToastNotification({
        title: 'Invalid File',
        subtitle: 'Please drop a video file (.mp4, .webm, .mov)'
      });
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    setActiveVideoUrl(blobUrl);

    await updateTrack(currentTrack.id, {
      videoUrl: blobUrl,
      videoFileName: file.name
    });

    setToastNotification({
      title: 'Video Visual Mapped',
      subtitle: `Attached ${file.name} to ${currentTrack.title}`
    });
  }, [currentTrack, updateTrack, setToastNotification]);

  // Remove attached video
  const handleRemoveVideo = async () => {
    if (!currentTrack) return;
    setActiveVideoUrl(null);
    await updateTrack(currentTrack.id, {
      videoUrl: undefined,
      videoFileName: undefined
    });
    setToastNotification({
      title: 'Video Detached',
      subtitle: 'Reverted to procedural audio-reactive surface'
    });
  };

  // Select sample preset video
  const handleSelectSampleVideo = async (sample: { name: string; url: string }) => {
    if (!currentTrack) return;
    setActiveVideoUrl(sample.url);
    await updateTrack(currentTrack.id, {
      videoUrl: sample.url,
      videoFileName: sample.name
    });
    setToastNotification({
      title: 'Preset Visual Loaded',
      subtitle: `Loaded "${sample.name}" into 3D Room`
    });
  };

  return (
    <div 
      className={`relative w-full h-full ${themeConfig.primaryBg || 'bg-[#0b0d11]'} flex flex-col overflow-hidden select-none transition-colors duration-300`}
    >
      {/* 3D Music Room Header Bar */}
      <div className="shrink-0 px-6 py-4 border-b border-white/10 bg-[#0d0f14]/90 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
          <h1 className="text-xs font-bold tracking-[0.35em] text-white uppercase select-none font-mono">
            MUSIC ROOM
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="px-4 py-1.5 rounded-xl border border-white/10 bg-[#141720]/80 hover:bg-[#1c212e] hover:border-cyan-400/50 text-[10px] font-bold tracking-wider text-neutral-300 hover:text-white transition-all shadow-md cursor-pointer active:scale-95"
          >
            ＋ IMPORT VIDEO
          </button>
        </div>
      </div>

      {/* Hidden input for local MP4/WebM/MOV video selection */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/*"
        className="hidden"
        onChange={handleVideoFileChange}
      />

      {/* Main 3D Spatial Layout: Left Slabs | Center 3D Video Room | Right Info & Controls */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden relative" ref={centerContainerRef}>
        
        {/* =========================================================================
            LEFT COLUMN: PHYSICAL 3D TRACK SLABS PLAYLIST
            ========================================================================= */}
        {!isTheaterMode && (
          <div className="lg:col-span-3 h-full border-r border-white/10 bg-[#0d0f14]/90 backdrop-blur-xl flex flex-col z-10 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Disc className={`w-4 h-4 ${themeConfig.accentIconColor || 'text-cyan-400'} animate-spin`} style={{ animationDuration: isPlaying ? '3s' : '15s' }} />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Track Slabs
              </span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
              {filteredMedia.length} Slabs
            </span>
          </div>

          {/* Slabs List */}
          <div 
            className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar"
            style={{ perspective: '800px' }}
          >
            {filteredMedia.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <Music className="w-8 h-8 text-neutral-500 mb-3 animate-pulse" />
                <h3 className="text-[11px] font-bold text-neutral-300 uppercase tracking-widest font-mono">Player is Empty</h3>
                <p className="text-[10px] text-neutral-400 mt-2 max-w-[180px] leading-relaxed">
                  Drag & drop audio or video files here to start playing.
                </p>
                <button
                  type="button"
                  onClick={() => setIsImportOpen(true)}
                  className="mt-4 px-3.5 py-1.5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 text-cyan-300 text-[10px] font-bold hover:bg-cyan-400/10 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                >
                  ＋ Load files
                </button>
              </div>
            ) : (
              filteredMedia.map((track, idx) => {
                const isSelected = currentTrack?.id === track.id;
                
                // Audio vibration calculation: when track is currently playing, bass physically vibrates the slab
                const vibrateY = (isSelected && isPlaying) ? Math.sin(Date.now() * 0.05 + idx) * bassEnergy * 3 : 0;
                const slabScale = (isSelected && isPlaying) ? 1 + bassEnergy * 0.025 : 1;

                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    style={{
                      transform: `translateY(${vibrateY}px) scale(${slabScale}) rotateX(${isSelected ? -2 : 0}deg)`,
                      transition: isSelected ? 'none' : 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    }}
                    className={`relative p-3 rounded-2xl cursor-pointer transition-all duration-200 border group shadow-lg ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/50 to-purple-950/40 border-cyan-400/80 shadow-[0_8px_24px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400/50'
                        : 'bg-[#14171f] hover:bg-[#1b202c] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Cover Art Platter */}
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 shadow-md">
                        <img
                          src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop'}
                          alt={track.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          {isSelected && isPlaying ? (
                            <div className="flex items-center gap-0.5">
                              <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" />
                              <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce delay-75" />
                              <span className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce delay-150" />
                            </div>
                          ) : (
                            <Play className="w-3.5 h-3.5 text-white opacity-80 fill-white" />
                          )}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                            {track.title}
                          </h4>
                          {track.videoUrl && (
                            <span title="Video attached" className="inline-flex">
                              <Film className="w-3 h-3 text-cyan-400 shrink-0" />
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                          {track.artist}
                        </p>

                        <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500 font-mono">
                          {track.bpm && (
                            <span className="px-1.5 py-0.2 rounded bg-white/5 text-neutral-300">
                              {track.bpm} BPM
                            </span>
                          )}
                          {track.key && (
                            <span className="text-amber-400 font-semibold">
                              {track.key}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Physical tactile indicator */}
                      {isSelected && (
                        <div className="shrink-0 flex flex-col items-center justify-center">
                          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-cyan-400 animate-ping' : 'bg-neutral-500'}`} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Slabs Footer Status */}
          <div className="p-3 border-t border-white/5 bg-black/40 text-[10px] text-neutral-400 flex items-center justify-between">
            <span>Bass Vibration: {Math.round(bassEnergy * 100)}%</span>
            <span className="text-cyan-400 font-mono">PHYSICAL SLABS</span>
          </div>
        </div>
        )}

        {/* =========================================================================
            CENTER: 3D DEFORMABLE VIDEO SURFACE POWERED BY THREE.JS
            ========================================================================= */}
        <div 
          className={`${isTheaterMode ? 'lg:col-span-12' : 'lg:col-span-6'} h-full relative flex flex-col bg-[#08090d] overflow-hidden`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
        >
          {/* Three.js 3D WebGL Room Viewport */}
          <div className="flex-1 relative w-full overflow-hidden">
            <ThreeMusicRoom
              videoUrl={activeVideoUrl}
              trackId={currentTrack?.id || null}
              onImportVideoClick={() => videoInputRef.current?.click()}
              isDraggingOver={isDraggingOver}
              isTheaterMode={isTheaterMode}
              onToggleTheater={() => setIsTheaterMode(prev => !prev)}
              onToggleFullscreen={toggleNativeFullscreen}
              isMatrixOpen={isMatrixOpen}
              onToggleMatrix={() => setIsMatrixOpen(prev => !prev)}
            />

            {/* Standard Desktop Media Player Empty Slate Overlay */}
            {!currentTrack && (
              <div className="absolute inset-0 bg-[#07080a]/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-20">
                <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                  <Upload className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <h2 className="text-sm font-bold text-white tracking-widest uppercase font-mono">
                  No Tracks Loaded
                </h2>
                <p className="text-xs text-neutral-400 mt-2 max-w-sm leading-relaxed">
                  Use this exactly like your standard desktop player. Drag & drop any audio or video files here to start.
                </p>
                <div className="flex items-center gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = 'audio/*,video/*';
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files) importFiles(files);
                      };
                      input.click();
                    }}
                    className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-[11px] font-bold tracking-wider uppercase shadow-[0_4px_12px_rgba(34,211,238,0.3)] transition-all active:scale-95 cursor-pointer"
                  >
                    📂 Select Files
                  </button>
                  
                  <button
                    type="button"
                    onClick={async () => {
                      await initDatabase();
                      window.location.reload();
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-300 text-[11px] font-bold tracking-wide transition-all active:scale-95 cursor-pointer"
                  >
                    ⚡ Demo Library
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Centered Integrated Transport & Sound HUD */}
          <div className="shrink-0 p-5 border-t border-white/10 bg-[#0d0f14]/95 backdrop-blur-xl flex flex-col space-y-4 z-10 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
            
            {/* ✦  ·  ✦  ·  ✦  Animated Beat Spacer */}
            <div className="flex items-center justify-center gap-6 text-xs font-mono select-none h-6">
              <span className="text-cyan-400 font-bold transition-all duration-75 block" style={{ transform: `scale(${1 + bassEnergy * 0.4})`, opacity: 0.35 + bassEnergy * 0.65, filter: `drop-shadow(0 0 ${bassEnergy * 8}px #22d3ee)` }}>✦</span>
              <span className="text-neutral-700 font-black transition-all duration-100 block" style={{ opacity: 0.2 + highEnergy * 0.5 }}>·</span>
              <span className="text-cyan-400 font-bold transition-all duration-75 block" style={{ transform: `scale(${1 + bassEnergy * 0.55})`, opacity: 0.35 + bassEnergy * 0.65, filter: `drop-shadow(0 0 ${bassEnergy * 10}px #22d3ee)` }}>✦</span>
              <span className="text-neutral-700 font-black transition-all duration-100 block" style={{ opacity: 0.2 + highEnergy * 0.5 }}>·</span>
              <span className="text-cyan-400 font-bold transition-all duration-75 block" style={{ transform: `scale(${1 + bassEnergy * 0.4})`, opacity: 0.35 + bassEnergy * 0.65, filter: `drop-shadow(0 0 ${bassEnergy * 8}px #22d3ee)` }}>✦</span>
            </div>

            {/* Waveform Seeker */}
            <WaveformSeeker
              peaks={currentTrack?.waveformPeaks}
              duration={duration}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onTogglePlayPause={togglePlayPause}
              onSeek={seek}
            />

            {/* Micro Controls Row */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
              
              {/* Left Column: Title HUD */}
              <div className="flex items-center gap-2 text-neutral-400 min-w-0 max-w-[180px]">
                <span className="text-white font-bold truncate tracking-tight text-[11px]">
                  {currentTrack?.title || 'No Track Selected'}
                </span>
                <span className="text-neutral-600 font-black">•</span>
                <span className="text-neutral-400 truncate text-[10px]">
                  {currentTrack?.artist || 'Idle'}
                </span>
              </div>

              {/* Center Column: Playback Controls ◀  ◉  ▶ */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={prevTrack}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 active:scale-90 transition-all cursor-pointer border border-transparent hover:border-white/10"
                >
                  <SkipBack className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="w-8 h-8 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center font-black shadow-[0_0_12px_rgba(34,211,238,0.45)] cursor-pointer transition-all active:scale-90"
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-black stroke-black" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-black stroke-black ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => nextTrack()}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 active:scale-90 transition-all cursor-pointer border border-transparent hover:border-white/10"
                >
                  <SkipForward className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              {/* Right Column: Volume Adjustment */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-white/10 rounded-full accent-cyan-400 hover:bg-white/20 cursor-pointer transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: TRACK INFO, VIDEO IMPORT, AUDIO REACTION STATS
            ========================================================================= */}
        {!isTheaterMode && (
          <div className="lg:col-span-3 h-full border-l border-white/10 bg-[#0d0f14]/95 backdrop-blur-xl flex flex-col z-10 overflow-y-auto custom-scrollbar p-5 space-y-5">
          
          {/* Track Header Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-[10px] font-bold text-cyan-300 font-mono tracking-wider uppercase">
                Now Reacting
              </span>
              {currentTrack?.bpm && (
                <span className="text-xs font-mono font-bold text-neutral-300 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
                  {currentTrack.bpm} BPM
                </span>
              )}
            </div>

            <h2 className="text-lg font-extrabold text-white tracking-tight truncate">
              {currentTrack ? currentTrack.title : 'No Track Selected'}
            </h2>
            <p className="text-xs font-medium text-neutral-400 truncate">
              {currentTrack ? currentTrack.artist : 'Pick a physical slab on the left'}
            </p>
          </div>

          {/* IMPORT VIDEO BUTTON SECTION */}
          <div className="p-4 rounded-2xl bg-[#141720] border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                <Film className="w-3.5 h-3.5 text-cyan-400" />
                <span>3D Video Mapping</span>
              </div>
              {activeVideoUrl && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Mapped</span>
                </span>
              )}
            </div>

            {/* Main + IMPORT VIDEO Button */}
            <button
              id="btn-import-track-video"
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>＋ IMPORT VIDEO (.mp4, .mov)</span>
            </button>

            {/* Currently attached video status / detachment */}
            {currentTrack?.videoFileName ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 text-[11px]">
                <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                  <Film className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-neutral-200 truncate font-mono">{currentTrack.videoFileName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  title="Remove video attachment"
                  className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-[10px] text-neutral-500 text-center leading-relaxed">
                Import any local video file. It will automatically loop and map onto the 3D surface, reacting to bass, kicks, and mid frequencies in real time.
              </p>
            )}

            {/* Quick Preset Videos if user doesn't have an MP4 right now */}
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Quick Video Presets:
              </span>
              <div className="grid grid-cols-1 gap-1">
                {SAMPLE_PRESET_VIDEOS.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => handleSelectSampleVideo(sample)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-neutral-300 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>{sample.name}</span>
                    <span className="text-[9px] font-mono text-cyan-400">Apply</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audio Physics Reactive Matrix Card (Replaced with a sleek pop-out trigger) */}
          <button
            type="button"
            onClick={() => setIsMatrixOpen(prev => !prev)}
            className={`w-full p-4 rounded-2xl border transition-all duration-200 text-left space-y-3 shadow-lg active:scale-95 group relative overflow-hidden flex flex-col justify-between cursor-pointer ${
              isMatrixOpen
                ? 'bg-rose-500/10 border-rose-400 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                : 'bg-[#141720]/80 border-white/10 text-neutral-300 hover:border-cyan-400/50 hover:bg-[#181c27]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-white">
                <Activity className={`w-4 h-4 ${isMatrixOpen ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
                <span>BEAT MATRIX ANALYZER</span>
              </div>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                isMatrixOpen ? 'bg-rose-500/20 text-rose-300 animate-pulse' : 'bg-white/5 text-neutral-400'
              }`}>
                {isMatrixOpen ? 'ACTIVE' : 'LAUNCH'}
              </span>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed group-hover:text-neutral-200 transition-colors">
              Opens the real-time Fourier analysis radar containing multi-band gauges, spectrum, and physical impulse grid.
            </p>
          </button>

          {/* Track Details Card */}
          {currentTrack && (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Key:</span>
                <span className="font-bold text-cyan-300 font-mono">{currentTrack.key || 'C Minor'}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Genre:</span>
                <span className="text-white">{currentTrack.genre || 'Hip Hop'}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Type:</span>
                <span className="text-white">{currentTrack.trackType || currentTrack.typeTag || 'Beat'}</span>
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Beat Matrix Floating Popout */}
      {isMatrixOpen && (
        <BeatMatrixPopout onClose={() => setIsMatrixOpen(false)} />
      )}
    </div>
  );
};
