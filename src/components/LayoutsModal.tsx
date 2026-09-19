import React, { useState } from 'react';
import { useMedia } from '../context/MediaContext';
import { APP_LAYOUTS } from '../data/layoutsData';
import { LayoutMode } from '../types';
import { motion } from 'motion/react';
import { 
  X, 
  Check, 
  Layout, 
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
  Sparkles
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

export const LayoutsModal: React.FC = () => {
  const { 
    isLayoutModalOpen, 
    setIsLayoutModalOpen, 
    activeLayout, 
    setActiveLayout, 
    themeConfig 
  } = useMedia();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isLayoutModalOpen) return null;

  const layouts = Object.values(APP_LAYOUTS);
  const categories = ['all', 'Experimental 3D', 'Editorial & Grid', 'Cinematic & Immersive'];

  const filteredLayouts = selectedCategory === 'all'
    ? layouts
    : layouts.filter(l => l.category === selectedCategory);

  return (
    <div
      id="layouts-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={() => setIsLayoutModalOpen(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-[#131317] border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl bg-white/5 ${themeConfig.accentIconColor}`}>
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Studio Layout Architectures</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-neutral-300 font-semibold">
                  {layouts.length} Modes
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Switch dynamically between 3D Spatial rooms, reactive visualizers, and editorial spreads
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLayoutModalOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 pt-4 pb-2 overflow-x-auto custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-white text-black shadow-md'
                  : 'bg-[#1a1a22] text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat === 'all' ? 'All Architectures' : cat}
            </button>
          ))}
        </div>

        {/* Layouts Grid */}
        <div className="flex-1 overflow-y-auto py-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pr-1 custom-scrollbar">
          {filteredLayouts.map((l) => {
            const isSelected = activeLayout === l.id;
            const Icon = ICON_MAP[l.iconName] || Layout;

            return (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setActiveLayout(l.id);
                  setIsLayoutModalOpen(false);
                }}
                className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group h-full ${
                  isSelected
                    ? 'border-white bg-white/10 ring-2 ring-white/40 shadow-xl'
                    : 'border-white/10 bg-[#191920] hover:border-white/30 hover:bg-[#202028]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`p-2 rounded-xl transition-colors ${
                      isSelected ? 'bg-white text-black' : 'bg-white/5 text-neutral-300 group-hover:text-white'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-neutral-400'
                      }`}>
                        {l.badge}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className={`text-xs font-bold mb-1 transition-colors ${isSelected ? 'text-white' : 'text-neutral-200 group-hover:text-white'}`}>
                    {l.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {l.description}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-500 font-medium">
                  <span>{l.category}</span>
                  <span className={`group-hover:translate-x-0.5 transition-transform font-bold ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
                    {isSelected ? 'Active Now' : 'Select →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Select any architecture to instantly re-render the workspace in real-time</span>
          </div>
          <button
            type="button"
            onClick={() => setIsLayoutModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-md"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
