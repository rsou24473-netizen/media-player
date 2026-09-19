import React from 'react';
import { useMedia } from '../context/MediaContext';
import { EQ_FREQUENCIES, EQ_PRESETS } from '../audio/audioEngine';
import { VisualizerCanvas } from './VisualizerCanvas';
import { Sliders, RotateCcw, Volume2, Music2, X } from 'lucide-react';

export const EqualizerModal: React.FC = () => {
  const {
    isEqOpen,
    setIsEqOpen,
    eqPreset,
    eqBands,
    preampGain,
    stereoPan,
    setEqBandGain,
    applyEqPreset,
    setPreampGainValue,
    setStereoPanValue,
    crossfadeDuration,
    setCrossfadeDuration,
    isCrossfadeEnabled,
    setIsCrossfadeEnabled
  } = useMedia();

  if (!isEqOpen) return null;

  const bandLabels = ['60 Hz', '250 Hz', '1 kHz', '4 kHz', '12 kHz'];
  const bandDescriptions = ['Sub / 808', 'Bass / Kick', 'Mids / Body', 'High Mids / Vocals', 'Treble / Air'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        id="equalizer-modal-card"
        className="w-full max-w-xl rounded-2xl bg-[#18181b] border border-white/10 shadow-2xl p-6 text-white space-y-6"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Audio Equalizer & FX</h2>
              <p className="text-xs text-neutral-400">5-Band Web Audio Parametric Filter Node Chain</p>
            </div>
          </div>
          <button
            id="close-eq-modal-btn"
            onClick={() => setIsEqOpen(false)}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Visualizer + Preset Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-[#101012] p-4 rounded-xl border border-white/5">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Sound Profile Preset
            </label>
            <div className="relative">
              <select
                id="eq-preset-select"
                value={eqPreset.id}
                onChange={(e) => {
                  const preset = EQ_PRESETS.find(p => p.id === e.target.value);
                  if (preset) applyEqPreset(preset);
                }}
                className="w-full bg-[#202024] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {EQ_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Select tailored curves optimized for 808 trap, vocal clarity, or studio monitoring.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="text-[11px] font-mono text-neutral-400 mb-1 flex items-center gap-1.5">
              <Music2 className="w-3.5 h-3.5 text-blue-400" /> Real-time Spectrum Output
            </div>
            <VisualizerCanvas width={220} height={64} className="bg-black/40 border border-white/5" />
          </div>
        </div>

        {/* 5-Band Sliders Grid */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Frequency Bands (-12dB to +12dB)
            </span>
            <button
              id="reset-eq-btn"
              onClick={() => {
                const flatPreset = EQ_PRESETS[0];
                applyEqPreset(flatPreset);
              }}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded bg-white/5 hover:bg-white/10"
            >
              <RotateCcw className="w-3 h-3" /> Reset Flat
            </button>
          </div>

          <div className="grid grid-cols-5 gap-3 bg-[#121215] p-5 rounded-xl border border-white/5">
            {EQ_FREQUENCIES.map((freq, index) => {
              const currentGain = eqBands[index];
              return (
                <div key={freq} className="flex flex-col items-center space-y-3">
                  <span className="text-xs font-mono font-medium text-blue-400">
                    {currentGain > 0 ? `+${currentGain}` : currentGain} dB
                  </span>
                  
                  {/* Vertical Slider Wrapper */}
                  <div className="h-36 flex items-center justify-center py-2">
                    <input
                      id={`eq-band-${index}`}
                      type="range"
                      min="-12"
                      max="12"
                      step="0.5"
                      value={currentGain}
                      onChange={(e) => setEqBandGain(index, parseFloat(e.target.value))}
                      style={{
                        writingMode: 'vertical-lr',
                        direction: 'rtl',
                        accentColor: '#3b82f6'
                      }}
                      className="h-32 w-2 cursor-pointer appearance-none bg-neutral-800 rounded-lg"
                    />
                  </div>

                  <div className="text-center">
                    <div className="text-xs font-bold text-white">{bandLabels[index]}</div>
                    <div className="text-[10px] text-neutral-500">{bandDescriptions[index]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preamp, Stereo Balance & Crossfade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/10">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-neutral-400 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" /> Preamp Boost
              </span>
              <span className="font-mono text-neutral-300">{(preampGain * 100).toFixed(0)}%</span>
            </div>
            <input
              id="preamp-gain-slider"
              type="range"
              min="0.2"
              max="2.0"
              step="0.05"
              value={preampGain}
              onChange={(e) => setPreampGainValue(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-neutral-400">Stereo Balance</span>
              <span className="font-mono text-neutral-300">
                {stereoPan === 0 ? 'Center' : stereoPan < 0 ? `L ${(Math.abs(stereoPan) * 100).toFixed(0)}%` : `R ${(stereoPan * 100).toFixed(0)}%`}
              </span>
            </div>
            <input
              id="stereo-pan-slider"
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={stereoPan}
              onChange={(e) => setStereoPanValue(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-neutral-400">Crossfade ({crossfadeDuration}s)</span>
              <button
                type="button"
                onClick={() => setIsCrossfadeEnabled(!isCrossfadeEnabled)}
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isCrossfadeEnabled ? 'bg-blue-500 text-white' : 'bg-neutral-700 text-neutral-400'
                }`}
              >
                {isCrossfadeEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <input
              id="crossfade-eq-slider"
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={crossfadeDuration}
              onChange={(e) => setCrossfadeDuration(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
