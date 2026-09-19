import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { MediaItem, Pack, Playlist, RepeatMode, VisualizerMode, AppUIMode, FilterState, EQPreset, ThemeId, ThemeConfig, LayoutMode, UserProfile } from '../types';
import { APP_THEMES } from '../theme/themes';
import { db, initDatabase } from '../db/indexedDB';
import { audioEngine, EQ_PRESETS } from '../audio/audioEngine';

interface MediaContextType {
  // Playback State
  currentTrack: MediaItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  isBuffering: boolean;
  queue: MediaItem[];
  queueIndex: number;

  // Theme State
  currentTheme: ThemeId;
  setCurrentTheme: (theme: ThemeId) => void;
  themeConfig: ThemeConfig;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;

  // Layout State
  activeLayout: LayoutMode;
  setActiveLayout: (layout: LayoutMode) => void;
  isLayoutModalOpen: boolean;
  setIsLayoutModalOpen: (open: boolean) => void;

  // User Profile & Video Avatar State
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;

  // Streaming & Filename Settings
  losslessStreaming: boolean;
  setLosslessStreaming: (lossless: boolean) => void;
  useOriginalFilenames: boolean;
  setUseOriginalFilenames: (orig: boolean) => void;

  // Hamburger Main Menu Drawer State
  isMainMenuOpen: boolean;
  setIsMainMenuOpen: (open: boolean) => void;

  // Crossfade state
  crossfadeDuration: number;
  setCrossfadeDuration: (dur: number) => void;
  isCrossfadeEnabled: boolean;
  setIsCrossfadeEnabled: (enabled: boolean) => void;
  isFading: boolean;
  
  // Library Data
  mediaList: MediaItem[];
  packs: Pack[];
  playlists: Playlist[];
  filteredMedia: MediaItem[];
  allUserTags: string[];
  addCustomTagGlobal: (tag: string) => void;
  removeCustomTagGlobal: (tag: string) => Promise<void>;
  
  // Pack / Playlist actions
  addTrackToPack: (trackId: string, packId: string) => Promise<void>;
  removeTrackFromPack: (trackId: string, packId: string) => Promise<void>;
  toggleTrackInPack: (trackId: string, packId: string) => Promise<void>;
  createPackAndAddTrack: (title: string, producer: string, trackId?: string) => Promise<string>;
  updatePack: (packId: string, updates: Partial<Pack>) => Promise<void>;
  deletePack: (packId: string) => Promise<void>;
  
  // UI & View State
  uiMode: AppUIMode;
  setUiMode: (mode: AppUIMode) => void;
  visualizerMode: VisualizerMode;
  setVisualizerMode: (mode: VisualizerMode) => void;
  isEqOpen: boolean;
  setIsEqOpen: (open: boolean) => void;
  isNowPlayingOpen: boolean;
  setIsNowPlayingOpen: (open: boolean) => void;
  isImportOpen: boolean;
  setIsImportOpen: (open: boolean) => void;
  isCreatePackOpen: boolean;
  setIsCreatePackOpen: (open: boolean) => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;
  isEditTrackOpen: boolean;
  setIsEditTrackOpen: (open: boolean) => void;
  isSearchPopoutOpen: boolean;
  setIsSearchPopoutOpen: (open: boolean) => void;
  activePackDetailId: string | null;
  setActivePackDetailId: (id: string | null) => void;
  openPackDetail: (packId: string) => void;
  editingTrack: MediaItem | null;
  setEditingTrack: (track: MediaItem | null) => void;
  openEditTrack: (track: MediaItem) => void;
  
  // Toast state
  toastNotification: { title: string; subtitle: string } | null;
  setToastNotification: (t: { title: string; subtitle: string } | null) => void;
  
  // Filters & Search
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  
  // EQ State
  eqPreset: EQPreset;
  eqBands: [number, number, number, number, number];
  preampGain: number;
  stereoPan: number;
  setEqBandGain: (index: number, gain: number) => void;
  applyEqPreset: (preset: EQPreset) => void;
  setPreampGainValue: (val: number) => void;
  setStereoPanValue: (val: number) => void;
  
  // Controls
  playTrack: (track: MediaItem, customQueue?: MediaItem[]) => void;
  togglePlayPause: () => void;
  seek: (seconds: number) => void;
  setVolumeLevel: (volume: number) => void;
  toggleMute: () => void;
  setSpeed: (rate: number) => void;
  nextTrack: (manual?: boolean) => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  addToQueue: (track: MediaItem) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleFavorite: (id: string) => Promise<void>;
  
  // Media element refs
  audioRef: React.RefObject<HTMLAudioElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  activeMediaElement: HTMLMediaElement | null;
  
  // Actions
  importFiles: (files: FileList | File[], targetPackId?: string) => Promise<void>;
  importFromUrl: (url: string, title: string, artist: string, type: 'audio' | 'video') => Promise<void>;
  createPack: (packData: Partial<Pack>, trackIds: string[]) => Promise<string>;
  updateTrack: (id: string, updates: Partial<MediaItem>) => Promise<void>;
  deleteMedia: (id: string) => Promise<void>;
  batchDeleteMedia: (ids: string[]) => Promise<void>;
  batchAddTagToTracks: (trackIds: string[], tag: string) => Promise<void>;
  batchRemoveTagFromTracks: (trackIds: string[], tag: string) => Promise<void>;
  batchAddTracksToPack: (trackIds: string[], packId: string) => Promise<void>;
  triggerPiP: () => Promise<void>;
  triggerFullscreen: () => void;
  clearAllMedia: () => Promise<void>;
}

const defaultFilters: FilterState = {
  searchQuery: '',
  selectedType: null,
  selectedGenre: null,
  selectedMood: null,
  selectedInstrument: null,
  selectedCollaborator: null,
  selectedCustomTag: null,
  selectedCustomTags: [],
  selectedPackId: null,
  selectedKey: null,
  minBpm: null,
  maxBpm: null,
  filterMineOnly: false,
  mediaTypeFilter: 'all',
  sortBy: 'dateAdded',
  sortOrder: 'desc'
};

