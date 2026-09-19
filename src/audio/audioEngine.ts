import { EQPreset } from '../types';

export const EQ_FREQUENCIES = [60, 250, 1000, 4000, 12000] as const;

export const EQ_PRESETS: EQPreset[] = [
  { id: 'flat', name: 'Flat / Default', gains: [0, 0, 0, 0, 0] },
  { id: 'bass-boost', name: 'Bass Boost (808s)', gains: [7, 4, 0, 1, 2] },
  { id: 'sub-heavy', name: 'Sub Heavy Trap', gains: [9, 6, -2, 2, 4] },
  { id: 'vocal-booster', name: 'Vocal / Dialogue', gains: [-2, 1, 5, 4, 1] },
  { id: 'hiphop', name: 'Hip Hop / Punch', gains: [6, 3, 0, 2, 4] },
  { id: 'electronic', name: 'Electronic / Synth', gains: [5, 2, -1, 3, 6] },
  { id: 'rock', name: 'Rock / Guitar', gains: [4, 2, 1, 3, 5] },
  { id: 'acoustic', name: 'Acoustic / Warm', gains: [2, 3, 1, 2, 3] },
  { id: 'nightcore', name: 'Nightcore / Bright', gains: [-3, -1, 2, 6, 8] },
];

export interface AudioDeck {
  el: HTMLAudioElement;
  sourceNode: MediaElementAudioSourceNode | null;
  gainNode: GainNode;
  id: number;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private decks: AudioDeck[] = [];
  private activeDeckIndex = 0;
  private isFading = false;
  private fadeTimeoutId: any = null;

  // Processing chain nodes
  private deckMixGain: GainNode | null = null;
  private preampGainNode: GainNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private pannerNode: StereoPannerNode | null = null;
  private masterGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  // Video element integration
  private videoSourceNode: MediaElementAudioSourceNode | null = null;
  private videoGainNode: GainNode | null = null;

  private isInitialized = false;

  // Settings
  public crossfadeDuration = 6; // default 6s
  public isCrossfadeEnabled = true;

  constructor() {
    // Lazy setup audio context upon first user interaction
  }

