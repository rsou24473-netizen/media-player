export type MediaType = 'audio' | 'video';
export type TrackKind = 'No type' | 'Beat' | 'Song' | 'Loop';
export type TrackVisibility = 'private' | 'profile';

export type ThemeId =
  | 'midnight'
  | 'cyber_cyan'
  | 'solar_gold'
  | 'rose_velvet'
  | 'vaporwave'
  | 'emerald'
  | 'sunset'
  | 'retro_cassette'
  | 'liquid_silver'
  | 'acid_lime'
  | 'mono'
  | 'nordic_frost'
  | 'cyberpunk_neon'
  | 'tokyo_night'
  | 'hyper_crimson'
  | 'amethyst_void'
  | 'desert_dune'
  | 'synthwave_84'
  | 'matrix_code'
  | 'champagne_gold'
  | 'ocean_abyss';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  badge: string;
  description: string;
  primaryBg: string;
  cardBg: string;
  sidebarBg: string;
  headerBg: string;
  filterBarBg?: string;
  borderColor: string;
  accentColor: string;
  accentIconColor: string;
  accentTextColor: string;
  accentBorderColor: string;
  accentBgSubtle?: string;
  accentBgMuted?: string;
  hoverBg: string;
  activeGlow: string;
  previewColor: string;
  waveformColor: string;
  waveformBg: string;
  neonGlow?: string;
  cardBorder?: string;
  containerClass?: string;
}

export type LayoutMode =
  | 'two_panel'
  | 'music_room_3d'
  | 'orbit'
  | 'living_interface'
  | 'bento_grid'
  | 'masonry_grid'
  | 'editorial_split'
  | 'filmstrip'
  | 'collage'
  | 'full_bleed'
  | 'horizontal_scroll'
  | 'minimalist_gallery'
  | 'poster_layout';

export interface LayoutConfig {
  id: LayoutMode;
  name: string;
  category: 'Experimental 3D' | 'Editorial & Grid' | 'Cinematic & Immersive';
  description: string;
  badge: string;
  iconName: string;
}

export interface UserProfile {
  name: string;
  tag: string;
  bio?: string;
  avatarUrl: string;
  avatarVideoUrl?: string;
  isVideoAvatar: boolean;
}

export interface MediaItem {
  id: string;
  title: string;
  artist: string;
  album?: string;
  packId?: string;
  packIds?: string[];
  duration: number; // in seconds
  url: string;
  type: MediaType;
  coverUrl?: string;
  genre?: string;
  mood?: string;
  bpm?: number;
  key?: string;
  trackType?: TrackKind;
  typeTag?: string;
  visibility?: TrackVisibility;
  collaborators?: string[];
  instrument?: string;
  customTags?: string[];
  playCount: number;
  dateAdded: number;
  isFavorite?: boolean;
  fileSize?: string;
  format?: string;
  isLocalFile?: boolean;
  blob?: Blob;
  waveformPeaks?: number[];
  originalFileName?: string;
  videoUrl?: string;
  videoFileName?: string;
}

export interface Pack {
  id: string;
  title: string;
  producer: string;
  trackCount: number;
  coverUrl?: string;
  coverColor?: string;
  description?: string;
  videoUrl?: string;
  isVideoCover?: boolean;
  tags: string[];
  genre?: string;
  dateCreated: number;
  isPinned?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  trackIds: string[];
  dateCreated: number;
}

export type RepeatMode = 'off' | 'all' | 'one';
export type VisualizerMode = 'spectrum' | 'bars' | 'wave' | 'radial' | 'off';
export type AppUIMode = 'offtop' | 'fluent' | 'video_theater' | 'now_playing';

export interface EQBandConfig {
  frequency: number;
  label: string;
  gain: number;
}

export interface EQPreset {
  id: string;
  name: string;
  gains: [number, number, number, number, number];
}

export interface FilterState {
  searchQuery: string;
  selectedType: string | null;
  selectedGenre: string | null;
  selectedMood: string | null;
  selectedInstrument: string | null;
  selectedCollaborator: string | null;
  selectedCustomTag: string | null;
  selectedCustomTags?: string[];
  selectedPackId: string | null;
  selectedKey: string | null;
  minBpm: number | null;
  maxBpm: number | null;
  filterMineOnly: boolean;
  mediaTypeFilter: 'all' | 'audio' | 'video';
  sortBy: 'dateAdded' | 'title' | 'artist' | 'duration' | 'playCount' | 'bpm';
  sortOrder: 'asc' | 'desc';
}
