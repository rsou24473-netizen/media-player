import React, { useState, useRef } from 'react';
import { useMedia } from '../context/MediaContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Search, 
  CheckSquare, 
  Square, 
  Upload, 
  Check, 
  X,
  Key,
  Zap,
  ChevronDown
} from 'lucide-react';

const KEY_OPTIONS = [
  'All Keys',
  'C minor',
  'C Major',
  'C# minor',
  'D minor',
  'D Major',
  'Eb Major',
  'E minor',
  'E Major',
  'F minor',
  'F Major',
  'F# minor',
  'G minor',
  'G Major',
  'G# minor',
  'A minor',
  'A Major',
  'Bb Major',
  'B minor'
];

const BPM_OPTIONS = [
  'All BPM',
  'Slow (<90 BPM)',
  'Midtempo (90-125 BPM)',
  'Fast (125-150 BPM)',
  'Upbeat (150+ BPM)'
];

export const CreatePackModal: React.FC = () => {
  const { 
    isCreatePackOpen, 
    setIsCreatePackOpen, 
    mediaList, 
    createPack, 
    openPackDetail,
    importFiles
  } = useMedia();

  const [title, setTitle] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoCover, setIsVideoCover] = useState(false);

  // Picker view state inside dropzone
  const [isPickerActive, setIsPickerActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState('All Keys');
  const [selectedBpmOption, setSelectedBpmOption] = useState('All BPM');
  const [isKeyPopoverOpen, setIsKeyPopoverOpen] = useState(false);
  const [isBpmPopoverOpen, setIsBpmPopoverOpen] = useState(false);

  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(new Set());
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);

  if (!isCreatePackOpen) return null;

  // Handle Cover upload (photo or video)
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (file.type.startsWith('video/')) {
      setVideoUrl(url);
      setCoverUrl(url);
      setIsVideoCover(true);
    } else {
      setCoverUrl(url);
      setVideoUrl(null);
      setIsVideoCover(false);
    }
  };

  // Handle Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleIncomingFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFilesInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleIncomingFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleIncomingFiles = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    setIsPickerActive(true);
  };

  // Toggle track selection
  const toggleTrack = (id: string) => {
    setSelectedTrackIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filtered tracks list
  const filteredTracks = mediaList.filter(track => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = track.title.toLowerCase().includes(q) || track.artist.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Key filter
    if (selectedKey !== 'All Keys' && track.key && track.key !== selectedKey) {
      return false;
    }

    // BPM filter
    if (selectedBpmOption !== 'All BPM' && track.bpm) {
      if (selectedBpmOption === 'Slow (<90 BPM)' && track.bpm >= 90) return false;
      if (selectedBpmOption === 'Midtempo (90-125 BPM)' && (track.bpm < 90 || track.bpm > 125)) return false;
      if (selectedBpmOption === 'Fast (125-150 BPM)' && (track.bpm < 125 || track.bpm > 150)) return false;
      if (selectedBpmOption === 'Upbeat (150+ BPM)' && track.bpm < 150) return false;
    }

    return true;
  });

  const selectAllFiltered = () => {
    if (selectedTrackIds.size === filteredTracks.length && filteredTracks.length > 0) {
      setSelectedTrackIds(new Set());
    } else {
      setSelectedTrackIds(new Set(filteredTracks.map(t => t.id)));
    }
  };

  // Create Pack and navigate straight to beat pack detail page
  const handleDone = async () => {
    const packTitle = title.trim() || 'Untitled Pack';

    // 1. Create the pack
    const newPackId = await createPack(
      {
        title: packTitle,
        producer: 'SOUTHSIDE',
        coverUrl: coverUrl || undefined,
        videoUrl: videoUrl || undefined,
        isVideoCover: isVideoCover,
        genre: 'Hip Hop',
        tags: ['New Pack', 'Collection']
      },
      Array.from(selectedTrackIds)
    );

    // 2. Import local uploaded files if any
    if (uploadedFiles.length > 0 && newPackId) {
      await importFiles(uploadedFiles, newPackId);
    }

    // 3. Close Create Modal & Open Beat Pack Detail Page
    setIsCreatePackOpen(false);
    if (newPackId) {
      openPackDetail(newPackId);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 25 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="fixed inset-0 z-[300] bg-[#0a0a0b] text-[#f2f3f5] overflow-hidden select-none font-sans"
      >
        <div id="stage" className="h-full flex relative">
          
          {/* ---------- LEFT: Back button + Cover ---------- */}
          <div id="left" className="flex-1 relative p-[30px] flex flex-col justify-between">
            <button
              id="back"
              onClick={() => setIsCreatePackOpen(false)}
              title="Back to library"
              className="w-10 h-10 rounded-full bg-[rgba(28,28,30,0.7)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center cursor-pointer text-[#f2f3f5] hover:bg-[rgba(45,45,48,0.8)] transition-all z-10"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
            </button>

            <div
              id="cover-wrap"
              onClick={() => coverInputRef.current?.click()}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(34vw,440px)] aspect-square rounded-[10px] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.55)] bg-[#1a1a1c] cursor-pointer group"
            >
              {isVideoCover && coverUrl ? (
                <video
                  src={coverUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover block"
                />
              ) : coverUrl ? (
                <img
                  id="cover-media"
                  src={coverUrl}
                  alt="cover"
                  className="absolute inset-0 w-full h-full object-cover block"
                />
              ) : (
                <div
                  id="cover-placeholder"
                  className="absolute inset-0"
                  style={{
                    background: 'conic-gradient(from 200deg at 50% 45%, #2a2a2d, #3c3c40, #18181a, #4a4a4e, #222224, #38383c, #151517, #2a2a2d)'
                  }}
                />
              )}

              {/* Pencil button overlay */}
              <div
                id="edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  coverInputRef.current?.click();
                }}
                title="Change cover (photo or video)"
                className="absolute top-[12px] right-[12px] w-[34px] h-[34px] rounded-full bg-[rgba(15,15,17,0.55)] border border-[rgba(255,255,255,0.14)] flex items-center justify-center cursor-pointer backdrop-blur-[6px] hover:bg-[rgba(15,15,17,0.85)] transition-all z-10"
              >
                <svg className="w-[15px] h-[15px] stroke-[#f2f3f5]" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
              </div>
            </div>

            <input
              type="file"
              ref={coverInputRef}
              id="cover-input"
              accept="image/*,video/*"
              onChange={handleCoverChange}
              className="hidden"
            />
          </div>

          {/* ---------- RIGHT PANEL ---------- */}
          <div id="panel" className="w-[min(46vw,720px)] min-w-[440px] h-full bg-[#0c0c0d] border-l border-[rgba(255,255,255,0.10)] p-[40px] flex flex-col justify-between overflow-hidden">
            
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Title Input */}
              <input
                id="title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                spellCheck={false}
                className="text-[44px] font-[800] tracking-[-0.03em] bg-transparent border-none outline-none text-[#f2f3f5] w-full p-0 font-sans placeholder-[#5a5b60] shrink-0"
              />

              {/* Dropzone Container */}
              <div
                id="dropzone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-[26px] flex-1 border border-[rgba(255,255,255,0.10)] rounded-[14px] flex flex-col relative bg-[rgba(255,255,255,0.012)] transition-colors overflow-hidden ${
                  isDragging ? 'border-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.03)]' : ''
                }`}
              >
                {!isPickerActive && uploadedFiles.length === 0 ? (
                  /* Empty state */
                  <div
                    id="empty-state"
                    onClick={() => setIsPickerActive(true)}
                    className="w-full h-full flex flex-col items-center justify-center gap-[14px] cursor-pointer p-6"
                  >
                    <svg id="upload-icon" className="w-[30px] h-[30px] stroke-[#8b8d94] fill-none" viewBox="0 0 24 24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                      <path d="M14 3v6h6"/>
                      <path d="M12 12v6M9 15h6"/>
                    </svg>
                    <div id="empty-label" className="text-[13.5px] font-[700] text-[#8b8d94] tracking-[0.01em]">
                      Upload or drop in files
                    </div>
                    <button
                      id="add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPickerActive(true);
                      }}
                      className="mt-[2px] bg-white text-[#0a0a0b] border-none rounded-full px-[30px] py-[10px] text-[14px] font-[700] cursor-pointer transition-transform hover:opacity-90 active:scale-95 font-sans"
                    >
                      Add Tracks
                    </button>
                  </div>
                ) : (
                  /* Active Tracks Picker View */
                  <div className="w-full h-full flex flex-col p-4 space-y-3 overflow-hidden">
                    
                    {/* Top Bar: Filters + Upload From Computer */}
                    <div className="flex flex-col space-y-2 border-b border-white/10 pb-3 shrink-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            type="text"
                            placeholder="Search library..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => filesInputRef.current?.click()}
                          className="py-1.5 px-3 rounded-lg bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-colors flex items-center gap-1.5 shrink-0 border border-white/10 cursor-pointer"
                          title="Upload local files from computer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Computer</span>
                        </button>

                        <button
                          type="button"
                          onClick={selectAllFiltered}
                          className="py-1.5 px-3 rounded-lg bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-colors flex items-center gap-1.5 shrink-0 border border-white/10 cursor-pointer"
                        >
                          {selectedTrackIds.size === filteredTracks.length && filteredTracks.length > 0 ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-neutral-400" />
                          )}
                          <span>{selectedTrackIds.size === filteredTracks.length && filteredTracks.length > 0 ? 'Deselect All' : 'Select All'}</span>
                        </button>
                      </div>

                      {/* STYLISH CUSTOM KEY & BPM SELECTOR BOXES */}
                      <div className="flex items-center gap-2 relative">
                        
                        {/* Custom Key Selector Box */}
                        <div className="relative flex-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsKeyPopoverOpen(!isKeyPopoverOpen);
                              setIsBpmPopoverOpen(false);
                            }}
                            className="w-full bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white font-semibold flex items-center justify-between gap-1.5 cursor-pointer transition-all shadow"
                          >
                            <div className="flex items-center gap-1.5">
                              <Key className="w-3.5 h-3.5 text-amber-400" />
                              <span>Key: {selectedKey}</span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isKeyPopoverOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Key Popover */}
                          {isKeyPopoverOpen && (
                            <div className="absolute top-full left-0 mt-1 w-64 bg-[#18181d] border border-white/20 rounded-xl p-2.5 shadow-2xl z-30 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-1 pb-1 border-b border-white/10">
                                Select Key
                              </div>
                              <div className="grid grid-cols-2 gap-1 pt-1">
                                {KEY_OPTIONS.map(k => (
                                  <button
                                    key={k}
                                    type="button"
                                    onClick={() => {
                                      setSelectedKey(k);
                                      setIsKeyPopoverOpen(false);
                                    }}
                                    className={`px-2 py-1 rounded-lg text-[11px] font-medium text-left truncate transition-colors cursor-pointer ${
                                      selectedKey === k ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-neutral-300 hover:bg-white/10'
                                    }`}
                                  >
                                    {k}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Custom BPM Selector Box */}
                        <div className="relative flex-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsBpmPopoverOpen(!isBpmPopoverOpen);
                              setIsKeyPopoverOpen(false);
                            }}
                            className="w-full bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white font-semibold flex items-center justify-between gap-1.5 cursor-pointer transition-all shadow"
                          >
                            <div className="flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-cyan-400" />
                              <span>BPM: {selectedBpmOption}</span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isBpmPopoverOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {/* BPM Popover */}
                          {isBpmPopoverOpen && (
                            <div className="absolute top-full right-0 mt-1 w-60 bg-[#18181d] border border-white/20 rounded-xl p-2 shadow-2xl z-30 space-y-1">
                              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-1 pb-1 border-b border-white/10">
                                Select BPM Range
                              </div>
                              <div className="space-y-1 pt-1">
                                {BPM_OPTIONS.map(b => (
                                  <button
                                    key={b}
                                    type="button"
                                    onClick={() => {
                                      setSelectedBpmOption(b);
                                      setIsBpmPopoverOpen(false);
                                    }}
                                    className={`w-full px-2.5 py-1 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                                      selectedBpmOption === b ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-neutral-300 hover:bg-white/10'
                                    }`}
                                  >
                                    {b}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* Local Uploaded Files Banner if any */}
                    {uploadedFiles.length > 0 && (
                      <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-lg p-2 flex items-center justify-between text-xs text-emerald-300 shrink-0">
                        <span className="font-medium">📁 {uploadedFiles.length} file(s) ready to import</span>
                        <button
                          onClick={() => setUploadedFiles([])}
                          className="text-neutral-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Selectable Library Tracks List */}
                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                      {filteredTracks.map(track => {
                        const isSelected = selectedTrackIds.has(track.id);
                        const isDuplicate = mediaList.filter(m => m.title.toLowerCase().trim() === track.title.toLowerCase().trim()).length > 1;

                        return (
                          <div
                            key={track.id}
                            onClick={() => toggleTrack(track.id)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer text-xs transition-colors ${
                              isSelected
                                ? 'bg-blue-950/40 border-blue-500/50 text-blue-100 shadow'
                                : 'bg-white/5 border-white/5 hover:bg-white/10 text-neutral-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-neutral-500 shrink-0" />
                              )}
                              <div className="truncate min-w-0 flex items-center gap-2">
                                <div>
                                  <span className="font-bold text-white block truncate">{track.title}</span>
                                  <span className="text-[11px] text-neutral-400 truncate">{track.artist}</span>
                                </div>
                                {isDuplicate && (
                                  <span className="text-[9px] font-extrabold uppercase text-amber-300 bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded shrink-0">
                                    Duplicated
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 shrink-0">
                              {track.key && (
                                <span className="bg-white/10 px-1.5 py-0.5 rounded text-neutral-300">
                                  {track.key}
                                </span>
                              )}
                              {track.bpm && (
                                <span className="bg-white/10 px-1.5 py-0.5 rounded text-neutral-300">
                                  {track.bpm} BPM
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {filteredTracks.length === 0 && (
                        <div className="text-center py-8 text-neutral-500 text-xs">
                          No tracks matched your search/filters. Try selecting "All Keys" or "All BPM".
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

              <input
                type="file"
                ref={filesInputRef}
                id="files-input"
                multiple
                accept="image/*,video/*,audio/*"
                onChange={handleFilesInputChange}
                className="hidden"
              />
            </div>

            {/* Bottom Action Bar: DONE Button */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between shrink-0">
              <div className="text-xs text-neutral-400 font-mono">
                {selectedTrackIds.size + uploadedFiles.length} item(s) selected
              </div>

              <button
                id="done-btn"
                onClick={handleDone}
                className="bg-white hover:bg-neutral-200 text-black font-extrabold text-sm px-8 py-3 rounded-full cursor-pointer transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>DONE — Create Pack</span>
              </button>
            </div>

          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