  public getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    return this.ctx;
  }

  public init() {
    if (this.isInitialized) return;

    try {
      const ctx = this.getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // 1. Deck mix gain
      this.deckMixGain = ctx.createGain();
      this.deckMixGain.gain.value = 1.0;

      // 2. Preamp gain
      this.preampGainNode = ctx.createGain();
      this.preampGainNode.gain.value = 1.0;

      // 3. 5-band EQ
      this.filters = EQ_FREQUENCIES.map((freq, index) => {
        const filter = ctx.createBiquadFilter();
        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        filter.Q.value = 1.0;
        return filter;
      });

      // 4. Stereo Panner
      if (ctx.createStereoPanner) {
        this.pannerNode = ctx.createStereoPanner();
        this.pannerNode.pan.value = 0;
      }

      // 5. Master Gain
      this.masterGain = ctx.createGain();
      this.masterGain.gain.value = 0.85;

      // 6. Analyser
      this.analyserNode = ctx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Connect Post-Processing Chain:
      // deckMixGain -> preampGainNode -> Filter[0..4] -> Panner -> masterGain -> analyser -> destination
      let node: AudioNode = this.deckMixGain;
      node.connect(this.preampGainNode);
      node = this.preampGainNode;

      for (const filter of this.filters) {
        node.connect(filter);
        node = filter;
      }

      if (this.pannerNode) {
        node.connect(this.pannerNode);
        node = this.pannerNode;
      }

      node.connect(this.masterGain);
      this.masterGain.connect(this.analyserNode);
      this.analyserNode.connect(ctx.destination);

      // Create Decks (Deck 0 and Deck 1)
      this.decks = [this.createDeck(0), this.createDeck(1)];
      this.decks[0].gainNode.gain.value = 1.0;
      this.decks[1].gainNode.gain.value = 0.0;
      this.activeDeckIndex = 0;

      this.isInitialized = true;
    } catch (err) {
      console.warn('AudioEngine initialization caught:', err);
    }
  }

  private createDeck(id: number): AudioDeck {
    const ctx = this.getAudioContext();
    const el = new Audio();
    el.preload = 'auto';

    const gainNode = ctx.createGain();
    let sourceNode: MediaElementAudioSourceNode | null = null;
    try {
      sourceNode = ctx.createMediaElementSource(el);
      sourceNode.connect(gainNode);
      gainNode.connect(this.deckMixGain!);
    } catch (e) {
      console.warn(`Deck ${id} media element source creation error:`, e);
    }

    return { el, sourceNode, gainNode, id };
  }

  public resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getActiveDeck(): AudioDeck | null {
    if (this.decks.length === 0) return null;
    return this.decks[this.activeDeckIndex];
  }

  public getInactiveDeck(): AudioDeck | null {
    if (this.decks.length === 0) return null;
    return this.decks[1 - this.activeDeckIndex];
  }

  public getActiveDeckIndex(): number {
    return this.activeDeckIndex;
  }

  public getDecks(): AudioDeck[] {
    return this.decks;
  }

  public getIsFading(): boolean {
    return this.isFading;
  }

  /**
   * Generates equal-power curves for smooth seamless crossfading without volume dips
   */
  private generateEqualPowerCurves(points = 64) {
    const curveOut = new Float32Array(points);
    const curveIn = new Float32Array(points);

    for (let i = 0; i < points; i++) {
      const t = i / (points - 1);
      // Cosine curve for outgoing: 1 -> 0
      curveOut[i] = Math.cos((t * Math.PI) / 2);
      // Sine curve for incoming: 0 -> 1
      curveIn[i] = Math.sin((t * Math.PI) / 2);
    }

    return { curveOut, curveIn };
  }

  /**
   * Crossfade from active deck to incoming deck with new audio URL
   */
  public crossfadeTo(
    newUrl: string,
    durationOverride?: number,
    onComplete?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      this.init();
      this.resumeContext();

      if (this.decks.length < 2) {
        resolve();
        return;
      }

      const dur = durationOverride !== undefined ? durationOverride : (this.isCrossfadeEnabled ? this.crossfadeDuration : 0);

      // If mid-fade already, cancel previous fade
      if (this.isFading) {
        this.cancelFade();
      }

      const outDeck = this.decks[this.activeDeckIndex];
      const inDeck = this.decks[1 - this.activeDeckIndex];

      // If gapless or 0s fade requested
      if (dur <= 0.08) {
        outDeck.el.pause();
        outDeck.gainNode.gain.value = 0;
        inDeck.el.src = newUrl;
        inDeck.gainNode.gain.value = 1.0;
        inDeck.el.play().catch(() => {});
        this.activeDeckIndex = 1 - this.activeDeckIndex;
        onComplete?.();
        resolve();
        return;
      }

      this.isFading = true;
      inDeck.el.src = newUrl;
      inDeck.el.currentTime = 0;
      inDeck.gainNode.gain.cancelScheduledValues(0);
      inDeck.gainNode.gain.value = 0;

      const playPromise = inDeck.el.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Crossfade incoming deck play caught:', err);
        });
      }

      const now = this.ctx!.currentTime;
      const { curveOut, curveIn } = this.generateEqualPowerCurves(64);

      // Apply equal-power cosine/sine curves
      try {
        outDeck.gainNode.gain.cancelScheduledValues(now);
        outDeck.gainNode.gain.setValueCurveAtTime(curveOut, now, dur);

        inDeck.gainNode.gain.cancelScheduledValues(now);
        inDeck.gainNode.gain.setValueCurveAtTime(curveIn, now, dur);
      } catch {
        // Fallback linear ramps if curve scheduling fails
        outDeck.gainNode.gain.setValueAtTime(outDeck.gainNode.gain.value, now);
        outDeck.gainNode.gain.linearRampToValueAtTime(0, now + dur);

        inDeck.gainNode.gain.setValueAtTime(0, now);
        inDeck.gainNode.gain.linearRampToValueAtTime(1, now + dur);
      }

      this.fadeTimeoutId = setTimeout(() => {
        outDeck.el.pause();
        outDeck.gainNode.gain.cancelScheduledValues(0);
        outDeck.gainNode.gain.value = 0;

        inDeck.gainNode.gain.cancelScheduledValues(0);
        inDeck.gainNode.gain.value = 1.0;

        this.activeDeckIndex = 1 - this.activeDeckIndex;
        this.isFading = false;
        this.fadeTimeoutId = null;

        onComplete?.();
        resolve();
      }, dur * 1000);
    });
  }

  /**
   * Immediately cancels any ongoing fade and snaps active deck to 100% volume
   */
  public cancelFade() {
    if (this.fadeTimeoutId) {
      clearTimeout(this.fadeTimeoutId);
      this.fadeTimeoutId = null;
    }

    if (this.decks.length >= 2 && this.ctx) {
      const now = this.ctx.currentTime;
      const active = this.decks[this.activeDeckIndex];
      const inactive = this.decks[1 - this.activeDeckIndex];

      active.gainNode.gain.cancelScheduledValues(now);
      active.gainNode.gain.setValueAtTime(1.0, now);

      inactive.gainNode.gain.cancelScheduledValues(now);
      inactive.gainNode.gain.setValueAtTime(0, now);
      inactive.el.pause();
    }

    this.isFading = false;
  }

  /**
   * Seeking mid-fade: cancel fade and snap active deck to full volume
   */
  public seek(seconds: number) {
    if (this.isFading) {
      this.cancelFade();
    }
    const active = this.getActiveDeck();
    if (active && active.el) {
      active.el.currentTime = seconds;
    }
  }

  /**
   * Connect video element to the audio graph
   */
  public hookVideoElement(videoEl: HTMLVideoElement) {
    this.init();
    const ctx = this.getAudioContext();
    if (!this.videoGainNode) {
      this.videoGainNode = ctx.createGain();
      this.videoGainNode.gain.value = 1.0;
      this.videoGainNode.connect(this.deckMixGain!);
    }

    if (!this.videoSourceNode) {
      try {
        this.videoSourceNode = ctx.createMediaElementSource(videoEl);
        this.videoSourceNode.connect(this.videoGainNode);
      } catch (e) {
        console.warn('Video source connection error:', e);
      }
    }
  }

  public setEQBand(index: number, gainDb: number) {
    if (this.filters[index]) {
      this.filters[index].gain.setTargetAtTime(gainDb, this.ctx?.currentTime || 0, 0.05);
    }
  }

  public applyPreset(preset: EQPreset) {
    preset.gains.forEach((gain, i) => {
      this.setEQBand(i, gain);
    });
  }

  public setPreampGain(gainVal: number) {
    if (this.preampGainNode) {
      this.preampGainNode.gain.setTargetAtTime(gainVal, this.ctx?.currentTime || 0, 0.05);
    }
  }

  public setStereoPan(pan: number) {
    if (this.pannerNode) {
      this.pannerNode.pan.setTargetAtTime(pan, this.ctx?.currentTime || 0, 0.05);
    }
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx?.currentTime || 0, 0.02);
    }
  }

  public getFrequencyData(): Uint8Array | null {
    if (!this.analyserNode) return null;
    const buffer = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(buffer);
    return buffer;
  }

  public getTimeDomainData(): Uint8Array | null {
    if (!this.analyserNode) return null;
    const buffer = new Uint8Array(this.analyserNode.fftSize);
    this.analyserNode.getByteTimeDomainData(buffer);
    return buffer;
  }

  public async computeWaveform(blobOrBuffer: Blob | ArrayBuffer, samples = 50): Promise<number[]> {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const offlineCtx = new AudioCtx();
      let arrayBuffer: ArrayBuffer;

      if (blobOrBuffer instanceof Blob) {
        arrayBuffer = await blobOrBuffer.arrayBuffer();
      } else {
        arrayBuffer = blobOrBuffer;
      }

      const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);
      const rawData = audioBuffer.getChannelData(0);
      const blockSize = Math.floor(rawData.length / samples);
      const peaks: number[] = [];

      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j] || 0);
        }
        peaks.push(Math.min(1, (sum / blockSize) * 2.5));
      }

      offlineCtx.close();
      return peaks;
    } catch (e) {
      return Array.from({ length: samples }, () => Math.random() * 0.7 + 0.2);
    }
  }
}

export const audioEngine = new AudioEngine();
