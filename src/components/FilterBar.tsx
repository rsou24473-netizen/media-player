import React, { useState } from 'react';
import { useMedia } from '../context/MediaContext';
import { TagsFilterPopover } from './TagsFilterPopover';
import { TempoKeyFilterPopover } from './TempoKeyFilterPopover';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tag as TagIcon, 
  Activity, 
  Music, 
  Check, 
  RotateCcw, 
  ChevronDown,
  Layers,
  Sliders
} from 'lucide-react';
import { TrackKind } from '../types';

const TYPE_OPTIONS: TrackKind[] = [
  'No type',
  'Beat',
  'Song',
  'Loop'
];

export const FilterBar: React.FC = () => {
  const {
    filters,
    setFilters,
    filteredMedia,
    mediaList,
    themeConfig,
    setIsEqOpen
  } = useMedia();

  const [activeDropdown, setActiveDropdown] = useState<'tags' | 'key_tempo' | 'type' | null>(null);

  const activeTags = filters.selectedCustomTags || (filters.selectedCustomTag ? [filters.selectedCustomTag] : []);

  const getTagsLabel = () => {
    if (activeTags.length === 0) return 'Tags';
    if (activeTags.length === 1) return `#${activeTags[0]}`;
    return `${activeTags.length} Tags Stacked`;
  };

  const isAllActive = 
    !filters.selectedType && 
    !filters.selectedKey && 
    !filters.minBpm && 
    !filters.maxBpm && 
    activeTags.length === 0 && 
    filters.searchQuery === '';

  const getKeyTempoLabel = () => {
    const hasKey = Boolean(filters.selectedKey);
    const hasTempo = Boolean(filters.minBpm || filters.maxBpm);
    const tempoStr = (filters.minBpm && filters.maxBpm && filters.minBpm === filters.maxBpm)
      ? `${filters.minBpm} BPM`
      : `${filters.minBpm || 60}-${filters.maxBpm || 200} BPM`;

    if (hasKey && hasTempo) {
      return `${filters.selectedKey} • ${tempoStr}`;
    }
    if (hasKey) return filters.selectedKey!;
    if (hasTempo) return tempoStr;
    return 'Key & Tempo';
  };

  const handleSelectAll = () => {
    setFilters(prev => ({
      ...prev,
      selectedType: null,
      selectedKey: null,
      minBpm: null,
      maxBpm: null,
      selectedCustomTag: null,
      selectedCustomTags: [],
      searchQuery: ''
    }));
    setActiveDropdown(null);
  };

  const hasActiveFilters = 
    Boolean(filters.selectedType) || 
    Boolean(filters.selectedKey) || 
    Boolean(filters.minBpm) || 
    Boolean(filters.maxBpm) || 
    activeTags.length > 0;

  return (
    <div 
      id="global-library-filter-bar"
      className={`px-6 py-2.5 ${themeConfig.filterBarBg || themeConfig.sidebarBg || 'bg-[#121418]'} border-b ${themeConfig.borderColor || 'border-white/10'} flex items-center justify-between gap-3 relative z-30 select-none transition-colors duration-300`}
      onClick={() => setActiveDropdown(null)}
    >
      {/* Left side: Navigation / Filter Tabs (ALL, TAGS, KEY & TEMPO, TYPE) */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* 1. ALL TAB */}
        <button
          id="filter-tab-all"
          type="button"
          onClick={handleSelectAll}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            isAllActive
              ? `${themeConfig.accentColor} text-black shadow-md ${themeConfig.activeGlow || ''}`
              : `bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10`
          }`}
        >
          <span>All</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            isAllActive ? 'bg-black/20 text-black font-extrabold' : 'bg-white/10 text-neutral-400'
          }`}>
            {mediaList.length}
          </span>
        </button>

        {/* 2. TAGS TAB */}
        <div className="relative">
          <button
            id="filter-tab-tags"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'tags' ? null : 'tags');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTags.length > 0
                ? `${themeConfig.accentColor} text-black font-bold shadow-md ${themeConfig.activeGlow || ''}`
                : activeDropdown === 'tags'
                ? `bg-white/15 text-white`
                : `bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10`
            }`}
          >
            <TagIcon className="w-3.5 h-3.5" />
            <span>{getTagsLabel()}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'tags' ? 'rotate-180' : ''}`} />
          </button>

          <TagsFilterPopover
            isOpen={activeDropdown === 'tags'}
            onClose={() => setActiveDropdown(null)}
          />
        </div>

        {/* 3. KEY & TEMPO (BPM) FILTER TAB - COMBINED TOGETHER */}
        <div className="relative">
          <button
            id="filter-tab-key-tempo"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'key_tempo' ? null : 'key_tempo');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              filters.selectedKey || filters.minBpm || filters.maxBpm
                ? `${themeConfig.accentColor} text-black font-bold shadow-md ${themeConfig.activeGlow || ''}`
                : activeDropdown === 'key_tempo'
                ? `bg-white/15 text-white`
                : `bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10`
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{getKeyTempoLabel()}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'key_tempo' ? 'rotate-180' : ''}`} />
          </button>

          <TempoKeyFilterPopover
            isOpen={activeDropdown === 'key_tempo'}
            onClose={() => setActiveDropdown(null)}
          />
        </div>

        {/* 4. TYPE FILTER TAB */}
        <div className="relative">
          <button
            id="filter-tab-type"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'type' ? null : 'type');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              filters.selectedType
                ? `${themeConfig.accentColor} text-black font-bold shadow-md ${themeConfig.activeGlow || ''}`
                : activeDropdown === 'type'
                ? `bg-white/15 text-white`
                : `bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10`
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{filters.selectedType || 'Type'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'type' ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {activeDropdown === 'type' && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                className="absolute left-0 top-full mt-1.5 w-44 bg-[#131417]/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-1.5 z-[70] space-y-0.5 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header Label */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  <Layers className={`w-3 h-3 ${themeConfig.accentIconColor || 'text-cyan-400'}`} />
                  <span>Type</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFilters(p => ({ ...p, selectedType: null }));
                    setActiveDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                    !filters.selectedType 
                      ? `${themeConfig.accentTextColor || 'text-cyan-400'} font-bold bg-white/10` 
                      : `text-neutral-300 hover:text-white hover:bg-white/5`
                  }`}
                >
                  <span>All Types</span>
                  {!filters.selectedType && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>
                {TYPE_OPTIONS.filter(t => t !== 'No type').map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setFilters(p => ({ ...p, selectedType: t }));
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                      filters.selectedType === t 
                        ? `${themeConfig.accentTextColor || 'text-cyan-400'} font-bold bg-white/10` 
                        : `text-neutral-300 hover:text-white hover:bg-white/5`
                    }`}
                  >
                    <span>{t}</span>
                    {filters.selectedType === t && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleSelectAll}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs ${themeConfig.accentTextColor} hover:underline font-bold transition-all`}
            title="Clear all active filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Right side: Results Counter & Equalizer Quick Trigger */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-neutral-400 font-mono">
          Showing <strong className={`${themeConfig.accentTextColor} font-bold`}>{filteredMedia.length}</strong> of {mediaList.length} items
        </span>

        <button
          type="button"
          onClick={() => setIsEqOpen(true)}
          className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 border ${themeConfig.borderColor} text-neutral-300 hover:text-white transition-colors`}
          title="Open Audio Equalizer"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
