import React from 'react';
import { useMedia } from '../context/MediaContext';
import { Keyboard, X } from 'lucide-react';

export const KeyboardShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = useMedia();

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: '⌘K or /', action: 'Pop out Global Search & Tag Filters' },
    { key: 'Space', action: 'Play / Pause media' },
    { key: '→ / ←', action: 'Seek forward / backward 5s (Shift for 15s)' },
    { key: '↑ / ↓', action: 'Increase / decrease master volume' },
    { key: 'M', action: 'Mute / unmute audio' },
    { key: 'F', action: 'Toggle Fullscreen' },
    { key: 'P', action: 'Picture-in-Picture mode (Video)' },
    { key: 'L', action: 'Cycle Repeat Mode (Off / All / One)' },
    { key: 'S', action: 'Toggle Shuffle mode' },
    { key: 'E', action: 'Open 5-Band Equalizer & FX' },
    { key: 'V', action: 'Cycle Visualizer (Spectrum / Bars / Wave / Radial)' },
    { key: 'Shift + N', action: 'Skip to Next Track' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        id="shortcuts-modal-card"
        className="w-full max-w-lg rounded-2xl bg-[#18181b] border border-white/10 shadow-2xl p-6 text-white space-y-6"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Keyboard Shortcuts</h2>
              <p className="text-xs text-neutral-400">High-speed keyboard navigation and studio controls</p>
            </div>
          </div>
          <button
            id="close-shortcuts-modal-btn"
            onClick={() => setIsShortcutsOpen(false)}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[#121215] border border-white/5">
              <span className="text-sm text-neutral-300">{sc.action}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-semibold text-neutral-200 bg-[#27272a] border border-white/10 rounded-md shadow-inner">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-medium text-white transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
