import React from 'react';
import { useMedia } from '../context/MediaContext';
import { APP_THEMES } from '../theme/themes';
import { motion } from 'motion/react';
import { 
  X, 
  Check, 
  Palette, 
  Sparkles, 
  Sun, 
  Moon, 
  Zap, 
  Radio, 
  Flame, 
  Disc, 
  Layers, 
  Terminal 
} from 'lucide-react';

export const ThemeModal: React.FC = () => {
  const { 
    isThemeModalOpen, 
    setIsThemeModalOpen, 
    currentTheme, 
    setCurrentTheme, 
    themeConfig 
  } = useMedia();

  if (!isThemeModalOpen) return null;

  const themes = Object.values(APP_THEMES);

  return (
    <div
      id="theme-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={() => setIsThemeModalOpen(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-[#121216] border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl bg-white/5 ${themeConfig.accentIconColor}`}>
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Audio Aesthetic & Visual Worlds</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-neutral-300 font-semibold">
                  {themes.length} Unique Themes
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Alters full application palette, waveforms, glow vectors, borders, and tactile icons
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsThemeModalOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Themes Grid */}
        <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pr-1 custom-scrollbar">
          {themes.map((t) => {
            const isSelected = currentTheme === t.id;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setCurrentTheme(t.id);
                }}
                className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group h-full ${
                  isSelected
                    ? `${t.borderColor} ${t.activeGlow} bg-white/10 shadow-2xl`
                    : 'border-white/10 bg-[#17171f] hover:border-white/25 hover:bg-[#1e1e28]'
                }`}
              >
                <div>
                  {/* Color Swatch & Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-7 h-7 rounded-xl shadow-inner border border-white/20 flex items-center justify-center"
                        style={{ backgroundColor: t.previewColor }}
                      >
                        {isSelected ? (
                          <Check className="w-4 h-4 text-black stroke-[3]" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-black/40" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-white">
                        {t.name}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-neutral-300">
                      {t.badge}
                    </span>
                  </div>

                  {/* Waveform Color Preview Bar */}
                  <div className="h-6 w-full rounded-lg bg-black/50 p-1 mb-2 flex items-center justify-between gap-0.5 overflow-hidden">
                    {[40, 75, 55, 90, 30, 85, 60, 95, 45, 70, 100, 65, 50, 80, 40].map((h, idx) => (
                      <div
                        key={idx}
                        className="flex-1 rounded-full transition-all duration-300 group-hover:scale-y-110"
                        style={{
                          height: `${h}%`,
                          backgroundColor: isSelected ? t.previewColor : 'rgba(255,255,255,0.25)'
                        }}
                      />
                    ))}
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-neutral-500 font-mono font-medium">#{t.id}</span>
                  <span className={`font-bold transition-colors ${isSelected ? t.accentTextColor : 'text-neutral-400'}`}>
                    {isSelected ? 'Active Aesthetic' : 'Apply Aesthetic'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Aesthetics apply dynamically across the entire studio interface</span>
          </div>
          <button
            type="button"
            onClick={() => setIsThemeModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-md"
          >
            Apply & Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