const MediaContext = createContext<MediaContextType | null>(null);

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  
  const [currentTrack, setCurrentTrack] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [queue, setQueue] = useState<MediaItem[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);

  // Safe localStorage helper
  const safeLocalStorageSet = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`localStorage QuotaExceededError caught for key: ${key}`, e);
    }
  };

  // Theme state
  const [currentTheme, setCurrentThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('offtop_app_theme') as ThemeId;
      return saved && APP_THEMES[saved] ? saved : 'midnight';
    } catch {
      return 'midnight';
    }
  });

  const setCurrentTheme = useCallback((theme: ThemeId) => {
    setCurrentThemeState(theme);
    safeLocalStorageSet('offtop_app_theme', theme);
  }, []);

  const themeConfig = APP_THEMES[currentTheme] || APP_THEMES.midnight;

  // Crossfade
  const [crossfadeDuration, setCrossfadeDurationState] = useState<number>(6);
  const [isCrossfadeEnabled, setIsCrossfadeEnabledState] = useState<boolean>(true);
  const [isFading, setIsFading] = useState<boolean>(false);
  
  // Layout state
  const [activeLayout, setActiveLayoutState] = useState<LayoutMode>(() => {
    try {
      const saved = localStorage.getItem('tessera_app_layout') as LayoutMode;
      return saved || 'music_room_3d';
    } catch {
      return 'music_room_3d';
    }
  });

  const setActiveLayout = useCallback((layout: LayoutMode) => {
    setActiveLayoutState(layout);
    safeLocalStorageSet('tessera_app_layout', layout);
  }, []);

  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);

  // User Profile & Live Moving Video Avatar state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('tessera_user_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      name: 'Jack Producer',
      tag: '@jackbeats',
      bio: 'Analog synth lover & beat curator. Crafting soundscapes in Tessera.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      isVideoAvatar: false
    };
  });

  useEffect(() => {
    try {
      // If avatarUrl is a large base64 data string over 100KB, avoid storing in localStorage to prevent QuotaExceededError
      let profileToSave = userProfile;
      if (userProfile.avatarUrl && userProfile.avatarUrl.length > 50000) {
        profileToSave = {
          ...userProfile,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'
        };
      }
      localStorage.setItem('tessera_user_profile', JSON.stringify(profileToSave));
    } catch (e) {
      console.warn('localStorage quota exceeded while saving user profile:', e);
    }
  }, [userProfile]);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Lossless streaming & Original filenames toggles
  const [losslessStreaming, setLosslessStreamingState] = useState<boolean>(() => {
    return localStorage.getItem('tessera_lossless_streaming') === 'true';
  });

  const setLosslessStreaming = useCallback((lossless: boolean) => {
    setLosslessStreamingState(lossless);
    localStorage.setItem('tessera_lossless_streaming', String(lossless));
  }, []);

  const [useOriginalFilenames, setUseOriginalFilenamesState] = useState<boolean>(() => {
    return localStorage.getItem('tessera_use_orig_filenames') !== 'false';
  });

  const setUseOriginalFilenames = useCallback((orig: boolean) => {
    setUseOriginalFilenamesState(orig);
    localStorage.setItem('tessera_use_orig_filenames', String(orig));
  }, []);

  // UI views & modals
  const [uiMode, setUiMode] = useState<AppUIMode>('offtop');
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('spectrum');
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreatePackOpen, setIsCreatePackOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isEditTrackOpen, setIsEditTrackOpen] = useState(false);
  const [isSearchPopoutOpen, setIsSearchPopoutOpen] = useState(false);
  const [activePackDetailId, setActivePackDetailId] = useState<string | null>(null);
  const [editingTrack, setEditingTrack] = useState<MediaItem | null>(null);

  const openPackDetail = (packId: string) => {
    setActivePackDetailId(packId);
  };
  
  // Toast notification state
  const [toastNotification, setToastNotification] = useState<{ title: string; subtitle: string } | null>({
    title: '1 file ready',
    subtitle: 'life changes Ready'
  });

  const [customTagsList, setCustomTagsList] = useState<string[]>([]);

  const addCustomTagGlobal = useCallback((tag: string) => {
    const clean = tag.trim().replace(/^#/, '');
    if (clean && !customTagsList.includes(clean)) {
      setCustomTagsList(prev => [...prev, clean]);
    }
  }, [customTagsList]);

  const removeCustomTagGlobal = useCallback(async (tag: string) => {
    const clean = tag.trim();
    if (!clean) return;

    setCustomTagsList(prev => prev.filter(t => t !== clean));

    try {
      const affectedMedia = mediaList.filter(m => m.customTags?.includes(clean));
      for (const m of affectedMedia) {
        const updatedTags = (m.customTags || []).filter(t => t !== clean);
        await db.media.update(m.id, { customTags: updatedTags });
      }
    } catch (err) {
      console.warn('Error removing tag from db:', err);
    }

    setMediaList(prev => prev.map(m => {
      if (m.customTags?.includes(clean)) {
        return { ...m, customTags: m.customTags.filter(t => t !== clean) };
      }
      return m;
    }));

    setQueue(prev => prev.map(m => {
      if (m.customTags?.includes(clean)) {
        return { ...m, customTags: m.customTags.filter(t => t !== clean) };
      }
      return m;
    }));

    setCurrentTrack(prev => {
      if (prev && prev.customTags?.includes(clean)) {
        return { ...prev, customTags: prev.customTags.filter(t => t !== clean) };
      }
      return prev;
    });

    setToastNotification({
      title: 'Tag Removed Globally',
      subtitle: `#${clean} deleted from all tracks`
    });
  }, [mediaList]);

  const setCrossfadeDuration = useCallback((dur: number) => {
    setCrossfadeDurationState(dur);
    audioEngine.crossfadeDuration = dur;
  }, []);

  const setIsCrossfadeEnabled = useCallback((enabled: boolean) => {
    setIsCrossfadeEnabledState(enabled);
    audioEngine.isCrossfadeEnabled = enabled;
  }, []);

  const openEditTrack = useCallback((track: MediaItem) => {
    setEditingTrack(track);
    setIsEditTrackOpen(true);
  }, []);
  
  // Filtering
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  
  // EQ State
  const [eqPreset, setEqPreset] = useState<EQPreset>(EQ_PRESETS[0]);
  const [eqBands, setEqBands] = useState<[number, number, number, number, number]>([0, 0, 0, 0, 0]);
  const [preampGain, setPreampGain] = useState<number>(1.0);
  const [stereoPan, setStereoPan] = useState<number>(0);

  // Active element determines if video or audio is hooked
  const activeMediaElement: HTMLMediaElement | null =
    currentTrack?.type === 'video'
      ? videoRef.current
      : (audioEngine.getActiveDeck()?.el || audioRef.current);

  // Load database on start
  const refreshDatabase = useCallback(async () => {
    await initDatabase();
    const allMedia = await db.media.toArray();
    const allPacks = await db.packs.toArray();
    const allPlaylists = await db.playlists.toArray();
    
    setMediaList(allMedia);
    setPacks(allPacks);
    setPlaylists(allPlaylists);

    // Collect initial custom tags
    const tags = Array.from(new Set(allMedia.flatMap(m => m.customTags || [])));
    setCustomTagsList(tags);

    if (allMedia.length > 0) {
      setCurrentTrack(prev => prev || allMedia[0]);
      setQueue(prev => prev.length > 0 ? prev : allMedia);
      setDuration(prev => prev || allMedia[0].duration || 180);
    }
  }, []);

  useEffect(() => {
    refreshDatabase();
  }, [refreshDatabase]);

  // Sync with audio engine decks
  useEffect(() => {
    audioEngine.init();
    const decks = audioEngine.getDecks();

    const handleTimeUpdate = (e: Event) => {
      const el = e.target as HTMLAudioElement;
      const activeDeck = audioEngine.getActiveDeck();
      if (!activeDeck || el !== activeDeck.el) return;

      const time = el.currentTime;
      const dur = el.duration || duration;
      setCurrentTime(time);
      setIsFading(audioEngine.getIsFading());

      // Auto Crossfade Trigger near end of track
      const left = dur - time;
      const fadeDur = audioEngine.crossfadeDuration;
      if (
        audioEngine.isCrossfadeEnabled &&
        fadeDur > 0 &&
        left > 0 &&
        left <= fadeDur &&
        !audioEngine.getIsFading() &&
        repeatMode !== 'one'
      ) {
        // Trigger next track crossfade automatically
        triggerAutoCrossfade();
      }
    };

    const handleDurationChange = (e: Event) => {
      const el = e.target as HTMLAudioElement;
      const activeDeck = audioEngine.getActiveDeck();
      if (activeDeck && el === activeDeck.el && !isNaN(el.duration)) {
        setDuration(el.duration);
      }
    };

    const handleEnded = (e: Event) => {
      const el = e.target as HTMLAudioElement;
      const activeDeck = audioEngine.getActiveDeck();
      if (activeDeck && el === activeDeck.el && !audioEngine.getIsFading()) {
        nextTrack(false);
      }
    };

    const handlePlay = (e: Event) => {
      const el = e.target as HTMLAudioElement;
      const activeDeck = audioEngine.getActiveDeck();
      if (activeDeck && el === activeDeck.el) {
        setIsPlaying(true);
      }
    };

    const handlePause = (e: Event) => {
      const el = e.target as HTMLAudioElement;
      const activeDeck = audioEngine.getActiveDeck();
      if (activeDeck && el === activeDeck.el && !audioEngine.getIsFading()) {
        setIsPlaying(false);
      }
    };

    decks.forEach(d => {
      d.el.addEventListener('timeupdate', handleTimeUpdate);
      d.el.addEventListener('durationchange', handleDurationChange);
      d.el.addEventListener('ended', handleEnded);
      d.el.addEventListener('play', handlePlay);
      d.el.addEventListener('pause', handlePause);
    });

    return () => {
      decks.forEach(d => {
        d.el.removeEventListener('timeupdate', handleTimeUpdate);
        d.el.removeEventListener('durationchange', handleDurationChange);
        d.el.removeEventListener('ended', handleEnded);
        d.el.removeEventListener('play', handlePlay);
        d.el.removeEventListener('pause', handlePause);
      });
    };
  }, [duration, repeatMode, queue, queueIndex, isShuffled]);

  // Video element hookup
  useEffect(() => {
    if (videoRef.current) {
      audioEngine.hookVideoElement(videoRef.current);
    }
  }, []);

  // Compute next track item helper
  const getNextTrackItem = useCallback((): { item: MediaItem; index: number } | null => {
    if (queue.length === 0) return null;
    let nextIdx = queueIndex + 1;
    if (isShuffled) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        return null;
      }
    }
    return { item: queue[nextIdx], index: nextIdx };
  }, [queue, queueIndex, isShuffled, repeatMode]);

  // Auto crossfade function
  const triggerAutoCrossfade = useCallback(() => {
    const next = getNextTrackItem();
    if (!next) return;

    setCurrentTrack(next.item);
    setQueueIndex(next.index);
    setIsPlaying(true);
    db.media.update(next.item.id, { playCount: (next.item.playCount || 0) + 1 });

    audioEngine.crossfadeTo(next.item.url, audioEngine.crossfadeDuration, () => {
      setIsFading(false);
    });
  }, [getNextTrackItem]);

  // Handle Play/Pause
  const playTrack = useCallback((track: MediaItem, customQueue?: MediaItem[]) => {
    audioEngine.resumeContext();
    const newQueue = customQueue || mediaList;
    const idx = newQueue.findIndex(t => t.id === track.id);
    
    setCurrentTrack(track);
    setQueue(newQueue);
    setQueueIndex(idx !== -1 ? idx : 0);
    setIsPlaying(true);

    if (track.type === 'video') {
      setUiMode((prev) => (prev === 'now_playing' ? prev : 'video_theater'));
      if (videoRef.current) {
        videoRef.current.src = track.url;
        videoRef.current.play().catch(() => {});
      }
    } else {
      // Audio track: if currently playing another audio track and crossfade enabled, smooth 1.5s skip fade
      if (isPlaying && currentTrack && currentTrack.id !== track.id && isCrossfadeEnabled) {
        audioEngine.crossfadeTo(track.url, Math.min(1.5, crossfadeDuration), () => {
          setIsFading(false);
        });
      } else {
        // Direct playback on active deck
        const activeDeck = audioEngine.getActiveDeck();
        if (activeDeck) {
          activeDeck.el.src = track.url;
          activeDeck.gainNode.gain.cancelScheduledValues(0);
          activeDeck.gainNode.gain.value = 1.0;
          activeDeck.el.currentTime = 0;
          activeDeck.el.play().catch(e => console.warn('Deck play error:', e));
        }
      }
    }

    // Increment play count
    db.media.update(track.id, { playCount: (track.playCount || 0) + 1 });
  }, [mediaList, isPlaying, currentTrack, isCrossfadeEnabled, crossfadeDuration]);

  const togglePlayPause = useCallback(() => {
    audioEngine.resumeContext();
    if (!currentTrack && mediaList.length > 0) {
      playTrack(mediaList[0]);
      return;
    }
    
    setIsPlaying(prev => {
      const next = !prev;
      const activeDeck = audioEngine.getActiveDeck();
      if (currentTrack?.type === 'video' && videoRef.current) {
        if (next) videoRef.current.play().catch(() => {});
        else videoRef.current.pause();
      } else if (activeDeck) {
        if (next) {
          if (!activeDeck.el.src && currentTrack) {
            activeDeck.el.src = currentTrack.url;
          }
          activeDeck.el.play().catch(() => {});
        } else {
          activeDeck.el.pause();
        }
      }
      return next;
    });
  }, [currentTrack, mediaList, playTrack]);

  // Seek
  const seek = useCallback((seconds: number) => {
    if (currentTrack?.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    } else {
      audioEngine.seek(seconds);
      setCurrentTime(seconds);
      setIsFading(false);
    }
  }, [currentTrack]);

  // Volume
  const setVolumeLevel = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    const targetVol = isMuted ? 0 : clamped;
    audioEngine.setMasterVolume(targetVol);
    if (videoRef.current) {
      videoRef.current.volume = targetVol;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      const targetVol = next ? 0 : volume;
      audioEngine.setMasterVolume(targetVol);
      if (videoRef.current) {
        videoRef.current.volume = targetVol;
      }
      return next;
    });
  }, [volume]);

  const setSpeed = useCallback((rate: number) => {
    setPlaybackRate(rate);
    const activeDeck = audioEngine.getActiveDeck();
    if (activeDeck) activeDeck.el.playbackRate = rate;
    if (videoRef.current) videoRef.current.playbackRate = rate;
  }, []);

  // Next / Prev track
  const nextTrack = useCallback((manual = true) => {
    if (queue.length === 0) return;
    
    if (repeatMode === 'one') {
      seek(0);
      const activeDeck = audioEngine.getActiveDeck();
      activeDeck?.el.play().catch(() => {});
      return;
    }

    const next = getNextTrackItem();
    if (next) {
      setQueueIndex(next.index);
      setCurrentTrack(next.item);
      setIsPlaying(true);
      db.media.update(next.item.id, { playCount: (next.item.playCount || 0) + 1 });

      if (next.item.type === 'video') {
        if (videoRef.current) {
          videoRef.current.src = next.item.url;
          videoRef.current.play().catch(() => {});
        }
      } else {
        const fadeSec = manual ? (isCrossfadeEnabled ? 1.5 : 0) : (isCrossfadeEnabled ? crossfadeDuration : 0);
        audioEngine.crossfadeTo(next.item.url, fadeSec, () => {
          setIsFading(false);
        });
      }
    } else {
      setIsPlaying(false);
    }
  }, [queue, repeatMode, seek, getNextTrackItem, isCrossfadeEnabled, crossfadeDuration]);

  const prevTrack = useCallback(() => {
    if (queue.length === 0) return;
    if (currentTime > 3) {
      seek(0);
      return;
    }

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }

    const prevItem = queue[prevIdx];
    if (prevItem) {
      setQueueIndex(prevIdx);
      setCurrentTrack(prevItem);
      setIsPlaying(true);
      
      if (prevItem.type === 'video') {
        if (videoRef.current) {
          videoRef.current.src = prevItem.url;
          videoRef.current.play().catch(() => {});
        }
      } else {
        const fadeSec = isCrossfadeEnabled ? 1.2 : 0;
        audioEngine.crossfadeTo(prevItem.url, fadeSec, () => {
          setIsFading(false);
        });
      }
    }
  }, [queue, queueIndex, currentTime, seek, isCrossfadeEnabled]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => !prev);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const addToQueue = useCallback((track: MediaItem) => {
    setQueue(prev => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
    }
  }, [currentTrack]);

  const toggleFavorite = useCallback(async (id: string) => {
    const item = mediaList.find(m => m.id === id);
    if (!item) return;
    const newFav = !item.isFavorite;
    await db.media.update(id, { isFavorite: newFav });
    setMediaList(prev => prev.map(m => m.id === id ? { ...m, isFavorite: newFav } : m));
    if (currentTrack?.id === id) {
      setCurrentTrack(prev => prev ? { ...prev, isFavorite: newFav } : null);
    }
  }, [mediaList, currentTrack]);

  // Equalizer adjustments
  const setEqBandGain = useCallback((index: number, gainVal: number) => {
    setEqBands(prev => {
      const next = [...prev] as [number, number, number, number, number];
      next[index] = gainVal;
      return next;
    });
    audioEngine.setEQBand(index, gainVal);
  }, []);

  const applyEqPreset = useCallback((preset: EQPreset) => {
    setEqPreset(preset);
    setEqBands([...preset.gains]);
    audioEngine.applyPreset(preset);
  }, []);

  const setPreampGainValue = useCallback((val: number) => {
    setPreampGain(val);
    audioEngine.setPreampGain(val);
  }, []);

  const setStereoPanValue = useCallback((val: number) => {
    setStereoPan(val);
    audioEngine.setStereoPan(val);
  }, []);

  // Media Session API Sync
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || 'Media Player',
        artwork: [
          {
            src: currentTrack.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
      navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack(true));
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        seek(Math.max(0, currentTime - (details.seekOffset || 10)));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        seek(Math.min(duration, currentTime + (details.seekOffset || 10)));
      });
    }
  }, [currentTrack, currentTime, duration, nextTrack, prevTrack, seek]);

  // Picture-in-Picture
  const triggerPiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current && document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP not available:', e);
    }
  };

  // Fullscreen
  const triggerFullscreen = () => {
    const el = currentTrack?.type === 'video' ? videoRef.current : document.documentElement;
    if (!document.fullscreenElement && el) {
      el.requestFullscreen?.().catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Reliable Media Stream Probe as specified in Tessera architecture
  const probeMediaFile = (file: File): Promise<{ kind: 'audio' | 'video'; duration: number; width: number; height: number }> => {
    return new Promise((resolve) => {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.muted = true;
      const objectUrl = URL.createObjectURL(file);

      const cleanup = () => {
        v.removeAttribute('src');
        v.load();
        URL.revokeObjectURL(objectUrl);
      };

      const timer = setTimeout(() => {
        // Timeout fallback after 3.5s
        const isVidHint = file.type.startsWith('video/') || /\.(mp4|webm|mkv|mov|avi)$/i.test(file.name);
        resolve({
          kind: isVidHint ? 'video' : 'audio',
          duration: 180,
          width: 0,
          height: 0
        });
        cleanup();
      }, 3500);

      v.onloadedmetadata = () => {
        clearTimeout(timer);
        // In browser, videoWidth > 0 means there is an active visual video stream
        const isVideo = v.videoWidth > 0 && v.videoHeight > 0;
        const dur = isFinite(v.duration) && v.duration > 0 ? v.duration : 180;
        resolve({
          kind: isVideo ? 'video' : 'audio',
          duration: dur,
          width: v.videoWidth,
          height: v.videoHeight
        });
        cleanup();
      };

      v.onerror = () => {
        clearTimeout(timer);
        const isVidHint = file.type.startsWith('video/') || /\.(mp4|webm|mkv|mov|avi)$/i.test(file.name);
        resolve({
          kind: isVidHint ? 'video' : 'audio',
          duration: 180,
          width: 0,
          height: 0
        });
        cleanup();
      };

      v.src = objectUrl;
    });
  };

  // Local File & Folder Import
  const importFiles = async (files: FileList | File[], targetPackId?: string) => {
    const newMediaItems: MediaItem[] = [];
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      // 1. Quick extension / MIME type hints
      const isVideoHint = file.type.startsWith('video/') || /\.(mp4|webm|mkv|mov|avi|flv)$/i.test(file.name);
      const isAudioHint = file.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|aac|m4a|aiff|opus)$/i.test(file.name);

      if (!isVideoHint && !isAudioHint) continue;

      // 2. Reliable container probing via loadedmetadata
      const probed = await probeMediaFile(file);
      const isVideo = probed.kind === 'video';

      const url = URL.createObjectURL(file);
      const nameParts = file.name.replace(/\.[^/.]+$/, '').split('-');
      const artist = nameParts.length > 1 ? nameParts[0].trim() : 'Local Artist';
      const title = nameParts.length > 1 ? nameParts.slice(1).join('-').trim() : nameParts[0].trim();

      // Compute waveform peaks for audio or extract audio waveform
      let peaks: number[] | undefined;
      try {
        peaks = await audioEngine.computeWaveform(file, 40);
      } catch {
        peaks = undefined;
      }

      const newItem: MediaItem = {
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title,
        artist,
        album: 'Imported Media',
        duration: probed.duration || 180,
        url,
        type: isVideo ? 'video' : 'audio',
        coverUrl: isVideo
          ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=600&auto=format&fit=crop'
          : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
        genre: isVideo ? 'Video' : 'Hip Hop',
        mood: 'Fresh',
        typeTag: isVideo ? 'Video' : 'Song',
        collaborators: [],
        customTags: ['Local', isVideo ? 'Video' : 'Audio'],
        playCount: 0,
        dateAdded: Date.now(),
        isLocalFile: true,
        blob: file,
        waveformPeaks: peaks,
        packId: targetPackId,
        packIds: targetPackId ? [targetPackId] : undefined
      };

      newMediaItems.push(newItem);
    }

    if (newMediaItems.length > 0) {
      try {
        await db.media.bulkAdd(newMediaItems);
      } catch (dbErr) {
        console.warn('Dexie bulkAdd warning (possible QuotaExceededError):', dbErr);
        // Fallback: Strip heavy raw blob property to fit inside database quota
        try {
          const lightMediaItems = newMediaItems.map(({ blob, ...rest }) => rest);
          await db.media.bulkAdd(lightMediaItems);
        } catch (fallbackErr) {
          console.warn('Fallback bulkAdd failed:', fallbackErr);
        }
      }

      setMediaList(prev => [...newMediaItems, ...prev]);

      if (targetPackId) {
        const pack = packs.find(p => p.id === targetPackId);
        if (pack) {
          const newCount = pack.trackCount + newMediaItems.length;
          try {
            await db.packs.update(targetPackId, { trackCount: newCount });
          } catch (e) {
            console.warn('Could not update pack count in DB:', e);
          }
          setPacks(prev => prev.map(p => p.id === targetPackId ? { ...p, trackCount: newCount } : p));
        }
      }

      playTrack(newMediaItems[0], [...newMediaItems, ...mediaList]);
      setToastNotification({
        title: `${newMediaItems.length} file${newMediaItems.length > 1 ? 's' : ''} imported`,
        subtitle: `${newMediaItems[0].title} ready`
      });
    }
  };

  const importFromUrl = async (url: string, title: string, artist: string, type: 'audio' | 'video') => {
    const newItem: MediaItem = {
      id: `stream-${Date.now()}`,
      title: title || 'Stream Media',
      artist: artist || 'Web Stream',
      album: 'Online Streams',
      duration: 0,
      url,
      type,
      coverUrl: type === 'video'
        ? 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
      genre: 'Stream',
      mood: 'Live',
      typeTag: type === 'video' ? 'Video' : 'Beat',
      customTags: ['Stream'],
      playCount: 0,
      dateAdded: Date.now(),
      waveformPeaks: [0.3, 0.5, 0.7, 0.9, 0.6, 0.8, 0.7, 0.5]
    };

    await db.media.add(newItem);
    setMediaList(prev => [newItem, ...prev]);
    playTrack(newItem);
  };

  const createPack = async (packData: Partial<Pack>, trackIds: string[]) => {
    const newPack: Pack = {
      id: `pack-${Date.now()}`,
      title: packData.title || 'New Sample Pack',
      producer: packData.producer || 'PRODUCER',
      trackCount: trackIds.length,
      coverUrl: packData.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
      coverColor: packData.coverColor || '#8b5cf6',
      tags: packData.tags || ['Custom', 'Pack'],
      genre: packData.genre || 'Hip Hop',
      dateCreated: Date.now()
    };

    try {
      await db.packs.add(newPack);
    } catch (e) {
      console.warn('Could not add pack to IndexedDB:', e);
    }
    setPacks(prev => [newPack, ...prev]);

    for (const tid of trackIds) {
      const target = mediaList.find(m => m.id === tid);
      const currentPackIds = target?.packIds || (target?.packId ? [target.packId] : []);
      const newPackIds = Array.from(new Set([...currentPackIds, newPack.id]));
      try {
        await db.media.update(tid, { packId: newPack.id, packIds: newPackIds });
      } catch (e) {
        console.warn('Could not update track packIds in DB:', e);
      }
    }
    setMediaList(prev => prev.map(m => {
      if (trackIds.includes(m.id)) {
        const currentPacks = m.packIds || (m.packId ? [m.packId] : []);
        return { ...m, packId: newPack.id, packIds: Array.from(new Set([...currentPacks, newPack.id])) };
      }
      return m;
    }));
    setToastNotification({
      title: 'Pack created',
      subtitle: `${newPack.title} saved with ${trackIds.length} tracks`
    });
    return newPack.id;
  };

  const addTrackToPack = async (trackId: string, packId: string) => {
    const target = mediaList.find(m => m.id === trackId);
    if (!target) return;
    const currentPacks = target.packIds || (target.packId ? [target.packId] : []);
    if (currentPacks.includes(packId)) return;
    const updatedPackIds = [...currentPacks, packId];
    await db.media.update(trackId, { packId, packIds: updatedPackIds });
    setMediaList(prev => prev.map(m => m.id === trackId ? { ...m, packId, packIds: updatedPackIds } : m));
    
    // Update pack trackCount
    const pack = packs.find(p => p.id === packId);
    if (pack) {
      const newCount = pack.trackCount + 1;
      await db.packs.update(packId, { trackCount: newCount });
      setPacks(prev => prev.map(p => p.id === packId ? { ...p, trackCount: newCount } : p));
      setToastNotification({
        title: 'Added to Playlist',
        subtitle: `Added to ${pack.title}`
      });
    }
  };

  const removeTrackFromPack = async (trackId: string, packId: string) => {
    const target = mediaList.find(m => m.id === trackId);
    if (!target) return;
    const currentPacks = target.packIds || (target.packId ? [target.packId] : []);
    const updatedPackIds = currentPacks.filter(id => id !== packId);
    const newPrimaryPackId = updatedPackIds[0] || undefined;
    await db.media.update(trackId, { packId: newPrimaryPackId, packIds: updatedPackIds });
    setMediaList(prev => prev.map(m => m.id === trackId ? { ...m, packId: newPrimaryPackId, packIds: updatedPackIds } : m));

    const pack = packs.find(p => p.id === packId);
    if (pack) {
      const newCount = Math.max(0, pack.trackCount - 1);
      await db.packs.update(packId, { trackCount: newCount });
      setPacks(prev => prev.map(p => p.id === packId ? { ...p, trackCount: newCount } : p));
    }
  };

  const toggleTrackInPack = async (trackId: string, packId: string) => {
    const target = mediaList.find(m => m.id === trackId);
    if (!target) return;
    const currentPacks = target.packIds || (target.packId ? [target.packId] : []);
    if (currentPacks.includes(packId) || target.packId === packId) {
      await removeTrackFromPack(trackId, packId);
    } else {
      await addTrackToPack(trackId, packId);
    }
  };

  const createPackAndAddTrack = async (title: string, producer: string, trackId?: string): Promise<string> => {
    const newPack: Pack = {
      id: `pack-${Date.now()}`,
      title: title || 'New Playlist',
      producer: producer || 'PRODUCER',
      trackCount: trackId ? 1 : 0,
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
      coverColor: '#e11d48',
      tags: ['Playlist'],
      genre: 'Hip Hop',
      dateCreated: Date.now()
    };

    await db.packs.add(newPack);
    setPacks(prev => [newPack, ...prev]);

    if (trackId) {
      await addTrackToPack(trackId, newPack.id);
    }

    setToastNotification({
      title: 'Playlist Created',
      subtitle: `${newPack.title} created`
    });
    return newPack.id;
  };

  const updatePack = async (packId: string, updates: Partial<Pack>) => {
    try {
      await db.packs.update(packId, updates);
    } catch (e) {
      console.warn('IndexedDB updatePack error:', e);
    }
    setPacks(prev => prev.map(p => p.id === packId ? { ...p, ...updates } : p));
  };

  const deletePack = async (packId: string) => {
    await db.packs.delete(packId);
    setPacks(prev => prev.filter(p => p.id !== packId));
    // Clear references from media
    setMediaList(prev => prev.map(m => {
      const currentPacks = m.packIds || (m.packId ? [m.packId] : []);
      const updated = currentPacks.filter(id => id !== packId);
      return { ...m, packId: updated[0] || undefined, packIds: updated };
    }));
    setToastNotification({
      title: 'Pack deleted',
      subtitle: 'Playlist removed'
    });
  };

  const updateTrack = async (id: string, updates: Partial<MediaItem>) => {
    await db.media.update(id, updates);
    setMediaList(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    setQueue(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    if (currentTrack?.id === id) {
      setCurrentTrack(prev => prev ? { ...prev, ...updates } : null);
    }
    if (updates.customTags) {
      updates.customTags.forEach(t => addCustomTagGlobal(t));
    }
    setToastNotification({
      title: 'Track updated',
      subtitle: `${updates.title || currentTrack?.title || 'Track'} saved`
    });
  };

  const deleteMedia = async (id: string) => {
    await db.media.delete(id);
    setMediaList(prev => prev.filter(m => m.id !== id));
    setQueue(prev => prev.filter(m => m.id !== id));
    if (currentTrack?.id === id) {
      nextTrack(true);
    }
  };

  const batchDeleteMedia = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    await Promise.all(ids.map(id => db.media.delete(id)));
    setMediaList(prev => prev.filter(m => !idSet.has(m.id)));
    setQueue(prev => prev.filter(m => !idSet.has(m.id)));
    if (currentTrack && idSet.has(currentTrack.id)) {
      nextTrack(true);
    }
    setToastNotification({
      title: 'Tracks Deleted',
      subtitle: `${ids.length} track(s) removed`
    });
  };

  const clearAllMedia = async () => {
    try {
      await Promise.all([
        db.media.clear(),
        db.packs.clear(),
        db.playlists.clear()
      ]);
      setMediaList([]);
      setQueue([]);
      setPacks([]);
      setPlaylists([]);
      
      // Stop currently playing track
      setIsPlaying(false);
      const activeDeck = audioEngine.getActiveDeck();
      if (activeDeck) {
        activeDeck.el.pause();
        activeDeck.el.src = '';
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
      
      // Reset state
      playTrack(null as any);
      
      setToastNotification({
        title: 'Player Reset',
        subtitle: 'Demo tracks cleared! Ready to load your own files.'
      });
    } catch (err) {
      console.warn('Error clearing library:', err);
    }
  };

  const batchAddTagToTracks = async (trackIds: string[], tag: string) => {
    const cleanTag = tag.trim().replace(/^#/, '');
    if (!cleanTag || trackIds.length === 0) return;
    addCustomTagGlobal(cleanTag);
    const idSet = new Set(trackIds);

    await Promise.all(trackIds.map(async (id) => {
      const item = mediaList.find(m => m.id === id);
      if (item) {
        const currentTags = item.customTags || [];
        if (!currentTags.includes(cleanTag)) {
          const updated = [...currentTags, cleanTag];
          await db.media.update(id, { customTags: updated });
        }
      }
    }));

    setMediaList(prev => prev.map(m => {
      if (idSet.has(m.id)) {
        const current = m.customTags || [];
        return current.includes(cleanTag) ? m : { ...m, customTags: [...current, cleanTag] };
      }
      return m;
    }));

    setToastNotification({
      title: 'Tag Added',
      subtitle: `#${cleanTag} applied to ${trackIds.length} track(s)`
    });
  };

  const batchRemoveTagFromTracks = async (trackIds: string[], tag: string) => {
    const cleanTag = tag.trim().replace(/^#/, '');
    if (!cleanTag || trackIds.length === 0) return;
    const idSet = new Set(trackIds);

    await Promise.all(trackIds.map(async (id) => {
      const item = mediaList.find(m => m.id === id);
      if (item && item.customTags) {
        const updated = item.customTags.filter(t => t !== cleanTag);
        await db.media.update(id, { customTags: updated });
      }
    }));

    setMediaList(prev => prev.map(m => {
      if (idSet.has(m.id) && m.customTags) {
        return { ...m, customTags: m.customTags.filter(t => t !== cleanTag) };
      }
      return m;
    }));
  };

  const batchAddTracksToPack = async (trackIds: string[], packId: string) => {
    if (trackIds.length === 0) return;
    await Promise.all(trackIds.map(id => addTrackToPack(id, packId)));
    const pack = packs.find(p => p.id === packId);
    setToastNotification({
      title: 'Added to Playlist',
      subtitle: `${trackIds.length} tracks added to ${pack?.title || 'Playlist'}`
    });
  };

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Aggregate all unique user custom tags
  const allUserTags = Array.from(
    new Set([
      ...customTagsList,
      ...mediaList.flatMap(m => m.customTags || [])
    ].filter(Boolean))
  );

  // Filter and sort media items
  const filteredMedia = mediaList.filter(item => {
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchArtist = item.artist.toLowerCase().includes(q);
      const matchAlbum = item.album?.toLowerCase().includes(q);
      const matchTags = item.customTags?.some(t => t.toLowerCase().includes(q));
      const matchGenre = item.genre?.toLowerCase().includes(q);
      if (!matchTitle && !matchArtist && !matchAlbum && !matchTags && !matchGenre) {
        return false;
      }
    }

    if (filters.mediaTypeFilter !== 'all' && item.type !== filters.mediaTypeFilter) {
      return false;
    }

    if (filters.selectedType && item.typeTag !== filters.selectedType && item.trackType !== filters.selectedType) {
      return false;
    }

    if (filters.selectedGenre && item.genre !== filters.selectedGenre) {
      return false;
    }

    if (filters.selectedMood && item.mood !== filters.selectedMood) {
      return false;
    }

    if (filters.selectedCustomTags && filters.selectedCustomTags.length > 0) {
      const itemTags = item.customTags || [];
      const hasAllSelected = filters.selectedCustomTags.every(st => 
        itemTags.some(t => t.toLowerCase() === st.toLowerCase())
      );
      if (!hasAllSelected) {
        return false;
      }
    } else if (filters.selectedCustomTag && !item.customTags?.includes(filters.selectedCustomTag)) {
      return false;
    }

    if (filters.selectedPackId) {
      const itemPacks = item.packIds || (item.packId ? [item.packId] : []);
      if (!itemPacks.includes(filters.selectedPackId) && item.packId !== filters.selectedPackId) {
        return false;
      }
    }

    if (filters.selectedKey && item.key !== filters.selectedKey) {
      return false;
    }

    if (filters.minBpm && (item.bpm || 0) < filters.minBpm) {
      return false;
    }

    if (filters.maxBpm && (item.bpm || 0) > filters.maxBpm) {
      return false;
    }

    if (filters.filterMineOnly && !item.isFavorite && !item.isLocalFile) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    const orderMultiplier = filters.sortOrder === 'asc' ? 1 : -1;
    if (filters.sortBy === 'title') {
      return a.title.localeCompare(b.title) * orderMultiplier;
    } else if (filters.sortBy === 'artist') {
      return a.artist.localeCompare(b.artist) * orderMultiplier;
    } else if (filters.sortBy === 'duration') {
      return (a.duration - b.duration) * orderMultiplier;
    } else if (filters.sortBy === 'playCount') {
      return ((a.playCount || 0) - (b.playCount || 0)) * orderMultiplier;
    } else if (filters.sortBy === 'bpm') {
      return ((a.bpm || 0) - (b.bpm || 0)) * orderMultiplier;
    } else {
      return (a.dateAdded - b.dateAdded) * orderMultiplier;
    }
  });

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcut for Cmd+K / Ctrl+K or / to open Search Popout
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchPopoutOpen(prev => !prev);
        return;
      }

      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        setIsSearchPopoutOpen(true);
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(Math.min(duration, currentTime + (e.shiftKey ? 15 : 5)));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, currentTime - (e.shiftKey ? 15 : 5)));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolumeLevel(volume + 0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolumeLevel(volume - 0.05);
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          triggerFullscreen();
          break;
        case 'KeyP':
          e.preventDefault();
          triggerPiP();
          break;
        case 'KeyL':
          e.preventDefault();
          cycleRepeatMode();
          break;
        case 'KeyS':
          e.preventDefault();
          toggleShuffle();
          break;
        case 'KeyE':
          e.preventDefault();
          setIsEqOpen(prev => !prev);
          break;
        case 'KeyV':
          e.preventDefault();
          setVisualizerMode(prev => {
            if (prev === 'spectrum') return 'bars';
            if (prev === 'bars') return 'wave';
            if (prev === 'wave') return 'radial';
            if (prev === 'radial') return 'off';
            return 'spectrum';
          });
          break;
        case 'KeyN':
          if (e.shiftKey) {
            e.preventDefault();
            nextTrack(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, seek, duration, currentTime, setVolumeLevel, volume, toggleMute, triggerFullscreen, cycleRepeatMode, toggleShuffle, nextTrack]);

  return (
    <MediaContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackRate,
        repeatMode,
        isShuffled,
        isBuffering,
        queue,
        queueIndex,
        currentTheme,
        setCurrentTheme,
        themeConfig,
        isThemeModalOpen,
        setIsThemeModalOpen,
        activeLayout,
        setActiveLayout,
        isLayoutModalOpen,
        setIsLayoutModalOpen,
        userProfile,
        setUserProfile,
        isProfileModalOpen,
        setIsProfileModalOpen,
        losslessStreaming,
        setLosslessStreaming,
        useOriginalFilenames,
        setUseOriginalFilenames,
        isMainMenuOpen,
        setIsMainMenuOpen,
        crossfadeDuration,
        setCrossfadeDuration,
        isCrossfadeEnabled,
        setIsCrossfadeEnabled,
        isFading,
        mediaList,
        packs,
        playlists,
        filteredMedia,
        allUserTags,
        addCustomTagGlobal,
        removeCustomTagGlobal,
        addTrackToPack,
        removeTrackFromPack,
        toggleTrackInPack,
        createPackAndAddTrack,
        updatePack,
        deletePack,
        uiMode,
        setUiMode,
        visualizerMode,
        setVisualizerMode,
        isEqOpen,
        setIsEqOpen,
        isNowPlayingOpen,
        setIsNowPlayingOpen,
        isImportOpen,
        setIsImportOpen,
        isCreatePackOpen,
        setIsCreatePackOpen,
        isShortcutsOpen,
        setIsShortcutsOpen,
        isEditTrackOpen,
        setIsEditTrackOpen,
        isSearchPopoutOpen,
        setIsSearchPopoutOpen,
        activePackDetailId,
        setActivePackDetailId,
        openPackDetail,
        editingTrack,
        setEditingTrack,
        openEditTrack,
        toastNotification,
        setToastNotification,
        filters,
        setFilters,
        resetFilters,
        eqPreset,
        eqBands,
        preampGain,
        stereoPan,
        setEqBandGain,
        applyEqPreset,
        setPreampGainValue,
        setStereoPanValue,
        playTrack,
        togglePlayPause,
        seek,
        setVolumeLevel,
        toggleMute,
        setSpeed,
        nextTrack,
        prevTrack,
        toggleShuffle,
        cycleRepeatMode,
        addToQueue,
        removeFromQueue,
        clearQueue,
        toggleFavorite,
        audioRef,
        videoRef,
        activeMediaElement,
        importFiles,
        importFromUrl,
        createPack,
        updateTrack,
        deleteMedia,
        batchDeleteMedia,
        batchAddTagToTracks,
        batchRemoveTagFromTracks,
        batchAddTracksToPack,
        triggerPiP,
        triggerFullscreen,
        clearAllMedia
      }}
    >
      {/* Hidden fallback video element for video media */}
      <video
        ref={videoRef}
        crossOrigin="anonymous"
        playsInline
        onTimeUpdate={() => {
          if (videoRef.current && currentTrack?.type === 'video') {
            setCurrentTime(videoRef.current.currentTime);
          }
        }}
        onDurationChange={() => {
          if (videoRef.current && currentTrack?.type === 'video' && !isNaN(videoRef.current.duration)) {
            setDuration(videoRef.current.duration);
          }
        }}
        onEnded={() => nextTrack(false)}
        className="hidden"
      />

      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};
