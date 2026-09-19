import React, { useState } from 'react';
import { useMedia } from '../context/MediaContext';
import { APP_THEMES } from '../theme/themes';
import { APP_LAYOUTS } from '../data/layoutsData';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sliders, 
  Keyboard, 
  Layout, 
  Palette, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Settings, 
  UserPlus, 
  HelpCircle, 
  LogOut, 
  ChevronDown, 
  ChevronUp, 
  Sun, 
  Moon, 
  Monitor, 
  CheckCircle2,
  Box,
  Orbit,
  Activity,
  Columns2,
  LayoutGrid,
  Grid3X3,
  SplitSquareVertical,
  Film,
  Layers,
  Maximize2,
  MoveHorizontal,
  Square,
  Newspaper,
  Trash2
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Box,
  Orbit,
  Activity,
  Columns2,
  LayoutGrid,
  Grid3X3,
  SplitSquareVertical,
  Film,
  Layers,
  Maximize2,
  MoveHorizontal,
  Square,
  Newspaper
};

export const MainMenuDrawer: React.FC = () => {
  const {
    isMainMenuOpen,
    setIsMainMenuOpen,
    losslessStreaming,
    setLosslessStreaming,
    useOriginalFilenames,
    setUseOriginalFilenames,
    activeLayout,
    setActiveLayout,
    setIsLayoutModalOpen,
    currentTheme,
    setCurrentTheme,
    setIsThemeModalOpen,
    themeConfig,
    setIsEqOpen,
    setIsShortcutsOpen,
    setIsProfileModalOpen,
    userProfile,
    clearAllMedia
  } = useMedia();

  // Collapsible sections
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isLayoutsSectionOpen, setIsLayoutsSectionOpen] = useState(false);
  const [isThemesSectionOpen, setIsThemesSectionOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const allLayouts = Object.values(APP_LAYOUTS);
  const allThemes = Object.values(APP_THEMES);

  return (
    <AnimatePresence>
      {isMainMenuOpen && (
        <>
          {/* Transparent Backdrop to close when clicking outside without dimming/blurring the page */}
          <div
            id="main-menu-dropdown-backdrop"
            className="fixed inset-0 z-40 bg-transparent cursor-default"
            onClick={() => setIsMainMenuOpen(false)}
          />

          {/* Normal Floating Dropdown Menu positioned right beneath top-right header button */}
          <motion.div
            id="main-menu-dropdown"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className={`fixed top-[66px] right-3 sm:right-6 z-50 w-[340px] sm:w-[380px] max-h-[calc(100vh-84px)] flex flex-col justify-between ${themeConfig.cardBg || 'bg-[#121316]'} backdrop-blur-3xl border ${themeConfig.borderColor || 'border-white/15'} rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85),0_0_20px_rgba(0,0,0,0.5)] text-neutral-200 overflow-y-auto custom-scrollbar select-none font-sans`}
          >
            {/* TOP SECTION: User Account Header & Main Menu Items */}
            <div className="p-4 sm:p-5 space-y-3.5">
              {/* 1. Account Header Capsule (Avatar + Name + Edit account link) */}
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                  {/* Circular Avatar / Live Video Avatar */}
                  <div 
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsMainMenuOpen(false);
                    }}
                    className={`relative w-10 h-10 rounded-full overflow-hidden bg-black/60 border ${themeConfig.borderColor || 'border-white/20'} hover:border-white transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-md group`}
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
                    ) : userProfile.avatarUrl ? (
                      <img
                        src={userProfile.avatarUrl}
                        alt={userProfile.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-neutral-700 flex items-center justify-center text-white font-bold text-xs">
                        {userProfile.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    {userProfile.isVideoAvatar && (
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${themeConfig.accentColor || 'bg-cyan-400'} ring-1 ring-black animate-pulse`} />
                    )}
                  </div>

                  {/* Name & Edit account */}
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-[170px] sm:max-w-[190px]">
                      {userProfile.name || 'Studio Producer'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setIsMainMenuOpen(false);
                      }}
                      className="text-[11px] text-neutral-400 hover:text-white underline underline-offset-2 transition-colors text-left"
                    >
                      Edit profile & avatar
                    </button>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsMainMenuOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className={`h-[1px] ${themeConfig.borderColor || 'bg-white/10'} -mx-4 sm:-mx-5`} />

              {/* 2. Top Action Items: Download desktop sync (Upgrade to Pro removed per user request) */}
              <div className="space-y-0.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => showToast('Desktop sync downloaded for your OS!')}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold text-neutral-200 hover:text-white ${themeConfig.hoverBg || 'hover:bg-white/5'} transition-colors text-left`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${themeConfig.accentIconColor || 'text-neutral-300'}`} />
                  <span className="text-xs">Download desktop sync</span>
                </button>
              </div>

              <div className={`h-[1px] ${themeConfig.borderColor || 'bg-white/10'} -mx-4 sm:-mx-5`} />

              {/* 3. Settings Collapsible Section */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`w-full flex items-center justify-between px-2.5 py-1 text-xs font-semibold text-neutral-200 hover:text-white ${themeConfig.hoverBg || 'hover:bg-white/5'} rounded-lg transition-colors`}
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className={`w-3.5 h-3.5 ${themeConfig.accentIconColor || 'text-neutral-300'}`} />
                    <span className="text-xs font-bold text-white">Studio Settings</span>
                  </div>
                  {isSettingsOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  )}
                </button>

                {isSettingsOpen && (
                  <div className="space-y-3 pl-2 pr-1 pt-1">
                    {/* Lossless streaming Switch */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5 flex-1 pr-2">
                        <div className="text-xs font-bold text-white">Lossless streaming</div>
                        <div className="text-[10px] text-neutral-400 leading-snug">
                          Stream highest-quality FLAC 24-bit audio.
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={losslessStreaming}
                        onClick={() => setLosslessStreaming(!losslessStreaming)}
                        className={`w-10 h-5 rounded-full transition-colors relative shrink-0 focus:outline-none p-0.5 mt-0.5 ${
                          losslessStreaming ? (themeConfig.accentColor || 'bg-cyan-400') : 'bg-[#2b2d33]'
                        }`}
                      >
                        <motion.div
                          animate={{ x: losslessStreaming ? 18 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="w-4 h-4 rounded-full bg-white shadow-md"
                        />
                      </button>
                    </div>

                    {/* Use original filenames Switch */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5 flex-1 pr-2">
                        <div className="text-xs font-bold text-white">Use original filenames</div>
                        <div className="text-[10px] text-neutral-400 leading-snug">
                          Export files with unformatted names.
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={useOriginalFilenames}
                        onClick={() => setUseOriginalFilenames(!useOriginalFilenames)}
                        className={`w-10 h-5 rounded-full transition-colors relative shrink-0 focus:outline-none p-0.5 mt-0.5 ${
                          useOriginalFilenames ? 'bg-emerald-500' : 'bg-[#2b2d33]'
                        }`}
                      >
                        <motion.div
                          animate={{ x: useOriginalFilenames ? 18 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="w-4 h-4 rounded-full bg-white shadow-md"
                        />
                      </button>
                    </div>

                    {/* Switch Studio Layout Sub-Section */}
                    <div className={`pt-2 space-y-2 border-t ${themeConfig.borderColor || 'border-white/5'}`}>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setIsLayoutsSectionOpen(!isLayoutsSectionOpen)}
                          className="flex items-center gap-2 text-xs font-bold text-white hover:text-cyan-300 transition-colors"
                        >
                          <Layout className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Layout Mode (13 Views)</span>
                          {isLayoutsSectionOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsLayoutModalOpen(true);
                            setIsMainMenuOpen(false);
                          }}
                          className={`text-[10px] ${themeConfig.accentTextColor || 'text-cyan-400'} hover:underline font-semibold`}
                        >
                          Browse All
                        </button>
                      </div>

                      {isLayoutsSectionOpen && (
                        <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                          {allLayouts.map((l) => {
                            const isSelected = activeLayout === l.id;
                            const IconComp = ICON_MAP[l.iconName] || Layout;
                            return (
                              <button
                                key={l.id}
                                type="button"
                                onClick={() => setActiveLayout(l.id)}
                                className={`p-1.5 rounded-xl border text-left transition-all flex items-center gap-1.5 ${
                                  isSelected
                                    ? `${themeConfig.accentBgSubtle || 'bg-cyan-500/20'} ${themeConfig.borderColor || 'border-cyan-400'} text-white font-bold`
                                    : `bg-black/30 border-white/10 hover:border-white/20 text-neutral-300 ${themeConfig.hoverBg || ''}`
                                }`}
                              >
                                <IconComp className={`w-3 h-3 shrink-0 ${isSelected ? (themeConfig.accentIconColor || 'text-cyan-400') : 'text-neutral-400'}`} />
                                <span className="text-[10px] truncate flex-1">{l.name}</span>
                                {isSelected && <Check className={`w-3 h-3 ${themeConfig.accentIconColor || 'text-cyan-400'} shrink-0 stroke-[3]`} />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Aesthetics & Themes Sub-Section */}
                    <div className={`pt-2 space-y-2 border-t ${themeConfig.borderColor || 'border-white/5'}`}>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setIsThemesSectionOpen(!isThemesSectionOpen)}
                          className="flex items-center gap-2 text-xs font-bold text-white hover:text-cyan-300 transition-colors"
                        >
                          <Palette className={`w-3.5 h-3.5 ${themeConfig.accentIconColor || 'text-cyan-400'}`} />
                          <span>Themes (21 Worlds)</span>
                          {isThemesSectionOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsThemeModalOpen(true);
                            setIsMainMenuOpen(false);
                          }}
                          className={`text-[10px] ${themeConfig.accentTextColor || 'text-cyan-400'} hover:underline font-semibold`}
                        >
                          Browse All
                        </button>
                      </div>

                      {isThemesSectionOpen && (
                        <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                          {allThemes.map((t) => {
                            const isSelected = currentTheme === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setCurrentTheme(t.id)}
                                className={`p-1.5 rounded-xl border text-left transition-all flex flex-col items-center gap-1 ${
                                  isSelected
                                    ? `${t.borderColor} bg-white/10 text-white font-bold shadow-sm`
                                    : 'bg-black/30 border-white/10 hover:border-white/20 text-neutral-300'
                                }`}
                              >
                                <div 
                                  className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                                  style={{ backgroundColor: t.previewColor }}
                                />
                                <span className="text-[9px] truncate w-full text-center">{t.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Studio Equalizer & Keyboard Shortcuts */}
                    <div className={`grid grid-cols-2 gap-1.5 pt-2 border-t ${themeConfig.borderColor || 'border-white/5'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEqOpen(true);
                          setIsMainMenuOpen(false);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl bg-black/40 border ${themeConfig.borderColor || 'border-white/10'} hover:border-white/30 text-xs font-bold text-neutral-200 hover:text-white transition-all`}
                      >
                        <Sliders className={`w-3.5 h-3.5 ${themeConfig.accentIconColor || 'text-cyan-400'}`} />
                        <span>Equalizer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsShortcutsOpen(true);
                          setIsMainMenuOpen(false);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl bg-black/40 border ${themeConfig.borderColor || 'border-white/10'} hover:border-white/30 text-xs font-bold text-neutral-200 hover:text-white transition-all`}
                      >
                        <Keyboard className="w-3.5 h-3.5 text-amber-400" />
                        <span>Shortcuts</span>
                      </button>
                    </div>

                    {/* Reset Library / Start Clean Player Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to wipe all pre-loaded tracks? This will make the player clean and empty so you can load your own files.")) {
                          clearAllMedia();
                          setIsMainMenuOpen(false);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 mt-2 p-2 rounded-xl border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/15 hover:border-rose-500/35 text-rose-400 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Wipe Library (Clean Player)</span>
                    </button>
                  </div>
                )}
              </div>

              <div className={`h-[1px] ${themeConfig.borderColor || 'bg-white/10'} -mx-4 sm:-mx-5`} />

              {/* 4. Secondary Action Items: Refer a friend, What's new, Help & feedback */}
              <div className="space-y-0.5">
                {/* Refer a friend */}
                <button
                  type="button"
                  onClick={() => showToast('Invite link copied to clipboard!')}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold text-neutral-200 hover:text-white ${themeConfig.hoverBg || 'hover:bg-white/5'} transition-colors text-left`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-neutral-300" />
                  <span className="text-xs">Refer a producer</span>
                </button>

                {/* What's new */}
                <button
                  type="button"
                  onClick={() => showToast("Version 2.4: 13 Studio Layouts & 21 Lossless Themes active!")}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-neutral-200 hover:text-white ${themeConfig.hoverBg || 'hover:bg-white/5'} transition-colors text-left`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className={`w-3.5 h-3.5 ${themeConfig.accentIconColor || 'text-cyan-400'}`} />
                    <span className="text-xs">What's new</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${themeConfig.accentColor || 'bg-cyan-400'} animate-pulse`} />
                </button>

                {/* Help & feedback */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(!isHelpOpen)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-neutral-200 hover:text-white ${themeConfig.hoverBg || 'hover:bg-white/5'} transition-colors text-left`}
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-3.5 h-3.5 text-neutral-300" />
                      <span className="text-xs">Help & shortcuts</span>
                    </div>
                    {isHelpOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </button>

                  {isHelpOpen && (
                    <div className="pl-8 pr-2 py-1.5 space-y-1 text-[11px] text-neutral-400">
                      <p>• Drop any audio/video file anywhere to import.</p>
                      <p>• Space: Play/Pause | M: Mute | ←/→: 5s seek.</p>
                      <p>• Switch layouts and themes at any time.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={`h-[1px] ${themeConfig.borderColor || 'bg-white/10'} -mx-4 sm:-mx-5`} />

              {/* 5. Sign out */}
              <button
                type="button"
                onClick={() => showToast('Session signed out.')}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs font-bold">Sign out</span>
              </button>
            </div>

            {/* BOTTOM SECTION: Theme quick toggle & Get the app */}
            <div className={`p-4 pt-2.5 space-y-3 border-t ${themeConfig.borderColor || 'border-white/10'} bg-black/40`}>
              {/* Theme Row */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Theme Quick Switch</span>

                <div className="flex items-center bg-black/50 border border-white/10 rounded-full p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTheme('liquid_silver');
                      showToast('Light theme applied');
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      currentTheme === 'liquid_silver' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Light Theme"
                  >
                    <Sun className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTheme('midnight');
                      showToast('Dark theme applied');
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      currentTheme === 'midnight' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Dark Theme"
                  >
                    <Moon className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsThemeModalOpen(true);
                      setIsMainMenuOpen(false);
                    }}
                    className="p-1.5 rounded-full text-neutral-400 hover:text-white transition-colors"
                    title="Custom Studio Themes"
                  >
                    <Monitor className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Get the app Section */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Get the app</span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => showToast('Redirecting to iOS App Store...')}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-full bg-black/50 border border-white/10 hover:border-white/30 text-white text-[11px] font-bold transition-all shadow-sm active:scale-95"
                  >
                    <span>🍏</span>
                    <span>iOS App</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Redirecting to Google Play Store...')}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-full bg-black/50 border border-white/10 hover:border-white/30 text-white text-[11px] font-bold transition-all shadow-sm active:scale-95"
                  >
                    <span>🤖</span>
                    <span>Android</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Toast notification inside dropdown */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-3 left-3 right-3 bg-white text-black px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xl z-50 justify-center"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{toastMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
