import React, { useState } from 'react';
import { useMedia } from '../context/MediaContext';
import { MediaItem, TrackKind } from '../types';
import { TempoKeyFilterPopover } from './TempoKeyFilterPopover';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Plus,
  Search,
  ArrowUpDown,
  Maximize2,
  Edit2,
  Trash2,
  Heart,
  Tag,
  Check,
  Layers,
  ListPlus,
  X,
  PlusCircle,
  Video,
  PictureInPicture,
  Minimize2
} from 'lucide-react';

const GENRE_OPTIONS = [
  'All Genres',
  'Hip Hop',
  'Trap',
  'R&B',
  'Electronic',
  'Pop',
  'Rock',
  'Ambient',
  'Lo-Fi',
  'Drill'
];

const MOOD_OPTIONS = [
  'All Moods',
  'Chill',
  'Dark',
  'Energetic',
  'Sad',
  'Uplifting',
  'Aggressive',
  'Atmospheric'
];

const INSTRUMENT_OPTIONS = [
  'All Instruments',
  'Piano',
  'Guitar',
  '808 & Bass',
  'Synth',
  'Drums',
  'Vocals',
  'Strings'
];

const TYPE_OPTIONS: TrackKind[] = [
  'No type',
  'Beat',
  'Song',
  'Loop'
];

