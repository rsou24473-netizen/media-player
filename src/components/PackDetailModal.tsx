import React, { useState, useRef, useMemo } from 'react';
import { useMedia } from '../context/MediaContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Pencil, 
  Play, 
  Pause, 
  Plus, 
  Search, 
  X,
  Check,
  Music,
  Trash2,
  CheckSquare,
  Square,
  ListPlus,
  Shuffle,
  SkipForward,
  SkipBack,
  Volume2,
  Radio
} from 'lucide-react';

// Deterministic audio waveform generator for every unique track
const generateUniqueWaveform = (trackId: string, title: string, barCount = 44): number[] => {
  let hash = 0;
  const str = (trackId || '') + (title || 'track');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const bars: number[] = [];
  for (let i = 0; i < barCount; i++) {
    const seed = Math.sin(hash + (i + 1) * 1.91) * 10000;
    const rawVal = Math.abs(seed - Math.floor(seed));
    const normX = i / (barCount - 1);
    const envelope = Math.sin(normX * Math.PI);
    const heightPercent = Math.max(14, Math.min(100, Math.floor((rawVal * 0.72 + 0.28) * envelope * 100)));
    bars.push(heightPercent);
  }
  return bars;
};

const formatTime = (secs: number) => {
  if (isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const PackDetailModal: React.FC = () => {
  const { 
    packs, 
    mediaList, 
    activePackDetailId, 
    setActivePackDetailId, 
    playTrack, 
    currentTrack, 
    isPlaying, 
    togglePlayPause,
    currentTime,
    duration,
    seek,
    isShuffled,
    toggleShuffle,
    nextTrack,
    prevTrack,
    toggleTrackInPack, 
    deletePack, 
    updatePack,
    updateTrack,
    importFiles,
    batchAddTracksToPack,
    setToastNotification 
  } = useMedia();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingArtistTrackId, setEditingArtistTrackId] = useState<string | null>(null);
  const [editingArtistValue, setEditingArtistValue] = useState('');

  // Add tracks modal/drawer state
  const [isAddPickerOpen, setIsAddPickerOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<Set<string>>(new Set());

  // Cover & Background media state
  const [coverFrameUrl, setCoverFrameUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!activePackDetailId) return null;

  const pack = packs.find(p => p.id === activePackDetailId);
  if (!pack) return null;

  // Find all tracks assigned to this pack
  const packTracks = mediaList.filter(m => {
    const pids = m.packIds || (m.packId ? [m.packId] : []);
    return pids.includes(pack.id) || m.packId === pack.id;
  });

  // Filtered tracks list
  const displayedTracks = packTracks.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q);
  });

  // Check if current playing track belongs to this pack
  const isPlayingThisPack = isPlaying && packTracks.some(t => t.id === currentTrack?.id);
  const activePackTrack = packTracks.find(t => t.id === currentTrack?.id) || packTracks[0] || null;

  // Dynamic font sizing for pack title based on text length
  const getTitleFontSizeClass = (text: string) => {
    const len = text.length;
    if (len > 32) return 'text-[20px] md:text-[26px]';
    if (len > 22) return 'text-[24px] md:text-[32px]';
    if (len > 15) return 'text-[28px] md:text-[38px]';
    if (len > 10) return 'text-[32px] md:text-[42px]';
    return 'text-[36px] md:text-[46px]';
  };

  // Grab a frame from video file if user uploads a video
  const grabVideoFrame = (url: string, cb: (dataUrl: string) => void) => {
    const v = document.createElement('video');
    v.src = url;
    v.muted = true;
    v.playsInline = true;
    v.addEventListener('loadeddata', () => {
      v.currentTime = Math.min(0.3, (v.duration || 1) * 0.1);
    });
    v.addEventListener('seeked', () => {
      const c = document.createElement('canvas');
      c.width = v.videoWidth || 640;
      c.height = v.videoHeight || 360;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.drawImage(v, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.85));
      }
    });
  };

  // Handle cover media change (Photo or Video)
  const handleCoverMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const url = URL.createObjectURL(f);
    const isVideo = f.type.startsWith('video/') || /\.(mp4|webm|mkv|mov|avi)$/i.test(f.name);

    setCoverFrameUrl(null);
    if (isVideo) {
      updatePack(pack.id, {
        videoUrl: url,
        coverUrl: url,
        isVideoCover: true
      });
      setToastNotification({
        title: 'Video Cover Updated',
        subtitle: `Applied ${f.name} as pack video artwork`
      });
    } else {
      updatePack(pack.id, {
        coverUrl: url,
        videoUrl: undefined,
        isVideoCover: false
      });
      setToastNotification({
        title: 'Cover Image Updated',
        subtitle: `Applied ${f.name} as pack photo artwork`
      });
    }
    e.target.value = '';
  };

  // Add tracks via local audio/video file selection
  const handleAddTrackFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await importFiles(e.target.files, pack.id);
      setToastNotification({
        title: 'Track(s) Added',
        subtitle: `Imported ${e.target.files.length} file(s) into ${pack.title}`
      });
    }
  };

  // Handle Artist Name Edit
  const handleSaveArtist = async (trackId: string) => {
    if (editingArtistValue.trim()) {
      await updateTrack(trackId, { artist: editingArtistValue.trim() });
      setToastNotification({
        title: 'Artist Updated',
        subtitle: `Changed artist to "${editingArtistValue.trim()}"`
      });
    }
    setEditingArtistTrackId(null);
  };

  // Handle Main Play Toggle
  const handlePlayMain = () => {
    if (packTracks.length === 0) return;
    if (isPlayingThisPack) {
      togglePlayPause();
    } else {
      playTrack(packTracks[0], packTracks);
    }
  };

  const libraryTracksFiltered = mediaList.filter(t => {
    if (!librarySearch.trim()) return true;
    const q = librarySearch.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q);
  });

  const toggleLibrarySelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLibraryIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllLibraryTracks = () => {
    if (selectedLibraryIds.size === libraryTracksFiltered.length) {
      setSelectedLibraryIds(new Set());
    } else {
      setSelectedLibraryIds(new Set(libraryTracksFiltered.map(t => t.id)));
    }
  };

  const addSelectedToPack = async () => {
    if (selectedLibraryIds.size === 0) return;
    const ids = Array.from(selectedLibraryIds);
    await batchAddTracksToPack(ids, pack.id);
    setSelectedLibraryIds(new Set());
    setToastNotification({
      title: 'Tracks Added',
      subtitle: `Added ${ids.length} track(s) to ${pack.title}`
    });
  };

  const isVideoCover = pack.isVideoCover || (pack.coverUrl && /\.(mp4|webm|mkv|mov|avi)$/i.test(pack.coverUrl)) || !!pack.videoUrl;
  const coverSrc = coverFrameUrl || pack.coverUrl;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="fixed inset-0 z-[200] overflow-hidden bg-[#0b0b0d] text-[#f2f3f5] select-none font-sans"
      >
        
        {/* ---------- Blurred Backdrop (Photo or Looping Video) ---------- */}
        <div id="bg-wrap" className="fixed inset-0 z-0 overflow-hidden bg-[#0b0b0d]">
          {isVideoCover ? (
            <video
              key={`bg-${pack.videoUrl || pack.coverUrl}`}
              src={pack.videoUrl || pack.coverUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-[-6%] w-[112%] h-[112%] object-cover filter blur-[70px] saturate-[1.25] brightness-60 scale-[1.06] transition-opacity duration-500"
            />
          ) : (
            <img
              src={coverSrc || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'}
              alt=""
              className="absolute inset-[-6%] w-[112%] h-[112%] object-cover filter blur-[70px] saturate-[1.25] brightness-60 scale-[1.06] transition-opacity duration-500"
            />
          )}
          <div 
            id="bg-shade" 
            className="absolute inset-0" 
            style={{
              background: `
                radial-gradient(120% 90% at 30% 100%, rgba(0,0,0,.15), rgba(0,0,0,.65) 70%),
                linear-gradient(100deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.55) 60%, rgba(0,0,0,.72) 100%)
              `
            }}
          />
        </div>

        {/* ---------- PROMINENT BACK ARROW BUTTON (Fully visible, zero clipping) ---------- */}
        <button
          id="back"
          onClick={() => setActivePackDetailId(null)}
          title="Back to library"
          className="fixed top-5 left-5 md:top-8 md:left-8 z-[210] w-12 h-12 rounded-full bg-[rgba(15,15,18,0.85)] border border-[rgba(255,255,255,0.25)] flex items-center justify-center cursor-pointer text-[#f2f3f5] backdrop-blur-xl hover:bg-[rgba(35,35,42,0.95)] hover:scale-105 active:scale-95 transition-all shadow-2xl group"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5] text-white transition-transform group-hover:-translate-x-0.5" />
        </button>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleCoverMediaChange}
          className="hidden"
        />
        <input
          ref={audioFileInputRef}
          type="file"
          multiple
          accept="audio/*,video/*"
          onChange={handleAddTrackFiles}
          className="hidden"
        />

        {/* ---------- Main Stage Layout ---------- */}
        <div id="stage" className="relative z-10 h-full flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Column - Centered Artwork */}
          <div id="left" className="flex-1 relative p-6 md:p-[34px] flex flex-col items-center justify-center pt-20 md:pt-0">
            
            {/* Centered Square Cover Artwork */}
            <motion.div 
              id="cover-wrap"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              onClick={() => fileInputRef.current?.click()}
              className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-[min(70vw,340px)] md:w-[min(36vw,420px)] aspect-square rounded-[10px] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.55)] bg-[#1c1c1f] relative group cursor-pointer my-auto md:my-0"
            >
              {!coverSrc && (
                <div 
                  id="cover-placeholder" 
                  className="absolute inset-0 filter blur-[1px]"
                  style={{
                    background: 'conic-gradient(from 200deg at 50% 45%, #2a2a2d, #3c3c40, #1a1a1c, #4a4a4e, #232326, #38383c, #17171a, #2a2a2d)'
                  }}
                />
              )}

              {coverSrc && (
                isVideoCover ? (
                  <video
                    key={pack.videoUrl || pack.coverUrl}
                    src={pack.videoUrl || pack.coverUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover block"
                  />
                ) : (
                  <img 
                    id="cover-media" 
                    src={coverSrc} 
                    alt="cover" 
                    className="absolute inset-0 w-full h-full object-cover block"
                  />
                )
              )}

              <div id="cover-vignette" className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_20%,rgba(255,255,255,0.06),rgba(0,0,0,0.35)_75%)] pointer-events-none" />

              {/* Play Button Overlay (Center Circle) */}
              <div 
                id="cover-play"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayMain();
                }}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30 pointer-events-auto"
              >
                <div className="w-16 h-16 rounded-full bg-white text-black shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer">
                  {isPlayingThisPack ? (
                    <Pause className="w-7 h-7 fill-current text-black" />
                  ) : (
                    <Play className="w-7 h-7 fill-current text-black ml-1" />
                  )}
                </div>
              </div>

              {/* Change Cover Photo / Video Badge Button (Plus Sign) */}
              <button 
                type="button"
                id="edit-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                title="Change artwork photo or video"
                className="absolute top-3 right-3 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-white text-xs font-bold border border-white/25 backdrop-blur-md flex items-center gap-1.5 shadow-xl transition-all z-20 hover:scale-105 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>Change Media</span>
              </button>
            </motion.div>
          </div>

          {/* Right Side Panel */}
          <motion.div 
            id="panel"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="w-full md:w-[min(46vw,720px)] md:min-w-[420px] h-full bg-[rgba(10,10,12,0.85)] backdrop-blur-[26px] backdrop-saturate-[1.1] border-t md:border-t-0 md:border-l border-[rgba(255,255,255,0.09)] p-8 md:p-[52px_56px_40px] flex flex-col overflow-y-auto"
          >
            {/* Pack Title Input with Smart Resizing */}
            <input
              id="pack-title"
              value={pack.title}
              onChange={(e) => updatePack(pack.id, { title: e.target.value })}
              placeholder="Untitled Pack"
              spellCheck={false}
              className={`${getTitleFontSizeClass(pack.title)} font-[900] tracking-[-0.035em] leading-[1.08] bg-transparent border-none text-[#f2f3f5] outline-none w-full p-0 font-sans placeholder-[#6b6d74] transition-all duration-200`}
            />

            {/* Track Count */}
            <div id="track-count" className="mt-3 text-[#9a9ca3] text-[14.5px] font-medium font-sans">
              {packTracks.length} {packTracks.length === 1 ? 'track' : 'tracks'}
            </div>

            {/* Pack Description Input */}
            <input
              id="pack-desc"
              value={pack.description || ''}
              onChange={(e) => updatePack(pack.id, { description: e.target.value })}
              placeholder="Add description"
              className="mt-1.5 bg-transparent border-none outline-none text-[#6b6d74] focus:text-[#f2f3f5] text-[14px] w-full font-sans placeholder-[#6b6d74]"
            />

            {/* Actions Bar (Play, ADD, Delete) */}
            <div id="actions" className="flex items-center gap-[22px] mt-[26px] flex-wrap">
              {/* Play Main Button */}
              <button
                id="play-main"
                onClick={handlePlayMain}
                disabled={packTracks.length === 0}
                className="w-[48px] h-[48px] rounded-full bg-white hover:scale-105 transition-transform border-none flex items-center justify-center cursor-pointer shrink-0 disabled:opacity-40 shadow-xl"
                title={isPlayingThisPack ? 'Pause' : 'Play Pack'}
              >
                {isPlayingThisPack ? (
                  <Pause className="w-5 h-5 fill-current text-black" />
                ) : (
                  <svg className="w-[18px] h-[18px] fill-[#0b0b0d] ml-[2px]" viewBox="0 0 24 24">
                    <path d="M7 5v14l12-7z"/>
                  </svg>
                )}
              </button>

              {/* ADD Button (Triggers local file browser directly) */}
              <button
                id="add-track"
                onClick={() => audioFileInputRef.current?.click()}
                title="Upload audio/video files directly from your computer"
                className="action flex items-center gap-[7px] bg-white text-black px-3.5 py-2 rounded-xl text-[13px] font-bold tracking-[0.04em] cursor-pointer hover:bg-neutral-200 transition-all shadow font-sans"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ ADD FILES</span>
              </button>

              {/* Toggle Library Drawer Button */}
              <button
                type="button"
                onClick={() => setIsAddPickerOpen(!isAddPickerOpen)}
                title="Pick existing tracks from library"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer border ${
                  isAddPickerOpen ? 'bg-white/20 text-white border-white/30' : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <ListPlus className="w-4 h-4" />
                <span>From Library</span>
              </button>

              {/* Delete Pack (...) */}
              <button
                id="more"
                onClick={async () => {
                  if (confirm(`Delete pack "${pack.title}"? Your media files will remain in your library.`)) {
                    await deletePack(pack.id);
                    setActivePackDetailId(null);
                  }
                }}
                className="ml-auto bg-none border-none text-[#9a9ca3] hover:text-rose-400 cursor-pointer text-[22px] tracking-[2px]"
                title="Delete pack"
              >
                &#8943;
              </button>
            </div>

            {/* ADD TRACKS PICKER DRAWER */}
            {isAddPickerOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 rounded-xl bg-[rgba(20,20,25,0.95)] border border-[rgba(255,255,255,0.12)] space-y-3 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Add Tracks to {pack.title}</span>
                  <button onClick={() => setIsAddPickerOpen(false)} className="text-neutral-400 hover:text-white p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => audioFileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 rounded-lg bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Audio Files</span>
                  </button>

                  <button
                    onClick={selectAllLibraryTracks}
                    className="py-2 px-3 rounded-lg bg-white/10 text-white font-semibold text-xs hover:bg-white/15 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
                    title="Select or deselect all items"
                  >
                    {selectedLibraryIds.size === libraryTracksFiltered.length && libraryTracksFiltered.length > 0 ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                    <span>{selectedLibraryIds.size === libraryTracksFiltered.length && libraryTracksFiltered.length > 0 ? 'Deselect All' : 'Select All'}</span>
                  </button>
                </div>

                {/* Batch Add Button if items are selected */}
                {selectedLibraryIds.size > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={addSelectedToPack}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <ListPlus className="w-4 h-4" />
                    <span>Add Selected ({selectedLibraryIds.size}) Tracks to Pack</span>
                  </motion.button>
                )}

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-neutral-400 font-mono uppercase">Or pick multiple from library:</span>
                  <input
                    type="text"
                    placeholder="Search library..."
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {libraryTracksFiltered.map(t => {
                      const pids = t.packIds || (t.packId ? [t.packId] : []);
                      const isInPack = pids.includes(pack.id) || t.packId === pack.id;
                      const isChecked = selectedLibraryIds.has(t.id);

                      return (
                        <div
                          key={t.id}
                          onClick={() => toggleTrackInPack(t.id, pack.id)}
                          className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer text-xs transition-colors ${
                            isInPack
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                              : isChecked
                              ? 'bg-blue-950/40 border-blue-500/50 text-blue-200'
                              : 'bg-white/5 border-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                            <button
                              type="button"
                              onClick={(e) => toggleLibrarySelect(t.id, e)}
                              className="p-0.5 text-neutral-400 hover:text-white shrink-0"
                              title="Toggle selection for batch action"
                            >
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-blue-400" />
                              ) : (
                                <Square className="w-4 h-4 text-neutral-500 hover:text-neutral-300" />
                              )}
                            </button>
                            <span className="font-semibold truncate">{t.title} - {t.artist}</span>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5">
                            {isInPack ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                                <Check className="w-3 h-3" />
                                <span>In Pack</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-300 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded">
                                <Plus className="w-3 h-3" />
                                <span>Add</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Active Audio Waveform & Control Banner */}
            {packTracks.length > 0 && activePackTrack && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col gap-3"
              >
                {/* Header Info */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Radio className={`w-4 h-4 shrink-0 ${isPlayingThisPack && activePackTrack.id === currentTrack?.id ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
                    <span className="font-bold text-white truncate">{activePackTrack.title}</span>
                    <span className="text-neutral-400 truncate">• {activePackTrack.artist || 'Unknown Artist'}</span>
                  </div>
                  <div className="text-neutral-400 font-mono text-[11px] shrink-0 font-semibold">
                    {formatTime(activePackTrack.id === currentTrack?.id ? currentTime : 0)} / {formatTime(activePackTrack.id === currentTrack?.id ? duration : activePackTrack.duration || 180)}
                  </div>
                </div>

                {/* Interactive Unique Waveform */}
                <div 
                  onClick={(e) => {
                    if (activePackTrack.id !== currentTrack?.id) {
                      playTrack(activePackTrack, packTracks);
                      return;
                    }
                    if (duration <= 0) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                    seek(ratio * duration);
                  }}
                  className="relative w-full h-12 bg-black/40 hover:bg-black/60 border border-white/10 rounded-xl px-2.5 flex items-center gap-[2.5px] cursor-pointer group select-none shadow-inner transition-colors"
                  title="Click anywhere on waveform to seek playback position"
                >
                  {generateUniqueWaveform(activePackTrack.id, activePackTrack.title, 50).map((height, idx) => {
                    const barPercent = (idx / 50) * 100;
                    const currentProgressPercent = (activePackTrack.id === currentTrack?.id && duration > 0) ? (currentTime / duration) * 100 : 0;
                    const isPassed = barPercent <= currentProgressPercent;

                    return (
                      <div key={idx} className="flex-1 h-full flex items-center justify-center">
                        <div
                          style={{ height: `${height}%` }}
                          className={`w-full rounded-full transition-all duration-150 ${
                            isPassed
                              ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                              : 'bg-white/20 group-hover:bg-white/30'
                          } ${isPlayingThisPack && isPassed && activePackTrack.id === currentTrack?.id ? 'animate-pulse' : ''}`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Controls Row (Shuffle, Prev, Play/Pause, Next) */}
                <div className="flex items-center justify-between pt-1">
                  {/* Shuffle Button */}
                  <button
                    type="button"
                    onClick={toggleShuffle}
                    title={isShuffled ? 'Shuffle ON (Click to disable)' : 'Shuffle OFF (Click to enable)'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      isShuffled 
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.3)]' 
                        : 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>{isShuffled ? 'Shuffled' : 'Shuffle'}</span>
                  </button>

                  {/* Main Playback Buttons */}
                  <div className="flex items-center gap-3">
                    {/* Previous Track */}
                    <button
                      type="button"
                      onClick={prevTrack}
                      className="p-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Previous Track"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    {/* Play / Pause Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        if (activePackTrack.id === currentTrack?.id) {
                          togglePlayPause();
                        } else {
                          playTrack(activePackTrack, packTracks);
                        }
                      }}
                      className="w-9 h-9 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-transform flex items-center justify-center cursor-pointer shadow-lg"
                      title={isPlaying && activePackTrack.id === currentTrack?.id ? 'Pause Track' : 'Play Track'}
                    >
                      {isPlaying && activePackTrack.id === currentTrack?.id ? (
                        <Pause className="w-4 h-4 fill-current text-black" />
                      ) : (
                        <Play className="w-4 h-4 fill-current text-black ml-0.5" />
                      )}
                    </button>

                    {/* Next Track */}
                    <button
                      type="button"
                      onClick={() => nextTrack(true)}
                      className="p-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Next Track"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                    {(activePackTrack.type || 'AUDIO').toUpperCase()}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Search Bar */}
            <div id="listbar" className="flex items-center gap-[12px] mt-[24px] pb-[16px] border-b border-[rgba(255,255,255,0.09)]">
              <svg id="search-icon" className="w-[16px] h-[16px] stroke-[#9a9ca3] fill-none shrink-0" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="11" cy="11" r="7"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                id="search"
                placeholder="Search this pack"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[#f2f3f5] text-[14px] placeholder-[#6b6d74]"
              />
            </div>

            {/* Track List - ENLARGED TRACK ITEMS */}
            <ul id="tracks" className="list-none mt-[10px] space-y-2 flex-1">
              {displayedTracks.map((t, i) => {
                const isCurrent = currentTrack?.id === t.id;
                const numStr = (i + 1).toString().padStart(2, '0');
                const isDuplicateInPack = packTracks.filter(pt => pt.title.toLowerCase().trim() === t.title.toLowerCase().trim()).length > 1;

                return (
                  <li
                    key={t.id}
                    onClick={() => playTrack(t, packTracks)}
                    className={`track flex items-center gap-[18px] p-[14px_12px] rounded-[10px] cursor-pointer transition-all duration-120 hover:bg-[rgba(255,255,255,0.06)] ${
                      isCurrent ? 'bg-[rgba(255,255,255,0.12)] border border-white/10 shadow-lg' : 'bg-white/[0.02]'
                    }`}
                  >
                    <div className="num w-[26px] text-right text-[#888a91] text-[14px] tabular-nums font-mono font-bold">
                      {numStr}
                    </div>

                    <div className="thumb w-[52px] h-[52px] rounded-[8px] overflow-hidden shrink-0 bg-[#242427] relative border border-white/10 shadow-md">
                      {t.coverUrl ? (
                        <img src={t.coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#242427] flex items-center justify-center text-[12px] text-neutral-400 font-bold">
                          ♫
                        </div>
                      )}
                    </div>

                    <div className="meta flex-1 min-w-0">
                      <div className="name text-[16px] font-[700] whitespace-nowrap overflow-hidden text-ellipsis text-[#f2f3f5] tracking-tight flex items-center gap-2">
                        <span className="truncate">{t.title}</span>
                        {isDuplicateInPack && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md shrink-0">
                            Duplicated
                          </span>
                        )}
                      </div>

                      {/* Editable Artist Name */}
                      {editingArtistTrackId === t.id ? (
                        <div 
                          className="flex items-center gap-2 mt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editingArtistValue}
                            onChange={(e) => setEditingArtistValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveArtist(t.id);
                              if (e.key === 'Escape') setEditingArtistTrackId(null);
                            }}
                            autoFocus
                            className="text-[13px] bg-white/10 border border-white/20 rounded px-2 py-0.5 text-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveArtist(t.id)}
                            className="px-2.5 py-0.5 bg-white text-black text-[11px] font-bold rounded"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingArtistTrackId(t.id);
                            setEditingArtistValue(t.artist);
                          }}
                          className="by text-[13.5px] text-[#8f929a] hover:text-[#f2f3f5] mt-[3px] whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer transition-colors font-medium"
                          title="Click to edit artist name"
                        >
                          {t.artist || 'Unknown Artist'}
                        </div>
                      )}
                    </div>

                    {/* Track Unique Mini Waveform */}
                    <div className="hidden sm:flex items-center gap-[2px] h-6 w-20 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      {generateUniqueWaveform(t.id, t.title, 18).map((h, bIdx) => {
                        const isThisTrackCurrent = currentTrack?.id === t.id;
                        const barPct = (bIdx / 18) * 100;
                        const progressPct = (isThisTrackCurrent && duration > 0) ? (currentTime / duration) * 100 : 0;
                        const isPassed = isThisTrackCurrent && barPct <= progressPct;

                        return (
                          <div key={bIdx} className="flex-1 h-full flex items-center justify-center">
                            <div
                              style={{ height: `${h}%` }}
                              className={`w-full rounded-full transition-all ${
                                isThisTrackCurrent
                                  ? isPassed ? 'bg-amber-400' : 'bg-amber-400/30'
                                  : 'bg-white/20'
                              } ${isThisTrackCurrent && isPlaying ? 'animate-pulse' : ''}`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="kind text-[11px] text-[#8f929a] border border-[rgba(255,255,255,0.12)] rounded-[6px] p-[3px_8px] tracking-[0.06em] shrink-0 font-mono font-bold uppercase bg-white/5">
                      {(t.type || 'AUDIO').toUpperCase()}
                    </div>
                  </li>
                );
              })}
            </ul>

            {displayedTracks.length === 0 && (
              <div id="empty-hint" className="text-[#6b6d74] text-[13px] mt-[60px] text-center">
                Add tracks — each can have its own photo or video thumbnail too.
              </div>
            )}
          </motion.div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
