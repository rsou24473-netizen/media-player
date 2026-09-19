import React, { useState, useRef, useEffect } from 'react';
import { useMedia } from '../context/MediaContext';
import { TrackKind, TrackVisibility } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  ChevronDown,
  Upload,
  UserPlus,
  Tag,
  Paperclip,
  Trash2,
  Lock,
  Globe,
  Layers,
  Check,
  FolderPlus
} from 'lucide-react';

const MUSICAL_KEYS = [
  'C Major', 'C Minor',
  'C# / Db Major', 'C# / Db Minor',
  'D Major', 'D Minor',
  'D# / Eb Major', 'D# / Eb Minor',
  'E Major', 'E Minor',
  'F Major', 'F Minor',
  'F# / Gb Major', 'F# / Gb Minor',
  'G Major', 'G Minor',
  'G# / Ab Major', 'G# / Ab Minor',
  'A Major', 'A Minor',
  'A# / Bb Major', 'A# / Bb Minor',
  'B Major', 'B Minor'
];

const TRACK_KINDS: TrackKind[] = [
  'No type',
  'Beat',
  'Song',
  'Loop'
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop'
];

export const EditTrackModal: React.FC = () => {
  const {
    isEditTrackOpen,
    setIsEditTrackOpen,
    editingTrack,
    updateTrack,
    addCustomTagGlobal,
    packs,
    toggleTrackInPack,
    createPackAndAddTrack
  } = useMedia();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [trackType, setTrackType] = useState<TrackKind>('No type');
  const [key, setKey] = useState('C Major');
  const [bpm, setBpm] = useState<number>(118);
  const [visibility, setVisibility] = useState<TrackVisibility>('private');
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [assignedPackIds, setAssignedPackIds] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);

  // Dropdowns & Expansions
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isKeyDropdownOpen, setIsKeyDropdownOpen] = useState(false);
  const [isAttachedOpen, setIsAttachedOpen] = useState(false);
  const [isCustomCoverOpen, setIsCustomCoverOpen] = useState(false);

  // Add inputs
  const [isAddingCollab, setIsAddingCollab] = useState(false);
  const [newCollab, setNewCollab] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isCreatingPack, setIsCreatingPack] = useState(false);
  const [newPackTitle, setNewPackTitle] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const attachInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingTrack) {
      setTitle(editingTrack.title || '');
      setArtist(editingTrack.artist || '');
      setCoverUrl(editingTrack.coverUrl || PRESET_COVERS[0]);
      setTrackType((editingTrack.trackType as TrackKind) || 'No type');
      setKey(editingTrack.key || 'C Major');
      setBpm(editingTrack.bpm || 118);
      setVisibility(editingTrack.visibility || 'private');
      setCollaborators(editingTrack.collaborators || []);
      setCustomTags(editingTrack.customTags || []);
      const initialPacks = editingTrack.packIds || (editingTrack.packId ? [editingTrack.packId] : []);
      setAssignedPackIds(initialPacks);
      setAttachedFiles([]);
    }
  }, [editingTrack]);

  const handleSave = () => {
    if (!editingTrack) return;
    updateTrack(editingTrack.id, {
      title,
      artist,
      coverUrl,
      trackType,
      typeTag: trackType === 'No type' ? 'Track' : trackType,
      key,
      bpm,
      visibility,
      collaborators,
      customTags,
      packIds: assignedPackIds,
      packId: assignedPackIds[0] || undefined
    });
    customTags.forEach(t => addCustomTagGlobal(t));
    setIsEditTrackOpen(false);
  };

  const handleHalfBpm = () => {
    setBpm(prev => Math.max(20, Math.round(prev / 2)));
  };

  const handleDoubleBpm = () => {
    setBpm(prev => Math.min(999, Math.round(prev * 2)));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverUrl(url);
    }
  };

  const handleAttachFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newItems = Array.from(files).map(f => ({
        name: f.name,
        size: `${(f.size / 1024).toFixed(1)} KB`
      }));
      setAttachedFiles(prev => [...prev, ...newItems]);
    }
  };

  const addCollaborator = () => {
    const clean = newCollab.trim();
    if (clean && !collaborators.includes(clean)) {
      setCollaborators(prev => [...prev, clean]);
      setNewCollab('');
      setIsAddingCollab(false);
    }
  };

  const removeCollaborator = (name: string) => {
    setCollaborators(prev => prev.filter(c => c !== name));
  };

  const addTag = () => {
    const clean = newTag.trim().replace(/^#/, '');
    if (clean && !customTags.includes(clean)) {
      setCustomTags(prev => [...prev, clean]);
      addCustomTagGlobal(clean);
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const removeTag = (tag: string) => {
    setCustomTags(prev => prev.filter(t => t !== tag));
  };

  const togglePlaylistAssignment = async (packId: string) => {
    if (!editingTrack) return;
    if (assignedPackIds.includes(packId)) {
      setAssignedPackIds(prev => prev.filter(id => id !== packId));
    } else {
      setAssignedPackIds(prev => [...prev, packId]);
    }
    await toggleTrackInPack(editingTrack.id, packId);
  };

  const handleCreateNewPlaylist = async () => {
    const clean = newPackTitle.trim();
    if (!clean || !editingTrack) return;
    const newId = await createPackAndAddTrack(clean, artist || 'PRODUCER', editingTrack.id);
    setAssignedPackIds(prev => Array.from(new Set([...prev, newId])));
    setNewPackTitle('');
    setIsCreatingPack(false);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isEditTrackOpen && editingTrack && (
        <div
          id="edit-track-modal-overlay"
          className="fixed inset-0 z-50 flex justify-end select-none"
          onClick={() => {
            setIsTypeDropdownOpen(false);
            setIsKeyDropdownOpen(false);
          }}
        >
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsEditTrackOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Right-Side Slide-Over Panel with Cartoonish Box Trims */}
          <motion.aside
            id="edit-track-drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[500px] h-full bg-[#101013] border-l-2 border-white/20 text-white flex flex-col z-10 shadow-[-8px_0px_0px_0px_rgba(0,0,0,0.5)] overflow-y-auto"
          >
            {/* Header Top Bar */}
            <div className="p-6 pb-4 flex items-center justify-between sticky top-0 bg-[#101013]/95 backdrop-blur-md z-20 border-b-2 border-white/10">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black uppercase tracking-wide text-white">Edit track</h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="close-edit-track-btn"
                  onClick={() => setIsEditTrackOpen(false)}
                  className="w-9 h-9 rounded-xl border-2 border-white/20 bg-[#1e1e24] hover:bg-[#282832] flex items-center justify-center text-neutral-300 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  id="save-edit-track-btn"
                  onClick={handleSave}
                  className="px-6 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-black uppercase text-xs transition-all border-2 border-white shadow-[3px_3px_0px_0px_#ffffff] active:translate-x-[1px] active:translate-y-[1px]"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 space-y-4 flex-1">
              {/* 1. Track Metadata Card in Cartoonish Rectangle */}
              <div className="p-4 rounded-2xl bg-[#19191e] border-2 border-white/15 space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 mr-3">
                    {/* Square Cover Box with metallic sheen & cartoon frame */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-tr from-neutral-800 to-neutral-600 border-2 border-white/30 shrink-0 group shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
                      <img
                        src={coverUrl || PRESET_COVERS[0]}
                        alt="Track Cover"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                      >
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Title & Artist */}
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Track title"
                        className="w-full bg-transparent font-black text-lg text-white focus:outline-none border-b-2 border-transparent focus:border-white pb-0.5 truncate tracking-tight"
                      />
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5 truncate font-medium">
                        <input
                          type="text"
                          value={artist}
                          onChange={(e) => setArtist(e.target.value)}
                          placeholder="Artist name"
                          className="bg-transparent text-neutral-300 font-bold focus:text-white focus:outline-none border-b border-transparent focus:border-white pb-0.5 max-w-[140px]"
                        />
                        <span>•</span>
                        <span className="text-neutral-400 font-mono text-[11px] font-bold">{formatDuration(editingTrack.duration || 169)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Attach / Replace Cartoonish Rectangles */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsCustomCoverOpen(!isCustomCoverOpen)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#272730] hover:bg-[#32323e] border-2 border-white/20 text-xs font-bold text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]"
                    >
                      Attach
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-[#272730] hover:bg-[#32323e] border-2 border-white/20 text-xs font-bold text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]"
                    >
                      Replace
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Preset cover picker */}
                <AnimatePresence>
                  {isCustomCoverOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pt-2 border-t-2 border-white/10"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Preset Artwork / Sheen:</p>
                      <div className="flex items-center gap-2.5">
                        {PRESET_COVERS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setCoverUrl(preset);
                              setIsCustomCoverOpen(false);
                            }}
                            className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${
                              coverUrl === preset ? 'border-white scale-105 shadow-[2px_2px_0px_0px_#ffffff]' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={preset} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sub-row: Track type, Key, BPM + multipliers in Cartoonish Rectangles */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* Track Type Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTypeDropdownOpen(!isTypeDropdownOpen);
                        setIsKeyDropdownOpen(false);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#272730] hover:bg-[#32323e] border-2 border-white/20 text-xs font-bold text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]"
                    >
                      <span>{trackType}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                    </button>

                    <AnimatePresence>
                      {isTypeDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full mt-1.5 w-44 bg-[#202026] border-2 border-white rounded-xl p-1.5 shadow-[4px_4px_0px_0px_#000000] z-30 space-y-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {TRACK_KINDS.map((kind) => (
                            <button
                              key={kind}
                              type="button"
                              onClick={() => {
                                setTrackType(kind);
                                setIsTypeDropdownOpen(false);
                              }}
                              className={`w-full flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition-colors ${
                                trackType === kind
                                  ? 'bg-white text-black font-black'
                                  : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {kind}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Musical Key Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsKeyDropdownOpen(!isKeyDropdownOpen);
                        setIsTypeDropdownOpen(false);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#272730] hover:bg-[#32323e] border-2 border-white/20 text-xs font-bold text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]"
                    >
                      <span>{key}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                    </button>

                    <AnimatePresence>
                      {isKeyDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full mt-1.5 w-48 max-h-52 overflow-y-auto bg-[#202026] border-2 border-white rounded-xl p-1.5 shadow-[4px_4px_0px_0px_#000000] z-30 space-y-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {MUSICAL_KEYS.map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => {
                                setKey(k);
                                setIsKeyDropdownOpen(false);
                              }}
                              className={`w-full flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition-colors ${
                                key === k
                                  ? 'bg-white text-black font-black'
                                  : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {k}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* BPM with ÷2 and ×2 cartoonish buttons */}
                  <div className="flex items-center bg-[#272730] border-2 border-white/20 rounded-xl px-2.5 py-1 text-xs text-white font-bold gap-1.5 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]">
                    <input
                      type="number"
                      value={bpm}
                      onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                      className="w-10 bg-transparent text-white font-mono text-xs focus:outline-none text-center font-bold"
                    />
                    <span className="text-neutral-400 text-[11px] font-bold">BPM</span>
                    <div className="flex items-center gap-1 ml-1 border-l-2 border-white/15 pl-1.5">
                      <button
                        type="button"
                        onClick={handleHalfBpm}
                        title="Divide tempo by 2 (Half-time)"
                        className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/25 text-[10px] text-white font-black"
                      >
                        ÷2
                      </button>
                      <button
                        type="button"
                        onClick={handleDoubleBpm}
                        title="Multiply tempo by 2 (Double-time)"
                        className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/25 text-[10px] text-white font-black"
                      >
                        ×2
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. PLAYLISTS & PACKS SECTION (New: Add track to playlists) */}
              <div className="p-4 rounded-2xl bg-[#19191e] border-2 border-white/15 space-y-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-rose-400" />
                    <h4 className="text-sm font-black uppercase tracking-wider text-white">Add to Playlist / Pack</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreatingPack(true)}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#272730] hover:bg-[#32323e] border-2 border-white/20 text-xs font-black uppercase text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>New Playlist</span>
                  </button>
                </div>

                {/* Playlists / Packs List */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {packs.map((pack) => {
                    const isAssigned = assignedPackIds.includes(pack.id);
                    return (
                      <button
                        key={pack.id}
                        type="button"
                        onClick={() => togglePlaylistAssignment(pack.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border-2 transition-all ${
                          isAssigned
                            ? 'bg-rose-500/20 border-rose-400 text-white font-bold shadow-[2px_2px_0px_0px_#f43f5e]'
                            : 'bg-[#23232a] border-white/10 hover:border-white/30 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white border border-white/20 shrink-0"
                            style={{ backgroundColor: pack.coverColor || '#8b5cf6' }}
                          >
                            {pack.title.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold leading-tight">{pack.title}</div>
                            <div className="text-[10px] text-neutral-400 font-mono">{pack.producer} • {pack.genre || 'Collection'}</div>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isAssigned
                            ? 'bg-rose-500 border-rose-300 text-white shadow-[1px_1px_0px_0px_#ffffff]'
                            : 'border-white/30 bg-transparent'
                        }`}>
                          {isAssigned && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Inline Create Playlist input */}
                <AnimatePresence>
                  {isCreatingPack && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2 pt-1 border-t border-white/10"
                    >
                      <input
                        type="text"
                        value={newPackTitle}
                        onChange={(e) => setNewPackTitle(e.target.value)}
                        placeholder="Playlist name (e.g. Summer Anthems, Drill Beats)..."
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateNewPlaylist()}
                        autoFocus
                        className="flex-1 bg-black/50 border-2 border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                      />
                      <button
                        type="button"
                        onClick={handleCreateNewPlaylist}
                        className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-black uppercase border-2 border-white shadow-[2px_2px_0px_0px_#ffffff] hover:bg-neutral-200"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreatingPack(false)}
                        className="p-1.5 text-neutral-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Attached Files Collapsible Card */}
              <div className="rounded-2xl bg-[#19191e] border-2 border-white/15 overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
                <button
                  type="button"
                  onClick={() => setIsAttachedOpen(!isAttachedOpen)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm font-black uppercase tracking-wide text-white">
                    Attached files <span className="text-neutral-400 font-normal">• {attachedFiles.length}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isAttachedOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isAttachedOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 pt-0 space-y-3"
                    >
                      <div className="border-2 border-dashed border-white/15 rounded-xl p-3 text-center space-y-2">
                        <Paperclip className="w-5 h-5 text-neutral-400 mx-auto" />
                        <p className="text-xs text-neutral-400 font-medium">Attach stems, MIDI, lyric sheets, or PDF project notes</p>
                        <button
                          type="button"
                          onClick={() => attachInputRef.current?.click()}
                          className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border-2 border-white/20 text-xs text-white font-bold"
                        >
                          Choose Files
                        </button>
                        <input
                          ref={attachInputRef}
                          type="file"
                          multiple
                          onChange={handleAttachFiles}
                          className="hidden"
                        />
                      </div>

                      {attachedFiles.length > 0 && (
                        <div className="space-y-1.5">
                          {attachedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/10 text-xs text-neutral-300">
                              <span className="truncate max-w-[200px] font-bold">{file.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-neutral-400 font-mono">{file.size}</span>
                                <button
                                  type="button"
                                  onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                                  className="text-neutral-500 hover:text-rose-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. Visibility Card */}
              <div className="p-4 rounded-2xl bg-[#19191e] border-2 border-white/15 flex items-center justify-between shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black uppercase tracking-wide text-white">Visibility</h4>
                  <p className="text-xs text-neutral-400">
                    {visibility === 'private' ? 'Only you can have access' : 'Visible on public artist profile'}
                  </p>
                </div>

                {/* Cartoonish Toggle */}
                <div className="flex items-center bg-[#121215] p-1 rounded-xl border-2 border-white/15">
                  <button
                    type="button"
                    onClick={() => setVisibility('private')}
                    className={`flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-black uppercase transition-all ${
                      visibility === 'private'
                        ? 'bg-white text-black border-2 border-white shadow-[2px_2px_0px_0px_#ffffff]'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>Private</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility('profile')}
                    className={`flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-black uppercase transition-all ${
                      visibility === 'profile'
                        ? 'bg-white text-black border-2 border-white shadow-[2px_2px_0px_0px_#ffffff]'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    <span>Profile</span>
                  </button>
                </div>
              </div>

              {/* 5. Collaborators Card */}
              <div className="p-4 rounded-2xl bg-[#19191e] border-2 border-white/15 space-y-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-wide text-white">Collaborators</h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingCollab(true)}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#272730] hover:bg-[#32323e] border-2 border-white/20 text-xs font-black uppercase text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Active Collaborators */}
                {collaborators.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {collaborators.map((collab) => (
                      <div
                        key={collab}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#272730] text-xs font-bold text-white border-2 border-white/20 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{collab}</span>
                        <button
                          type="button"
                          onClick={() => removeCollaborator(collab)}
                          className="text-neutral-400 hover:text-white ml-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500">No collaborators added yet</p>
                )}

                {/* Inline add collaborator input */}
                <AnimatePresence>
                  {isAddingCollab && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2 pt-1 border-t border-white/10"
                    >
                      <input
                        type="text"
                        value={newCollab}
                        onChange={(e) => setNewCollab(e.target.value)}
                        placeholder="Collaborator name / handle"
                        onKeyDown={(e) => e.key === 'Enter' && addCollaborator()}
                        autoFocus
                        className="flex-1 bg-black/50 border-2 border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                      />
                      <button
                        type="button"
                        onClick={addCollaborator}
                        className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-black uppercase border-2 border-white shadow-[2px_2px_0px_0px_#ffffff] hover:bg-neutral-200"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingCollab(false)}
                        className="p-1.5 text-neutral-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 6. Tags Card */}
              <div className="p-4 rounded-2xl bg-[#19191e] border-2 border-white/15 space-y-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-wide text-white">Tags</h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingTag(true)}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#272730] hover:bg-[#32323e] border-2 border-white/20 text-xs font-black uppercase text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Active Custom Tags */}
                {customTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {customTags.map((t) => (
                      <div
                        key={t}
                        className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#272730] text-xs font-bold text-white border-2 border-white/20 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]"
                      >
                        <Tag className="w-3.5 h-3.5 text-purple-400" />
                        <span>#{t}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(t)}
                          className="text-neutral-400 hover:text-white ml-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500">No tags added yet</p>
                )}

                {/* Inline add tag input */}
                <AnimatePresence>
                  {isAddingTag && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2 pt-1 border-t border-white/10"
                    >
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Tag name (e.g. 808, drill, melody)"
                        onKeyDown={(e) => e.key === 'Enter' && addTag()}
                        autoFocus
                        className="flex-1 bg-black/50 border-2 border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-black uppercase border-2 border-white shadow-[2px_2px_0px_0px_#ffffff] hover:bg-neutral-200"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingTag(false)}
                        className="p-1.5 text-neutral-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
