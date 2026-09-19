import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useMedia } from '../context/MediaContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Play,
  Pause,
  Tag,
  Music,
  Sliders,
  Sparkles,
  Volume2,
  Clock,
  ArrowRight,
  Filter,
  Check,
  RotateCcw,
  Video,
  Headphones,
  Zap,
  Flame,
  Moon,
  Star,
  Activity,
  Cpu,
  CornerDownLeft,
  History,
  Trash2
} from 'lucide-react';
import { MediaItem } from '../types';
import {
  parseSmartQuery,
  evaluateSmartMatches,
  ParsedSmartQuery,
  SmartToken
} from '../utils/smartSearchEngine';

const TRACK_TYPES = ['Beat', 'Song', 'Loop'] as const;
const MUSICAL_KEYS = ['C Minor', 'D Minor', 'F Minor', 'G Minor', 'A Minor', 'C Major', 'G Major'];
const BPM_RANGES = [
  { label: 'All Tempos', min: null, max: null },
  { label: 'Slow (<100)', min: null, max: 99 },
  { label: 'Mid (100–130)', min: 100, max: 130 },
  { label: 'Fast (>130)', min: 131, max: null }
];

const SEARCH_HISTORY_KEY = 'tessera_smart_search_history';

export const SearchPopoutModal: React.FC = () => {
  const {
    isSearchPopoutOpen,
    setIsSearchPopoutOpen,
    filters,
    setFilters,
    resetFilters,
    mediaList,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    allUserTags,
    removeCustomTagGlobal,
    themeConfig
  } = useMedia();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'tags' | 'types' | 'key_tempo'>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isSmartEngineActive, setIsSmartEngineActive] = useState<boolean>(true);

  // Search History
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      return saved ? JSON.parse(saved) : ['140 trap beat', 'c minor melodic', 'lo-fi chill', 'favorites'];
    } catch {
      return ['140 trap beat', 'c minor melodic', 'lo-fi chill'];
    }
  });

  const saveToHistory = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    setSearchHistory(prev => {
      const updated = [trimmed, ...prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch {}
  };

  // Only user tags - strictly no default pre-populated tags
  const userOnlyTags = useMemo(() => {
    return Array.from(new Set(allUserTags)).filter(Boolean);
  }, [allUserTags]);

  const [popoutManualBpm, setPopoutManualBpm] = useState<string>('');

  // Parse Smart Query in real-time
  const parsedSmartQuery: ParsedSmartQuery = useMemo(() => {
    if (!isSmartEngineActive) {
      return {
        rawQuery: filters.searchQuery,
        tokens: [],
        targetBpm: null,
        minBpm: filters.minBpm,
        maxBpm: filters.maxBpm,
        targetKey: filters.selectedKey,
        targetType: filters.selectedType,
        targetTags: filters.selectedCustomTag ? [filters.selectedCustomTag] : [],
        targetMood: null,
        mediaType: filters.mediaTypeFilter,
        onlyFavorites: false,
        onlyLocal: false,
        sortByIntent: 'relevance',
        textKeywords: filters.searchQuery.trim() ? [filters.searchQuery.toLowerCase()] : []
      };
    }
    return parseSmartQuery(filters.searchQuery, userOnlyTags);
  }, [filters.searchQuery, isSmartEngineActive, userOnlyTags, filters.minBpm, filters.maxBpm, filters.selectedKey, filters.selectedType, filters.selectedCustomTag, filters.mediaTypeFilter]);

  // Evaluate Scored Matches using Smart Engine
  const smartResults = useMemo(() => {
    if (!isSmartEngineActive) {
      // Standard filter
      return mediaList
        .filter(item => {
          if (filters.searchQuery.trim()) {
            const q = filters.searchQuery.toLowerCase();
            const matchTitle = item.title.toLowerCase().includes(q);
            const matchArtist = item.artist.toLowerCase().includes(q);
            const matchTags = item.customTags?.some(t => t.toLowerCase().includes(q));
            if (!matchTitle && !matchArtist && !matchTags) return false;
          }
          if (filters.selectedCustomTag && !item.customTags?.includes(filters.selectedCustomTag)) return false;
          if (filters.selectedType && item.typeTag !== filters.selectedType && item.trackType !== filters.selectedType) return false;
          if (filters.selectedKey && item.key !== filters.selectedKey) return false;
          if (filters.minBpm && (item.bpm || 0) < filters.minBpm) return false;
          if (filters.maxBpm && (item.bpm || 0) > filters.maxBpm) return false;
          if (filters.mediaTypeFilter !== 'all' && item.type !== filters.mediaTypeFilter) return false;
          return true;
        })
        .map(track => ({ track, score: 50, matchReasons: [] }));
    }

    // Smart Engine scoring
    let results = evaluateSmartMatches(mediaList, parsedSmartQuery, filters.searchQuery);

    // Also factor in the manual UI chips if set
    if (filters.selectedCustomTag) {
      results = results.filter(r => r.track.customTags?.includes(filters.selectedCustomTag!));
    }
    if (filters.selectedType) {
      results = results.filter(r => (r.track.typeTag || r.track.trackType) === filters.selectedType);
    }
    if (filters.selectedKey) {
      results = results.filter(r => r.track.key === filters.selectedKey);
    }
    if (filters.minBpm !== null) {
      results = results.filter(r => (r.track.bpm || 0) >= filters.minBpm!);
    }
    if (filters.maxBpm !== null) {
      results = results.filter(r => (r.track.bpm || 0) <= filters.maxBpm!);
    }
    if (filters.mediaTypeFilter !== 'all') {
      results = results.filter(r => r.track.type === filters.mediaTypeFilter);
    }

    return results;
  }, [mediaList, parsedSmartQuery, filters, isSmartEngineActive]);

  // Focus input when modal opens
  useEffect(() => {
    if (isSearchPopoutOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      setSelectedIndex(0);
    }
  }, [isSearchPopoutOpen]);

  // Handle ESC and Arrow Key Navigation
  useEffect(() => {
    if (!isSearchPopoutOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsSearchPopoutOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, smartResults.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + smartResults.length) % Math.max(1, smartResults.length));
      } else if (e.key === 'Enter') {
        if (smartResults.length > 0 && smartResults[selectedIndex]) {
          e.preventDefault();
          saveToHistory(filters.searchQuery);
          playTrack(smartResults[selectedIndex].track, smartResults.map(r => r.track));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchPopoutOpen, smartResults, selectedIndex, playTrack, filters.searchQuery, setIsSearchPopoutOpen]);

  // Remove a detected smart token from query
  const removeSmartToken = (token: SmartToken) => {
    const raw = token.raw;
    const newQuery = filters.searchQuery
      .replace(new RegExp(`\\b${raw}\\b`, 'gi'), '')
      .replace(/\s+/g, ' ')
      .trim();
    setFilters(prev => ({ ...prev, searchQuery: newQuery }));
  };

  const handleApplyPreset = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
    saveToHistory(query);
    inputRef.current?.focus();
  };

  const handleTagClick = (tag: string) => {
    const clean = tag.replace(/^#/, '');
    if (filters.selectedCustomTag === clean) {
      setFilters(prev => ({ ...prev, selectedCustomTag: null }));
    } else {
      setFilters(prev => ({ ...prev, selectedCustomTag: clean }));
    }
  };

  const handleTypeClick = (type: string) => {
    if (filters.selectedType === type) {
      setFilters(prev => ({ ...prev, selectedType: null }));
    } else {
      setFilters(prev => ({ ...prev, selectedType: type }));
    }
  };

  const handleKeyClick = (key: string) => {
    if (filters.selectedKey === key) {
      setFilters(prev => ({ ...prev, selectedKey: null }));
    } else {
      setFilters(prev => ({ ...prev, selectedKey: key }));
    }
  };

  const handleBpmRangeClick = (min: number | null, max: number | null) => {
    if (filters.minBpm === min && filters.maxBpm === max) {
      setFilters(prev => ({ ...prev, minBpm: null, maxBpm: null }));
    } else {
      setFilters(prev => ({ ...prev, minBpm: min, maxBpm: max }));
    }
  };

  const formatDuration = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isAnyFilterActive = Boolean(
    filters.searchQuery.trim() ||
    filters.selectedCustomTag ||
    filters.selectedType ||
    filters.selectedKey ||
    filters.minBpm !== null ||
    filters.maxBpm !== null ||
    filters.mediaTypeFilter !== 'all'
  );

  return (
    <AnimatePresence>
      {isSearchPopoutOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-12 px-3 sm:px-6 pb-24 overflow-y-auto custom-scrollbar select-none">
          {/* Blur & Dim Backdrop */}
          <motion.div
            id="search-popout-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (filters.searchQuery.trim()) {
                saveToHistory(filters.searchQuery);
              }
              setIsSearchPopoutOpen(false);
            }}
            className="fixed inset-0 bg-black/80 backdrop-blur-2xl cursor-pointer"
          />

          {/* Popped Out Floating Modal Window */}
          <motion.div
            id="search-popout-card"
            initial={{ opacity: 0, scale: 0.94, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`relative z-10 w-full max-w-3xl ${themeConfig.cardBg || 'bg-[#121316]'} backdrop-blur-3xl border ${themeConfig.borderColor || 'border-white/15'} rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col`}
          >
            {/* Top Accent Gradient Border Glow */}
            <div className={`h-[2px] w-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 opacity-90`} />

            {/* Header Status Bar: Smart Engine Mode Badge & Toggles */}
            <div className="px-5 pt-3 pb-1 flex items-center justify-between text-xs border-b border-white/5 bg-black/30">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-[11px] shadow-sm">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Smart Search Engine</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>
                <span className="text-[11px] text-neutral-400 hidden sm:inline">
                  Natural Language Audio Parser
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSmartEngineActive(!isSmartEngineActive)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    isSmartEngineActive
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-neutral-400'
                  }`}
                  title="Toggle Natural Language Smart Parser"
                >
                  {isSmartEngineActive ? 'NLP: ON' : 'NLP: OFF'}
                </button>
                <kbd className="hidden sm:inline-block text-[10px] font-mono text-neutral-500 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                  ESC to close
                </kbd>
              </div>
            </div>

            {/* 1. Large Hero Search Bar Input */}
            <div className="p-4 sm:p-5 pb-2 flex items-center gap-3 relative">
              <div className="relative flex-1 flex items-center">
                <Search className={`w-5 h-5 absolute left-4 text-cyan-400 shrink-0 pointer-events-none stroke-[2.2]`} />
                <input
                  ref={inputRef}
                  id="search-popout-input"
                  type="text"
                  placeholder="Smart query: e.g. '140 bpm trap beat in c minor', 'melodic chill', 'favorites'..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full h-13 sm:h-15 pl-12 pr-12 rounded-2xl bg-black/45 border border-white/15 hover:border-cyan-400/40 focus:border-cyan-400/70 focus:bg-black/70 text-sm sm:text-base font-medium text-white placeholder-neutral-500 focus:outline-none transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]"
                />
                {filters.searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilters(prev => ({ ...prev, searchQuery: '' }));
                      inputRef.current?.focus();
                    }}
                    className="absolute right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  if (filters.searchQuery.trim()) saveToHistory(filters.searchQuery);
                  setIsSearchPopoutOpen(false);
                }}
                className="px-3 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span>ESC</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. SMART INTENT TOKENS BREAKDOWN (Real-Time Natural Language Understanding) */}
            {parsedSmartQuery.tokens.length > 0 && (
              <div className="px-5 py-2 flex items-center gap-1.5 flex-wrap bg-cyan-950/20 border-y border-cyan-500/10">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Detected Intent:</span>
                </span>
                {parsedSmartQuery.tokens.map(token => (
                  <div
                    key={token.id}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${token.color} transition-all shadow-sm`}
                  >
                    <span>{token.displayValue}</span>
                    <button
                      type="button"
                      onClick={() => removeSmartToken(token)}
                      className="hover:opacity-100 opacity-60 hover:bg-black/20 rounded-full p-0.5"
                      title={`Remove ${token.label}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Recent Searches History Bar */}
            {searchHistory.length > 0 && (
              <div className="px-4 sm:px-5 py-2 bg-black/25 flex items-center gap-2 overflow-x-auto custom-scrollbar border-b border-white/5 select-none">
                <span className="text-[11px] font-bold text-neutral-400 shrink-0 flex items-center gap-1.5 mr-1">
                  <History className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Recent:</span>
                </span>
                
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
                  {searchHistory.slice(0, 5).map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleApplyPreset(h)}
                      className="px-2 py-0.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-cyan-300 transition-colors truncate max-w-[140px] border border-white/5 active:scale-95"
                    >
                      {h}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={clearHistory}
                  className="p-1 text-neutral-500 hover:text-rose-400 ml-auto shrink-0 transition-colors"
                  title="Clear history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 4. Filter Discovery Tabs: Tags, Types, Key, Tempo */}
            <div className="px-4 sm:px-5 py-2.5 border-b border-white/10 bg-black/20 space-y-2">
              <div className="flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar pb-0.5">
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'all'
                        ? `${themeConfig.accentColor || 'bg-cyan-400'} text-black shadow-md`
                        : 'text-neutral-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quick Tags</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('tags')}
                    className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'tags' || filters.selectedCustomTag
                        ? `${themeConfig.accentColor || 'bg-cyan-400'} text-black shadow-md`
                        : 'text-neutral-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Tags ({userOnlyTags.length})</span>
                    {filters.selectedCustomTag && (
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('types')}
                    className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'types' || filters.selectedType
                        ? `${themeConfig.accentColor || 'bg-cyan-400'} text-black shadow-md`
                        : 'text-neutral-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>Type</span>
                    {filters.selectedType && (
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('key_tempo')}
                    className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'key_tempo' || filters.selectedKey || filters.minBpm !== null
                        ? `${themeConfig.accentColor || 'bg-cyan-400'} text-black shadow-md`
                        : 'text-neutral-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Key & Tempo</span>
                    {(filters.selectedKey || filters.minBpm !== null) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                    )}
                  </button>
                </div>

                {/* Reset Filters */}
                {isAnyFilterActive && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Filter Chips Cloud */}
              <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pt-0.5">
                {(activeTab === 'all' || activeTab === 'tags') && (
                  <>
                    {userOnlyTags.length === 0 ? (
                      <span className="text-xs text-neutral-500 italic py-1">No custom tags added yet.</span>
                    ) : (
                      userOnlyTags.map(tag => {
                        const isSelected = filters.selectedCustomTag === tag || parsedSmartQuery.targetTags.includes(tag.toLowerCase());
                        return (
                          <div
                            key={tag}
                            className={`flex items-center gap-0.5 rounded-lg border transition-all ${
                              isSelected
                                ? `${themeConfig.accentColor || 'bg-cyan-400'} border-transparent text-black shadow-sm font-bold`
                                : 'bg-black/40 border-white/10 text-neutral-300 hover:border-white/20'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleTagClick(tag)}
                              className="pl-2 pr-1 py-1 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <span className="opacity-60">#</span>
                              <span>{tag}</span>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                            <button
                              type="button"
                              title={`Delete #${tag} globally`}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCustomTagGlobal(tag);
                              }}
                              className={`p-1 mr-1 rounded hover:bg-black/15 transition-all text-neutral-400 hover:text-rose-400 ${
                                isSelected ? 'text-black/60 hover:text-rose-900' : ''
                              }`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </>
                )}

                {(activeTab === 'all' || activeTab === 'types') && (
                  <>
                    {activeTab === 'all' && <span className="text-white/20 mx-1">|</span>}
                    {TRACK_TYPES.map(type => {
                      const isSelected = filters.selectedType === type || parsedSmartQuery.targetType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleTypeClick(type)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-fuchsia-500 text-white shadow-sm font-bold'
                              : 'bg-black/40 border border-white/10 text-neutral-300 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          <span>{type}</span>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </>
                )}

                {activeTab === 'key_tempo' && (
                  <>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Keys:</span>
                    {MUSICAL_KEYS.map(k => {
                      const isSelected = filters.selectedKey === k || parsedSmartQuery.targetKey === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleKeyClick(k)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-amber-400 text-black shadow-sm font-bold'
                              : 'bg-black/40 border border-white/10 text-neutral-300 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          <span>{k}</span>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      );
                    })}
                    <span className="text-white/20 mx-1">|</span>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Tempo:</span>
                    {/* Manual BPM input */}
                    <div className="flex items-center gap-1 bg-black/50 border border-white/10 rounded-lg px-2 py-0.5">
                      <input
                        type="text"
                        placeholder="Manual BPM"
                        value={popoutManualBpm}
                        onChange={(e) => setPopoutManualBpm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const bpm = parseInt(popoutManualBpm.trim(), 10);
                            if (!isNaN(bpm) && bpm > 0) {
                              setFilters(prev => ({ ...prev, minBpm: bpm, maxBpm: bpm }));
                            }
                          }
                        }}
                        className="w-20 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const bpm = parseInt(popoutManualBpm.trim(), 10);
                          if (!isNaN(bpm) && bpm > 0) {
                            setFilters(prev => ({ ...prev, minBpm: bpm, maxBpm: bpm }));
                          }
                        }}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold"
                      >
                        Set
                      </button>
                    </div>
                    {BPM_RANGES.map(r => {
                      const isSelected = filters.minBpm === r.min && filters.maxBpm === r.max;
                      return (
                        <button
                          key={r.label}
                          type="button"
                          onClick={() => handleBpmRangeClick(r.min, r.max)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-emerald-400 text-black shadow-sm font-bold'
                              : 'bg-black/40 border border-white/10 text-neutral-300 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          <span>{r.label}</span>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            {/* 5. Results Header with Smart Relevancy Stats */}
            <div className="px-4 sm:px-5 py-2.5 bg-black/40 flex items-center justify-between border-b border-white/5 text-[11px] text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white uppercase tracking-wider">
                  {smartResults.length} {smartResults.length === 1 ? 'Track' : 'Tracks'} Ranked by Relevance
                </span>
                {parsedSmartQuery.sortByIntent !== 'relevance' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                    Sorted by {parsedSmartQuery.sortByIntent}
                  </span>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-3 font-mono text-[10px] text-neutral-500">
                <span>↑↓ navigate</span>
                <span>•</span>
                <span>Enter to play</span>
                <span>•</span>
                <span>Click to play</span>
              </div>
            </div>

            {/* 6. MATCHING TRACKS LIST WITH THE EXACT SAME ANIMATION AS THE TRACKS PLAYLIST */}
            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-1.5">
              {smartResults.length > 0 ? (
                smartResults.map(({ track, score, matchReasons }, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isTrackPlaying = isCurrent && isPlaying;
                  const isFocused = selectedIndex === idx;

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        if (filters.searchQuery.trim()) saveToHistory(filters.searchQuery);
                        playTrack(track, smartResults.map(r => r.track));
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group relative p-2.5 rounded-xl cursor-pointer transition-all duration-200 ease-out flex items-center justify-between ${
                        isCurrent
                          ? 'bg-white/15 translate-x-2 text-white shadow-md'
                          : isFocused
                          ? 'bg-white/10 translate-x-2.5 text-white shadow-sm'
                          : 'hover:bg-white/[0.08] hover:translate-x-3 sm:hover:translate-x-3.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
                      }`}
                    >
                      {/* Left glowing animated accent marker on hover/play (SAME AS PLAYLIST) */}
                      <div
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-200 ${
                          isCurrent
                            ? `h-3/4 ${themeConfig.accentColor || 'bg-cyan-400'} shadow-[0_0_8px_rgba(34,211,238,0.6)]`
                            : `h-0 group-hover:h-3/5 ${themeConfig.accentColor || 'bg-cyan-400'}`
                        }`}
                      />

                      {/* Left: Artwork + Title + Artist + Badges */}
                      <div className="flex items-center gap-3 min-w-0 flex-1 pl-1.5">
                        {/* Artwork with Live Animated Equalizer when Playing */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/50 border border-white/10 shrink-0 relative transition-transform duration-200 group-hover:scale-105 group-hover:shadow-md">
                          <img
                            src={track.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'}
                            alt={track.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />

                          {/* Live Equalizer Spectrum Overlay when Playing */}
                          {isTrackPlaying ? (
                            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-end justify-center gap-[2px] pb-1 px-1">
                              <div className="w-[2.5px] rounded-full bg-cyan-400 animate-eq-1 shadow-[0_0_4px_#22d3ee]" />
                              <div className="w-[2.5px] rounded-full bg-fuchsia-400 animate-eq-2 shadow-[0_0_4px_#e879f9]" />
                              <div className="w-[2.5px] rounded-full bg-amber-400 animate-eq-3 shadow-[0_0_4px_#fbbf24]" />
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                            </div>
                          )}
                        </div>

                        {/* Title & Artist & Smart Match Badges */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs sm:text-sm font-semibold leading-tight truncate transition-colors duration-150 ${
                              isCurrent ? 'text-white font-bold' : 'text-[#eceef1] group-hover:text-white'
                            }`}>
                              {track.title}
                            </span>
                            {track.typeTag && (
                              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-bold uppercase tracking-wider text-neutral-300">
                                {track.typeTag}
                              </span>
                            )}
                            {track.key && (
                              <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/20 text-[9px] font-mono text-amber-300">
                                {track.key}
                              </span>
                            )}
                            {/* Smart Match Reason Pill */}
                            {matchReasons.length > 0 && (
                              <span className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-500/15 text-[9px] text-cyan-300 font-mono">
                                <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                                <span>{matchReasons[0]}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400 font-medium">
                            <span className="truncate">{track.artist || 'Master Audio'}</span>
                            {track.bpm && (
                              <>
                                <span className="opacity-40">•</span>
                                <span className="font-mono text-neutral-300">{track.bpm} BPM</span>
                              </>
                            )}
                            {track.customTags && track.customTags.length > 0 && (
                              <>
                                <span className="opacity-40 hidden sm:inline">•</span>
                                <span className="hidden sm:inline-block text-[10px] text-cyan-400 truncate">
                                  #{track.customTags[0]}
                                  {track.customTags.length > 1 ? ` +${track.customTags.length - 1}` : ''}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Duration + Play Button */}
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="text-xs font-mono text-neutral-400">
                          {formatDuration(track.duration)}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCurrent) {
                              togglePlayPause();
                            } else {
                              if (filters.searchQuery.trim()) saveToHistory(filters.searchQuery);
                              playTrack(track, smartResults.map(r => r.track));
                            }
                          }}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                            isTrackPlaying
                              ? `${themeConfig.accentColor || 'bg-cyan-400'} text-black shadow-md scale-105`
                              : 'bg-white/10 text-white hover:bg-white hover:text-black group-hover:scale-105'
                          }`}
                        >
                          {isTrackPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Empty state with Smart Suggestions */
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">Smart Engine: No matching tracks found</div>
                    <div className="text-xs text-neutral-400 max-w-sm">
                      We couldn't find tracks matching your combined smart criteria. Try clearing the key, broadening BPM, or pick a smart preset:
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('140 trap')}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all"
                    >
                      ⚡ Try "140 trap"
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('c minor loops')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold transition-all"
                    >
                      🎹 Try "c minor loops"
                    </button>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset All</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 7. Bottom Quick Footer with NLP stats */}
            <div className="p-3 sm:p-3.5 bg-black/50 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-neutral-300">
                  Smart Audio Indexing • {mediaList.length} Tracks Ready
                </span>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <span className="hidden sm:inline text-neutral-500">
                  Type <code className="text-cyan-300 bg-white/5 px-1 py-0.5 rounded">140</code>, <code className="text-cyan-300 bg-white/5 px-1 py-0.5 rounded">c minor</code>, <code className="text-cyan-300 bg-white/5 px-1 py-0.5 rounded">#trap</code>
                </span>
                <button
                  type="button"
                  onClick={() => setIsSearchPopoutOpen(false)}
                  className="font-bold text-neutral-300 hover:text-white transition-colors"
                >
                  Done (Esc)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