export const OfftopView: React.FC = () => {
  const {
    mediaList,
    filteredMedia,
    packs,
    currentTrack,
    isPlaying,
    currentTime,
    playTrack,
    togglePlayPause,
    toggleFavorite,
    filters,
    setFilters,
    setIsCreatePackOpen,
    openEditTrack,
    toggleTrackInPack,
    batchDeleteMedia,
    batchAddTagToTracks,
    batchAddTracksToPack,
    allUserTags,
    videoRef,
    triggerPiP,
    triggerFullscreen,
    themeConfig,
    openPackDetail
  } = useMedia();

  // Dropdown states for the chip boxes
  const [activeDropdown, setActiveDropdown] = useState<'type' | 'genre' | 'mood' | 'instrument' | 'key' | null>(null);
  
  const [selectedGenre, setSelectedGenre] = useState<string>('All Genres');
  const [selectedMood, setSelectedMood] = useState<string>('All Moods');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('All Instruments');

  const [isTracksSearchOpen, setIsTracksSearchOpen] = useState(false);
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  
  // Track context playlist menu
  const [playlistMenuTrackId, setPlaylistMenuTrackId] = useState<string | null>(null);

  // Multi-Selection State
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(new Set());
  
  // Batch action popovers
  const [isBatchTagOpen, setIsBatchTagOpen] = useState(false);
  const [isBatchPackOpen, setIsBatchPackOpen] = useState(false);
  const [batchTagInput, setBatchTagInput] = useState('');

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const tracksToDisplay = filteredMedia.filter(t => {
    if (trackSearchQuery.trim()) {
      const matchSearch = t.title.toLowerCase().includes(trackSearchQuery.toLowerCase()) ||
                          t.artist.toLowerCase().includes(trackSearchQuery.toLowerCase());
      if (!matchSearch) return false;
    }
    if (selectedGenre !== 'All Genres' && t.genre !== selectedGenre && !t.customTags?.includes(selectedGenre.toLowerCase())) {
      return false;
    }
    if (selectedMood !== 'All Moods' && !t.customTags?.includes(selectedMood.toLowerCase())) {
      return false;
    }
    if (selectedInstrument !== 'All Instruments' && !t.customTags?.includes(selectedInstrument.toLowerCase())) {
      return false;
    }
    return true;
  });

  const toggleSelectTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTrackIds(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  const selectAllTracks = () => {
    if (selectedTrackIds.size === tracksToDisplay.length) {
      setSelectedTrackIds(new Set());
    } else {
      setSelectedTrackIds(new Set(tracksToDisplay.map(t => t.id)));
    }
  };

  const clearSelection = () => {
    setSelectedTrackIds(new Set());
    setIsBatchTagOpen(false);
    setIsBatchPackOpen(false);
  };

  const handleBatchDelete = async () => {
    if (selectedTrackIds.size === 0) return;
    const ids = Array.from(selectedTrackIds);
    await batchDeleteMedia(ids);
    clearSelection();
  };

  const handleBatchAddTag = async (tag: string) => {
    if (!tag.trim() || selectedTrackIds.size === 0) return;
    await batchAddTagToTracks(Array.from(selectedTrackIds), tag.trim());
    setBatchTagInput('');
    setIsBatchTagOpen(false);
  };

  const handleBatchAddToPack = async (packId: string) => {
    if (selectedTrackIds.size === 0) return;
    await batchAddTracksToPack(Array.from(selectedTrackIds), packId);
    setIsBatchPackOpen(false);
  };

  const isVideoPlaying = currentTrack?.type === 'video';

  return (
    <main
      id="tessera-main-layout"
      className="flex-1 flex flex-col h-full bg-[#0f1114] text-[#eceef1] p-[22px_28px_90px] overflow-hidden select-none font-sans transition-colors duration-300 relative"
      onClick={() => {
        setActiveDropdown(null);
        setPlaylistMenuTrackId(null);
        setIsBatchTagOpen(false);
        setIsBatchPackOpen(false);
      }}
    >
      {/* 1. Header: Library with small superscript count */}
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-[44px] leading-none font-medium tracking-[-0.025em] text-[#eceef1] flex items-baseline">
          Library
          <sup className="font-mono text-[12px] font-medium text-[#8f969e] ml-1 relative top-[0.7em] tracking-normal">
            {mediaList.length.toLocaleString()}
          </sup>
        </h1>

        {/* Video stream indicator if video is playing */}
        {isVideoPlaying && (
          <div className="flex items-center gap-2 bg-[#1a1d21] border border-white/10 rounded-full px-3 py-1 text-xs text-cyan-400">
            <Video className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-semibold text-white">Video Playing</span>
            <button
              onClick={triggerPiP}
              title="Picture in Picture"
              className="ml-1 p-1 hover:text-white text-neutral-400"
            >
              <PictureInPicture className="w-3 h-3" />
            </button>
            <button
              onClick={triggerFullscreen}
              title="Fullscreen"
              className="p-1 hover:text-white text-neutral-400"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </header>

      {/* 2. Bar: Chips with notched cut corners + Search */}
      <div className="flex items-center gap-2 flex-wrap mb-4 relative z-20">
        <div className="chips">
          {/* Type Chip (--c: #ee4f9f) */}
          <div className="relative">
            <button
              type="button"
              id="tessera-chip-type"
              style={{ ['--c' as string]: '#ee4f9f' }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === 'type' ? null : 'type');
              }}
              className={`chip ${filters.selectedType ? 'on' : ''}`}
            >
              <i className="dot" />
              <span>{filters.selectedType && filters.selectedType !== 'No type' ? filters.selectedType : 'Type'}</span>
            </button>

            <AnimatePresence>
              {activeDropdown === 'type' && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full mt-1.5 w-44 bg-[#18191e]/98 backdrop-blur-xl rounded-xl p-1.5 shadow-2xl z-50 space-y-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setFilters(p => ({ ...p, selectedType: null }));
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                      !filters.selectedType ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <span>All Types</span>
                    {!filters.selectedType && <Check className="w-3.5 h-3.5" />}
                  </button>
                  {TYPE_OPTIONS.filter(t => t !== 'No type').map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setFilters(p => ({ ...p, selectedType: t }));
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                        filters.selectedType === t ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{t}</span>
                      {filters.selectedType === t && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Genre Chip (--c: #f59a2f) */}
          <div className="relative">
            <button
              type="button"
              id="tessera-chip-genre"
              style={{ ['--c' as string]: '#f59a2f' }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === 'genre' ? null : 'genre');
              }}
              className={`chip ${selectedGenre !== 'All Genres' ? 'on' : ''}`}
            >
              <i className="dot" />
              <span>{selectedGenre !== 'All Genres' ? selectedGenre : 'Genre'}</span>
            </button>

            <AnimatePresence>
              {activeDropdown === 'genre' && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full mt-1.5 w-44 bg-[#18191e]/98 backdrop-blur-xl rounded-xl p-1.5 shadow-2xl z-50 space-y-0.5 max-h-56 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {GENRE_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setSelectedGenre(g);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                        selectedGenre === g ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{g}</span>
                      {selectedGenre === g && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mood Chip (--c: #4f86f0) */}
          <div className="relative">
            <button
              type="button"
              id="tessera-chip-mood"
              style={{ ['--c' as string]: '#4f86f0' }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === 'mood' ? null : 'mood');
              }}
              className={`chip ${selectedMood !== 'All Moods' ? 'on' : ''}`}
            >
              <i className="dot" />
              <span>{selectedMood !== 'All Moods' ? selectedMood : 'Mood'}</span>
            </button>

            <AnimatePresence>
              {activeDropdown === 'mood' && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full mt-1.5 w-44 bg-[#18191e]/98 backdrop-blur-xl rounded-xl p-1.5 shadow-2xl z-50 space-y-0.5 max-h-56 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setSelectedMood(m);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                        selectedMood === m ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{m}</span>
                      {selectedMood === m && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Instrument Chip (--c: #9d76e6) */}
          <div className="relative">
            <button
              type="button"
              id="tessera-chip-instrument"
              style={{ ['--c' as string]: '#9d76e6' }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === 'instrument' ? null : 'instrument');
              }}
              className={`chip ${selectedInstrument !== 'All Instruments' ? 'on' : ''}`}
            >
              <i className="dot" />
              <span>{selectedInstrument !== 'All Instruments' ? selectedInstrument : 'Instrument'}</span>
            </button>

            <AnimatePresence>
              {activeDropdown === 'instrument' && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full mt-1.5 w-44 bg-[#18191e]/98 backdrop-blur-xl rounded-xl p-1.5 shadow-2xl z-50 space-y-0.5 max-h-56 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {INSTRUMENT_OPTIONS.map((ins) => (
                    <button
                      key={ins}
                      type="button"
                      onClick={() => {
                        setSelectedInstrument(ins);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                        selectedInstrument === ins ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{ins}</span>
                      {selectedInstrument === ins && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Key & Tempo Chip (--c: #25bfd0) - COMBINED TOGETHER */}
          <div className="relative">
            <button
              type="button"
              id="tessera-chip-key"
              style={{ ['--c' as string]: '#25bfd0' }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === 'key' ? null : 'key');
              }}
              className={`chip ${filters.selectedKey || filters.minBpm || filters.maxBpm ? 'on' : ''}`}
            >
              <i className="dot" />
              <span>
                {filters.selectedKey && (filters.minBpm || filters.maxBpm)
                  ? `${filters.selectedKey} • ${filters.minBpm || 60}-${filters.maxBpm || 200} BPM`
                  : filters.selectedKey || (filters.minBpm || filters.maxBpm ? `${filters.minBpm || 60}-${filters.maxBpm || 200} BPM` : 'Key & Tempo')}
              </span>
            </button>

            <TempoKeyFilterPopover
              isOpen={activeDropdown === 'key'}
              onClose={() => setActiveDropdown(null)}
            />
          </div>
        </div>

        {/* Clear Filters indicator */}
        {(selectedGenre !== 'All Genres' || selectedMood !== 'All Moods' || selectedInstrument !== 'All Instruments' || filters.selectedType || filters.selectedKey || filters.minBpm || filters.maxBpm) && (
          <button
            onClick={() => {
              setSelectedGenre('All Genres');
              setSelectedMood('All Moods');
              setSelectedInstrument('All Instruments');
              setFilters(p => ({ ...p, selectedType: null, selectedKey: null, minBpm: null, maxBpm: null }));
            }}
            className="text-[12px] text-[#8f969e] hover:text-white underline font-medium ml-2"
          >
            Reset
          </button>
        )}
      </div>

      {/* 3. The Two-Panel Layout (Tracks left, Packs right) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[minmax(300px,4fr)_minmax(0,7fr)] gap-4">
        {/* Left Panel: Tracks List */}
        <section className="flex flex-col min-h-0 bg-[#1a1d21] rounded-[10px] overflow-hidden border border-white/5">
          {/* Panel Head */}
          <div className="h-[52px] px-4 flex items-center justify-between shrink-0 border-b border-white/5">
            <h3 className="text-xs font-bold text-neutral-200">
              Tracks · {tracksToDisplay.length}
            </h3>

            {/* Right Tools */}
            <div className="flex items-center gap-2 text-neutral-400">
              <button
                onClick={() => setIsTracksSearchOpen(!isTracksSearchOpen)}
                className="p-1.5 hover:text-white transition-colors"
                title="Search tracks"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                  }));
                }}
                className="p-1.5 hover:text-white transition-colors"
                title="Sort tracks"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={selectAllTracks}
                className="p-1.5 hover:text-white transition-colors"
                title="Select all"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Inline Track Search */}
          {isTracksSearchOpen && (
            <div className="p-3 border-b border-white/5">
              <input
                type="text"
                placeholder="Search tracks..."
                value={trackSearchQuery}
                onChange={(e) => setTrackSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-[#121417] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#8f969e] focus:outline-none focus:border-white/30 font-sans"
              />
            </div>
          )}

          {/* Panel Body: Track List Items */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
            {tracksToDisplay.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const isCurrentPlaying = isCurrent && isPlaying;
              const isPlaylistMenuOpen = playlistMenuTrackId === track.id;
              const trackPacks = track.packIds || (track.packId ? [track.packId] : []);
              const isSelected = selectedTrackIds.has(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, filteredMedia)}
                  className={`group relative p-2.5 rounded-xl cursor-pointer transition-all duration-200 ease-out flex items-center justify-between ${
                    isSelected
                      ? 'bg-white/15 translate-x-3.5 text-white shadow-md'
                      : isCurrent
                      ? 'bg-white/10 translate-x-2 text-white shadow-sm'
                      : 'hover:bg-white/[0.08] hover:translate-x-3 sm:hover:translate-x-3.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
                  }`}
                >
                  {/* Left glowing animated accent marker on hover */}
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-200 ${
                      isCurrent
                        ? `h-3/4 ${themeConfig.accentColor || 'bg-cyan-400'} shadow-[0_0_8px_rgba(34,211,238,0.6)]`
                        : `h-0 group-hover:h-3/5 ${themeConfig.accentColor || 'bg-cyan-400'}`
                    }`}
                  />

                  {/* Left: Checkbox + Track Info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pl-1">
                    <div
                      onClick={(e) => toggleSelectTrack(track.id, e)}
                      className={`shrink-0 transition-opacity duration-150 ${
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-white text-black font-bold'
                            : 'bg-black/50 border border-white/30 hover:border-white text-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Artwork thumbnail with hover scale */}
                    <div className="w-8 h-8 rounded-md overflow-hidden bg-black/40 border border-white/10 shrink-0 relative transition-transform duration-200 group-hover:scale-105 group-hover:shadow-md">
                      <img
                        src={track.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'}
                        alt={track.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {track.type === 'video' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Video className="w-3 h-3 text-cyan-400" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-semibold leading-tight truncate transition-colors duration-150 ${isCurrent ? 'text-white font-bold' : 'text-[#eceef1] group-hover:text-white'}`}>
                        {track.title}
                      </div>
                      <div className="text-[11px] text-[#8f969e] font-normal truncate mt-0.5 font-mono">
                        {isCurrent ? formatDuration(currentTime) : '0:00'} / {formatDuration(track.duration)} · {track.artist}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150 shrink-0 ml-2 group-hover:translate-x-0 translate-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrent) {
                          togglePlayPause();
                        } else {
                          playTrack(track, filteredMedia);
                        }
                      }}
                      className="p-1 text-[#8f969e] hover:text-white transition-colors"
                      title={isCurrentPlaying ? 'Pause' : 'Play'}
                    >
                      {isCurrentPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaylistMenuTrackId(isPlaylistMenuOpen ? null : track.id);
                      }}
                      className="p-1 text-[#8f969e] hover:text-white transition-colors"
                      title="Add to pack"
                    >
                      <ListPlus className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditTrack(track);
                      }}
                      className="p-1 text-[#8f969e] hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id);
                      }}
                      className={`p-1 transition-colors ${track.isFavorite ? 'text-rose-500' : 'text-[#8f969e] hover:text-white'}`}
                      title="Favorite"
                    >
                      <Heart className={`w-3.5 h-3.5 ${track.isFavorite ? 'fill-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* Playlist Dropdown */}
                  <AnimatePresence>
                    {isPlaylistMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-full mt-1 w-48 bg-[#18181c]/98 backdrop-blur-xl border border-white/20 rounded-xl p-2 shadow-2xl z-50 space-y-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="text-[10px] font-bold text-[#8f969e] px-2 pb-1 border-b border-white/10 uppercase font-mono">
                          Add to Pack
                        </div>
                        <div className="max-h-36 overflow-y-auto space-y-0.5">
                          {packs.map((p) => {
                            const inPack = trackPacks.includes(p.id);
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => toggleTrackInPack(track.id, p.id)}
                                className={`w-full flex items-center justify-between px-2 py-1 rounded text-left text-xs transition-colors ${
                                  inPack ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/5'
                                }`}
                              >
                                <span className="truncate">{p.title}</span>
                                {inPack && <Check className="w-3 h-3 text-white" />}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {tracksToDisplay.length === 0 && (
              <div className="py-8 text-center text-xs text-[#8f969e]">
                No tracks found.
              </div>
            )}
          </div>
        </section>

        {/* Right Panel: Packs Grid (Notched Cards) & Active Video Canvas */}
        <section className="flex flex-col min-h-0 bg-[#1a1d21] rounded-[10px] overflow-hidden border border-white/5">
          {/* Panel Head */}
          <div className="h-[52px] px-4 flex items-center justify-between shrink-0 border-b border-white/5">
            <h3 className="text-xs font-bold text-neutral-200">
              Packs · {packs.length}
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                  }));
                }}
                className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                title="Sort packs"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Panel Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            {/* Embedded Video Display if currently playing a video file */}
            {isVideoPlaying && currentTrack && (
              <div className="rounded-xl overflow-hidden bg-black border border-white/15 shadow-xl relative aspect-video max-h-56 mx-auto">
                <video
                  ref={videoRef}
                  src={currentTrack.url}
                  autoPlay={isPlaying}
                  playsInline
                  controls={false}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-lg p-1">
                  <button
                    onClick={triggerPiP}
                    className="p-1 hover:text-cyan-400 text-white transition-colors"
                    title="Picture in Picture"
                  >
                    <PictureInPicture className="w-4 h-4" />
                  </button>
                  <button
                    onClick={triggerFullscreen}
                    className="p-1 hover:text-cyan-400 text-white transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Grid of Packs with Notched Corners */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Notched Add Pack Card */}
              <div
                id="create-pack-card-btn"
                onClick={() => setIsCreatePackOpen(true)}
                className="card group flex flex-col cursor-pointer"
              >
                <div className="art pack-art-notched bg-[#23272c] group-hover:bg-[#2c3138] border border-dashed border-white/20 group-hover:border-white/40 flex items-center justify-center transition-all">
                  <Plus className="w-8 h-8 text-[#8f969e] group-hover:text-white transition-colors" />
                </div>
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium text-[#8f969e] group-hover:text-white">New Pack</div>
                </div>
              </div>

              {/* Notched Pack Cards */}
              {packs.map((pack) => {
                const isSelected = filters.selectedPackId === pack.id;
                return (
                  <div
                    key={pack.id}
                    onClick={() => {
                      openPackDetail(pack.id);
                    }}
                    className="card group flex flex-col cursor-pointer transition-all"
                  >
                    {/* Artwork with cut top-right corner via clip-path */}
                    <div className={`art pack-art-notched relative overflow-hidden bg-gradient-to-br from-neutral-800 via-neutral-900 to-black transition-all ${
                      isSelected ? 'ring-2 ring-white/60' : 'group-hover:opacity-90'
                    }`}>
                      {pack.isVideoCover || (pack.coverUrl && /\.(mp4|webm|mkv|mov|avi)$/i.test(pack.coverUrl)) || pack.videoUrl ? (
                        <video
                          src={pack.videoUrl || pack.coverUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <img
                          src={pack.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'}
                          alt={pack.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Pack Title & Subtitle */}
                    <div className="mt-2">
                      <div className="text-xs font-semibold text-[#eceef1] truncate group-hover:text-white">
                        {pack.title}
                      </div>
                      <div className="text-[11px] text-[#8f969e] truncate mt-0.5 font-mono">
                        {pack.producer || 'jackdsadasdsad'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Floating Multi-Select Action Rectangle */}
      <AnimatePresence>
        {selectedTrackIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-[#18191e]/98 backdrop-blur-2xl border border-white/20 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3 text-white"
          >
            <div className="flex items-center gap-2 pr-2 border-r border-white/15">
              <span className="px-2 py-0.5 rounded-lg bg-white text-black text-xs font-bold font-mono">
                {selectedTrackIds.size}
              </span>
              <span className="text-xs font-semibold text-neutral-300">Selected</span>
            </div>

            {/* Edit Tags */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsBatchTagOpen(!isBatchTagOpen);
                  setIsBatchPackOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-neutral-200 hover:text-white transition-colors"
              >
                <Tag className="w-3.5 h-3.5 text-purple-400" />
                <span>Edit Tags</span>
              </button>

              <AnimatePresence>
                {isBatchTagOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute left-0 bottom-full mb-3 w-64 bg-[#18181c]/98 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-2xl z-50 space-y-2.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono">Apply Tag</span>
                      <button onClick={() => setIsBatchTagOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={batchTagInput}
                        onChange={(e) => setBatchTagInput(e.target.value)}
                        placeholder="Tag name..."
                        onKeyDown={(e) => e.key === 'Enter' && handleBatchAddTag(batchTagInput)}
                        autoFocus
                        className="flex-1 bg-black/40 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-white/40"
                      />
                      <button
                        type="button"
                        onClick={() => handleBatchAddTag(batchTagInput)}
                        className="px-2.5 py-1 rounded-lg bg-white text-black text-xs font-bold uppercase"
                      >
                        Add
                      </button>
                    </div>

                    {allUserTags.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] uppercase font-semibold text-neutral-400 block font-mono">Existing Tags</span>
                        <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                          {allUserTags.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handleBatchAddTag(t)}
                              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-medium text-neutral-300"
                            >
                              +{t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Add to Pack */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsBatchPackOpen(!isBatchPackOpen);
                  setIsBatchTagOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-neutral-200 hover:text-white transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                <span>Add to Pack</span>
              </button>

              <AnimatePresence>
                {isBatchPackOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute left-0 bottom-full mb-3 w-56 bg-[#18181c]/98 backdrop-blur-xl border border-white/20 rounded-2xl p-2.5 shadow-2xl z-50 space-y-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono">Choose Pack</span>
                      <button onClick={() => setIsBatchPackOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="max-h-36 overflow-y-auto space-y-1">
                      {packs.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleBatchAddToPack(p.id)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <span className="truncate">{p.title}</span>
                          <PlusCircle className="w-3.5 h-3.5 text-neutral-400" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Trash */}
            <button
              type="button"
              onClick={handleBatchDelete}
              className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 transition-colors"
              title="Delete selected tracks"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Clear */}
            <button
              type="button"
              onClick={clearSelection}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};
