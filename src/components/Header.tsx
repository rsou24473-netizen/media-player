import React, { useState, useRef } from 'react';
import { useMedia } from '../context/MediaContext';
import { APP_LAYOUTS } from '../data/layoutsData';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  FolderUp, 
  FileMusic, 
  Tag, 
  Layers, 
  Link, 
  Menu,
  Sparkles,
  Box
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    filters,
    setFilters,
    mediaList,
    packs,
    activeLayout,
    setActiveLayout,
    setIsImportOpen,
    setIsCreatePackOpen,
    addCustomTagGlobal,
    themeConfig,
    isMainMenuOpen,
    setIsMainMenuOpen,
    userProfile,
    setIsProfileModalOpen,
    isPlaying,
    setIsSearchPopoutOpen,
    importFiles
  } = useMedia();

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isTagPromptOpen, setIsTagPromptOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await importFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleCreateTag = () => {
    const clean = newTagInput.trim().replace(/^#/, '');
    if (clean) {
      addCustomTagGlobal(clean);
      setNewTagInput('');
      setIsTagPromptOpen(false);
    }
  };

  return (
    <>
      <header
        id="app-global-header"
        className={`h-16 ${themeConfig.headerBg} px-6 flex items-center justify-between select-none z-[100] sticky top-0 transition-colors duration-300 border-b ${themeConfig.borderColor || 'border-white/10'}`}
        onClick={() => {
          setIsAddMenuOpen(false);
        }}
      >
        {/* Left: Dynamic Library Tracker & 3D Room Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div 
            id="automatic-library-tracker-pill"
            className={`flex items-center gap-2.5 ${themeConfig.cardBg} border ${themeConfig.borderColor} rounded-full px-3.5 py-1.5 text-xs font-medium text-neutral-300 shadow-sm transition-all hover:border-white/30`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? `${themeConfig.accentColor} animate-ping` : 'bg-neutral-400'}`} />
              <span className="text-white font-bold tracking-tight">{mediaList.length} Tracks</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold tracking-tight">{packs.length} Packs</span>
            </div>
          </div>

          {/* 3D Music Room Button */}
          <button
            id="header-3d-room-toggle-btn"
            type="button"
            onClick={() => setActiveLayout(activeLayout === 'music_room_3d' ? 'two_panel' : 'music_room_3d')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm ${
              activeLayout === 'music_room_3d'
                ? 'bg-cyan-400 text-black shadow-[0_0_16px_rgba(34,211,238,0.5)] ring-2 ring-cyan-300'
                : `${themeConfig.cardBg} text-neutral-300 border ${themeConfig.borderColor} hover:border-cyan-400/50 hover:text-white`
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Room</span>
          </button>
        </div>

        {/* Center: Smart Search Bar In The Middle */}
        <div className="flex-1 max-w-lg mx-auto px-4 flex justify-center">
          <div 
            onClick={() => setIsSearchPopoutOpen(true)}
            className="relative w-full cursor-pointer group"
          >
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
              <Search className={`w-3.5 h-3.5 ${themeConfig.accentIconColor || 'text-cyan-400'} transition-transform group-hover:scale-110`} />
              <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
            </div>
            <input
              id="global-media-search-input"
              type="text"
              readOnly
              placeholder="Smart Search: '140 bpm trap', 'c minor', 'lo-fi'..."
              value={filters.searchQuery ? `Smart query: "${filters.searchQuery}"` : ''}
              onClick={() => setIsSearchPopoutOpen(true)}
              onFocus={() => setIsSearchPopoutOpen(true)}
              className={`w-full h-10 ${themeConfig.cardBg} border ${themeConfig.borderColor} hover:border-cyan-400/50 focus:border-cyan-400/70 rounded-full pl-11 pr-20 text-xs font-medium text-white placeholder-neutral-500 focus:outline-none transition-all shadow-inner cursor-pointer group-hover:shadow-[0_0_18px_rgba(34,211,238,0.2)]`}
            />
            {/* Keyboard shortcut pill & Smart badge */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/25 text-[9px] font-bold text-cyan-300 font-mono">
                SMART
              </span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 text-[10px] font-mono text-neutral-400 group-hover:text-white group-hover:bg-white/15 transition-colors">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Section: Add Button, Profile Avatar & 3-Line Hamburger Menu */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Accent-Colored Pill + Add Button */}
          <div className="relative z-[110]">
            <button
              id="header-import-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddMenuOpen(!isAddMenuOpen);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full ${themeConfig.accentColor} text-black text-xs font-bold transition-all shadow-md active:scale-95 ${themeConfig.activeGlow || ''}`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add</span>
            </button>

            {/* Add Menu Dropdown */}
            <AnimatePresence>
              {isAddMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.16 }}
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute right-0 top-full mt-2 w-64 ${themeConfig.cardBg} backdrop-blur-2xl border ${themeConfig.borderColor} rounded-2xl p-2 shadow-2xl z-[120] space-y-1 text-white`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      folderInputRef.current?.click();
                      setIsAddMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:text-white ${themeConfig.hoverBg} transition-colors text-left font-semibold`}
                  >
                    <FolderUp className={`w-4 h-4 ${themeConfig.accentIconColor}`} />
                    <span>Upload Folder</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setIsAddMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:text-white ${themeConfig.hoverBg} transition-colors text-left font-semibold`}
                  >
                    <FileMusic className={`w-4 h-4 ${themeConfig.accentIconColor}`} />
                    <span>Upload Audio / Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTagPromptOpen(true);
                      setIsAddMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:text-white ${themeConfig.hoverBg} transition-colors text-left font-semibold`}
                  >
                    <Tag className={`w-4 h-4 ${themeConfig.accentIconColor}`} />
                    <span>Create Tag</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatePackOpen(true);
                      setIsAddMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:text-white ${themeConfig.hoverBg} transition-colors text-left font-semibold`}
                  >
                    <Layers className={`w-4 h-4 ${themeConfig.accentIconColor}`} />
                    <span>Create Pack / Playlist</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsImportOpen(true);
                      setIsAddMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:text-white ${themeConfig.hoverBg} transition-colors text-left font-semibold border-t ${themeConfig.borderColor} pt-2.5 mt-1`}
                  >
                    <Link className={`w-4 h-4 ${themeConfig.accentIconColor}`} />
                    <span>Import via Stream URL</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Big Profile Avatar (with Moving Video Support) & Big 3-Lines Hamburger Menu */}
          <div className={`flex items-center gap-2 ${themeConfig.cardBg} border ${themeConfig.borderColor} rounded-full p-1 pl-1.5 shadow-sm`}>
            {/* Prominent Large Profile Avatar with Live Looping Video */}
            <button
              id="header-profile-avatar-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileModalOpen(true);
              }}
              title="Edit Profile & Moving Video Avatar"
              className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border ${themeConfig.borderColor} hover:border-white transition-all shadow-md group shrink-0 flex items-center justify-center bg-black`}
            >
              {userProfile.isVideoAvatar && userProfile.avatarVideoUrl ? (
                <video
                  src={userProfile.avatarVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-full h-full object-cover rounded-full"
                />
              )}

              {/* Video avatar indicator overlay */}
              {userProfile.isVideoAvatar && (
                <span className={`absolute -bottom-0.5 right-0 w-2.5 h-2.5 rounded-full ${themeConfig.accentColor} ring-1 ring-black animate-pulse`} />
              )}
            </button>

            {/* Prominent Large 3-Line Menu Icon */}
            <button
              id="header-main-menu-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMainMenuOpen(!isMainMenuOpen);
              }}
              title="Studio Settings & Layouts"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-neutral-200 hover:text-white ${
                isMainMenuOpen ? 'bg-white/20 text-white shadow-inner' : themeConfig.hoverBg
              } transition-colors`}
            >
              <Menu className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Hidden inputs for Folder/File upload */}
        <input
          ref={folderInputRef}
          type="file"
          // @ts-expect-error webkitdirectory is standard for folder picking
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,video/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </header>

      {/* Tag Prompt Dialog */}
      <AnimatePresence>
        {isTagPromptOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsTagPromptOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm ${themeConfig.cardBg} border ${themeConfig.borderColor} rounded-2xl p-5 shadow-2xl space-y-4 text-white`}
            >
              <h3 className="text-sm font-bold text-white">Create Custom Tag</h3>
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="e.g. Vintage, Synthwave, Drop 1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateTag();
                  if (e.key === 'Escape') setIsTagPromptOpen(false);
                }}
                className={`w-full h-10 px-3 rounded-xl bg-black/50 border ${themeConfig.borderColor} text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/40`}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTagPromptOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateTag}
                  className={`px-4 py-1.5 rounded-xl ${themeConfig.accentColor} text-black font-bold text-xs shadow-md`}
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
