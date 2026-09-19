import React, { useState } from 'react';
import { useMedia } from '../context/MediaContext';
import { motion, AnimatePresence } from 'motion/react';
import { Tag as TagIcon, Check, Plus, X } from 'lucide-react';

interface TagsFilterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  align?: 'left' | 'right';
}

export const TagsFilterPopover: React.FC<TagsFilterPopoverProps> = ({ 
  isOpen, 
  onClose,
  align = 'left' 
}) => {
  const { filters, setFilters, allUserTags, addCustomTagGlobal, themeConfig } = useMedia();
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Only the tags the user adds - no default or pre-populated tags
  const tagsList = allUserTags;

  const activeTags = filters.selectedCustomTags || (filters.selectedCustomTag ? [filters.selectedCustomTag] : []);

  const handleSelectTag = (tag: string | null) => {
    if (tag === null) {
      setFilters(prev => ({
        ...prev,
        selectedCustomTag: null,
        selectedCustomTags: []
      }));
    } else {
      setFilters(prev => {
        const current = prev.selectedCustomTags || (prev.selectedCustomTag ? [prev.selectedCustomTag] : []);
        const exists = current.includes(tag);
        const next = exists ? current.filter(t => t !== tag) : [...current, tag];
        return {
          ...prev,
          selectedCustomTag: next.length === 1 ? next[0] : null,
          selectedCustomTags: next
        };
      });
    }
  };

  const handleCreateTag = () => {
    const clean = newTagInput.trim().replace(/^#/, '');
    if (clean) {
      addCustomTagGlobal(clean);
      setFilters(prev => {
        const current = prev.selectedCustomTags || (prev.selectedCustomTag ? [prev.selectedCustomTag] : []);
        const next = current.includes(clean) ? current : [...current, clean];
        return {
          ...prev,
          selectedCustomTag: next.length === 1 ? next[0] : null,
          selectedCustomTags: next
        };
      });
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className={`absolute top-full mt-1.5 ${align === 'right' ? 'right-0' : 'left-0'} z-[70] bg-[#131417]/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-2 text-white min-w-[210px] max-w-[260px] border border-white/10`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Label */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 mb-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            <TagIcon className={`w-3 h-3 ${themeConfig.accentIconColor || 'text-cyan-400'}`} />
            <span>Tags ({tagsList.length})</span>
          </div>

          {/* Tag Items List */}
          <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
            {/* Clear / All Tags option */}
            <button
              type="button"
              onClick={() => handleSelectTag(null)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                activeTags.length === 0
                  ? `${themeConfig.accentTextColor || 'text-cyan-400'} font-bold bg-white/10`
                  : 'text-neutral-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>All Tags (Clear Stack)</span>
              {activeTags.length === 0 && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            </button>

            {tagsList.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-neutral-500 italic">
                No tags added yet.
                <div className="text-[10px] text-neutral-400 not-italic mt-1">
                  Click &ldquo;+ Add Tag&rdquo; below to create one.
                </div>
              </div>
            ) : (
              tagsList.map((tag) => {
                const isSelected = activeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleSelectTag(tag)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                      isSelected
                        ? `${themeConfig.accentTextColor || 'text-cyan-400'} font-bold bg-white/10`
                        : 'text-neutral-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">#{tag}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Quick inline add tag */}
          <div className="mt-1.5 pt-1.5 border-t border-white/5">
            {isAddingTag ? (
              <div className="flex items-center gap-1 px-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="New tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateTag();
                    if (e.key === 'Escape') setIsAddingTag(false);
                  }}
                  autoFocus
                  className="flex-1 bg-white/5 focus:bg-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  className={`px-2 py-1 rounded-lg ${themeConfig.accentColor || 'bg-cyan-400'} text-black text-[11px] font-bold`}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingTag(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingTag(true)}
                className="w-full flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Tag</span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
