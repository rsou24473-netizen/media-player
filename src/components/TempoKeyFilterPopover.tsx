import React, { useState, useEffect } from 'react';
import { useMedia } from '../context/MediaContext';
import { motion, AnimatePresence } from 'motion/react';
import { Check, RotateCcw, Activity, Music, CornerDownLeft, X } from 'lucide-react';

const MUSICAL_KEYS = [
  'All Keys',
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

const TEMPO_PRESETS = [
  { label: 'All Tempos', min: null, max: null },
  { label: 'Slow (< 100 BPM)', min: 40, max: 100 },
  { label: 'Mid (100–130 BPM)', min: 100, max: 130 },
  { label: 'Fast (130+ BPM)', min: 130, max: 220 },
  { label: '120 BPM', min: 120, max: 120 },
  { label: '130 BPM', min: 130, max: 130 },
  { label: '140 BPM', min: 140, max: 140 },
  { label: '150 BPM', min: 150, max: 150 },
  { label: '160 BPM', min: 160, max: 160 }
];

interface TempoKeyPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  align?: 'left' | 'right';
}

export const TempoKeyFilterPopover: React.FC<TempoKeyPopoverProps> = ({ 
  isOpen, 
  onClose,
  align = 'left' 
}) => {
  const { filters, setFilters, themeConfig } = useMedia();
  const [manualBpmInput, setManualBpmInput] = useState('');

  useEffect(() => {
    if (filters.minBpm && filters.maxBpm && filters.minBpm === filters.maxBpm) {
      setManualBpmInput(String(filters.minBpm));
    } else if (filters.minBpm && filters.maxBpm) {
      setManualBpmInput(`${filters.minBpm}-${filters.maxBpm}`);
    } else if (filters.minBpm) {
      setManualBpmInput(`${filters.minBpm}+`);
    } else if (filters.maxBpm) {
      setManualBpmInput(`<${filters.maxBpm}`);
    } else {
      setManualBpmInput('');
    }
  }, [filters.minBpm, filters.maxBpm]);

  const handleApplyManualTempo = () => {
    const raw = manualBpmInput.trim();
    if (!raw) {
      setFilters(prev => ({ ...prev, minBpm: null, maxBpm: null }));
      return;
    }

    if (raw.includes('-')) {
      const [minStr, maxStr] = raw.split('-');
      const min = parseInt(minStr, 10);
      const max = parseInt(maxStr, 10);
      setFilters(prev => ({
        ...prev,
        minBpm: !isNaN(min) && min > 0 ? min : null,
        maxBpm: !isNaN(max) && max > 0 ? max : null
      }));
      return;
    }

    const singleBpm = parseInt(raw.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(singleBpm) && singleBpm > 0) {
      setFilters(prev => ({
        ...prev,
        minBpm: singleBpm,
        maxBpm: singleBpm
      }));
    }
  };

  const handleSelectKey = (k: string) => {
    setFilters(prev => ({
      ...prev,
      selectedKey: k === 'All Keys' ? null : (prev.selectedKey === k ? null : k)
    }));
  };

  const handleSelectTempo = (preset: typeof TEMPO_PRESETS[number]) => {
    setFilters(prev => ({
      ...prev,
      minBpm: preset.min,
      maxBpm: preset.max
    }));
  };

  const handleClearAll = () => {
    setFilters(prev => ({
      ...prev,
      selectedKey: null,
      minBpm: null,
      maxBpm: null
    }));
    setManualBpmInput('');
  };

  const isTempoPresetActive = (p: typeof TEMPO_PRESETS[number]) => {
    if (p.min === null && p.max === null) {
      return filters.minBpm === null && filters.maxBpm === null;
    }
    return filters.minBpm === p.min && filters.maxBpm === p.max;
  };

  const hasAnyActive = Boolean(filters.selectedKey || filters.minBpm || filters.maxBpm);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className={`absolute top-full mt-1.5 ${align === 'right' ? 'right-0' : 'left-0'} z-[70] bg-[#131417]/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-3 text-white min-w-[380px] border border-white/10`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Key & Tempo side-by-side dropdown content with NO box around it */}
          <div className="grid grid-cols-2 gap-3">
            {/* Column 1: Key Signature */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 px-2 py-1 mb-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                <Music className={`w-3 h-3 ${themeConfig.accentIconColor || 'text-cyan-400'}`} />
                <span>Key</span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
                {MUSICAL_KEYS.map((k) => {
                  const isSelected = (k === 'All Keys' && !filters.selectedKey) || filters.selectedKey === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleSelectKey(k)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                        isSelected
                          ? `${themeConfig.accentTextColor || 'text-cyan-400'} font-bold bg-white/10`
                          : 'text-neutral-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate">{k}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Tempo / BPM with Manual Typing Field */}
            <div className="flex flex-col border-l border-white/5 pl-3">
              <div className="flex items-center gap-1.5 px-2 py-1 mb-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                <Activity className={`w-3 h-3 ${themeConfig.accentIconColor || 'text-cyan-400'}`} />
                <span>Tempo (BPM)</span>
              </div>

              {/* Manual Tempo Input Box */}
              <div className="mb-2 p-1.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <label className="text-[9px] font-mono uppercase text-neutral-400 block px-1">
                  Type Tempo
                </label>
                <div className="flex items-center gap-1">
                  <div className="relative flex-1">
                    <input
                      id="manual-tempo-bpm-input"
                      type="text"
                      placeholder="e.g. 140 or 120-140"
                      value={manualBpmInput}
                      onChange={(e) => setManualBpmInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyManualTempo();
                        }
                      }}
                      className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-lg pl-2 pr-6 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none font-mono"
                    />
                    {manualBpmInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setManualBpmInput('');
                          setFilters(p => ({ ...p, minBpm: null, maxBpm: null }));
                        }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    id="manual-tempo-apply-btn"
                    onClick={handleApplyManualTempo}
                    title="Apply typed tempo"
                    className="px-2 py-1 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black text-[11px] font-bold transition-all flex items-center gap-0.5 shrink-0"
                  >
                    <span>Set</span>
                    <CornerDownLeft className="w-2.5 h-2.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
                {TEMPO_PRESETS.map((p) => {
                  const isSelected = isTempoPresetActive(p);
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleSelectTempo(p)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                        isSelected
                          ? `${themeConfig.accentTextColor || 'text-cyan-400'} font-bold bg-white/10`
                          : 'text-neutral-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate">{p.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Clear if either Key or Tempo is active */}
          {hasAnyActive && (
            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between px-2">
              <span className="text-[10px] text-neutral-400 font-mono">
                {filters.selectedKey || 'Any Key'} • {
                  filters.minBpm && filters.maxBpm && filters.minBpm === filters.maxBpm
                    ? `${filters.minBpm} BPM`
                    : filters.minBpm || filters.maxBpm
                    ? `${filters.minBpm || 40}-${filters.maxBpm || 220} BPM`
                    : 'Any BPM'
                }
              </span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-semibold text-neutral-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
