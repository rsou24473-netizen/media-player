import Dexie, { type Table } from 'dexie';
import { MediaItem, Pack, Playlist } from '../types';

export class MediaPlayerDB extends Dexie {
  media!: Table<MediaItem, string>;
  packs!: Table<Pack, string>;
  playlists!: Table<Playlist, string>;

  constructor() {
    super('MediaPlayerDatabase');
    this.version(1).stores({
      media: 'id, title, artist, album, packId, type, genre, mood, typeTag, dateAdded, playCount, isFavorite',
      packs: 'id, title, producer, dateCreated, isPinned',
      playlists: 'id, name, dateCreated'
    });
  }
}

export const db = new MediaPlayerDB();

// Curated initial demo library matching the Offtop and Fluent Media Player reference screenshots
export const INITIAL_PACKS: Pack[] = [
  {
    id: 'pack-untitled',
    title: 'Untitled Pack',
    producer: 'jackdsadasdsad',
    trackCount: 1,
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    coverColor: '#52525b',
    tags: ['Dark', 'Loop', 'Atmosphere'],
    genre: 'Hip Hop',
    dateCreated: Date.now(),
    isPinned: true
  },
  {
    id: 'pack-1',
    title: '808 beats',
    producer: 'SOUTHSIDE',
    trackCount: 17,
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    coverColor: '#22c55e',
    tags: ['Trap', '808', 'Heavy', 'Banger'],
    genre: 'Hip Hop',
    dateCreated: Date.now() - 1000 * 60 * 60 * 24 * 5,
    isPinned: true
  },
  {
    id: 'pack-2',
    title: 'Deep bass',
    producer: 'SOUTHSIDE',
    trackCount: 17,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    coverColor: '#3b82f6',
    tags: ['Sub Bass', 'Drill', 'Melodic'],
    genre: 'Trap',
    dateCreated: Date.now() - 1000 * 60 * 60 * 24 * 7,
    isPinned: true
  },
  {
    id: 'pack-3',
    title: 'Punchy',
    producer: 'SOUTHSIDE',
    trackCount: 21,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    coverColor: '#f59e0b',
    tags: ['Punchy', 'Club', 'Bounce'],
    genre: 'Hip Hop',
    dateCreated: Date.now() - 1000 * 60 * 60 * 24 * 10
  },
  {
    id: 'pack-4',
    title: 'Thumping sounds',
    producer: 'SOUTHSIDE',
    trackCount: 22,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
    coverColor: '#ef4444',
    tags: ['Dark', 'Synth', 'Aggressive'],
    genre: 'Trap',
    dateCreated: Date.now() - 1000 * 60 * 60 * 24 * 12
  },
  {
    id: 'pack-5',
    title: 'Heavy rhythms',
    producer: 'SOUTHSIDE',
    trackCount: 19,
    coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop',
    coverColor: '#10b981',
    tags: ['Percussion', 'Rhythm', 'Drums'],
    genre: 'Boom Bap',
    dateCreated: Date.now() - 1000 * 60 * 60 * 24 * 15
  },
  {
    id: 'pack-6',
    title: 'Drum patterns',
    producer: 'SOUTHSIDE',
    trackCount: 18,
    coverUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop',
    coverColor: '#8b5cf6',
    tags: ['Hi-Hats', 'Snare', 'Rolls'],
    genre: 'Drill',
    dateCreated: Date.now() - 1000 * 60 * 60 * 24 * 20
  },
  {
    id: 'pack-7',
    title: 'Bass lines',
    producer: 'SOUTHSIDE',
    trackCount: 20,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    coverColor: '#ec4899',
    tags: ['Bass', 'Groove', 'Low End'],
    genre: 'Funk/R&B',
    dateCreated: Date.now() - 1000 * 60 * 60 * 24 * 25
  }
];

export const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'track-life-changes',
    title: 'life changes',
    artist: 'jackdsadasdsad',
    album: 'Untitled Pack',
    packId: 'pack-untitled',
    duration: 169, // 02:49
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    type: 'audio',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    genre: 'Hip Hop',
    mood: 'Dark',
    bpm: 236,
    key: 'C Major',
    trackType: 'No type',
    typeTag: 'Track',
    visibility: 'private',
    collaborators: [],
    customTags: ['Loop', 'Dark', 'Trap'],
    playCount: 1,
    dateAdded: Date.now(),
    isFavorite: true,
    waveformPeaks: [0.1, 0.3, 0.6, 0.8, 0.5, 0.7, 0.9, 0.65, 0.45, 0.8, 0.85, 0.6, 0.75, 0.9, 0.65, 0.35, 0.55, 0.75, 0.85, 0.7, 0.4, 0.2]
  },
  {
    id: 'track-1',
    title: 'Offended',
    artist: 'MEEK MILL, YOUNG THUG, 21 SAVAGE',
    album: 'Wins & Losses',
    packId: 'pack-1',
    duration: 255, // 04:15
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    type: 'audio',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
    genre: 'Hip Hop',
    mood: 'Aggressive',
    bpm: 142,
    key: 'F Minor',
    typeTag: 'Song',
    collaborators: ['Young Thug', '21 Savage'],
    instrument: '808 Bass',
    customTags: ['Fire', 'Banger', 'Club'],
    playCount: 42,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 2,
    isFavorite: true,
    waveformPeaks: [0.2, 0.4, 0.7, 0.9, 0.6, 0.8, 0.95, 0.7, 0.5, 0.85, 0.9, 0.65, 0.8, 0.95, 0.7, 0.4, 0.6, 0.8, 0.9, 0.75, 0.5, 0.3]
  },
  {
    id: 'track-2',
    title: 'Sicko Mode',
    artist: 'TRAVIS SCOTT, DRAKE',
    album: 'ASTROWORLD',
    packId: 'pack-2',
    duration: 312, // 05:12
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    type: 'audio',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    genre: 'Psychedelic Trap',
    mood: 'Euphoric',
    bpm: 155,
    key: 'B-Flat Minor',
    typeTag: 'Song',
    collaborators: ['Drake', 'Swae Lee'],
    instrument: 'Synth Lead',
    customTags: ['Anthem', 'Classic', 'Hit'],
    playCount: 128,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 3,
    isFavorite: true,
    waveformPeaks: [0.3, 0.5, 0.8, 0.6, 0.9, 0.85, 0.7, 0.95, 0.8, 0.6, 0.9, 0.75, 0.85, 0.95, 0.6, 0.7, 0.8, 0.9, 0.7, 0.4]
  },
  {
    id: 'track-3',
    title: 'HUMBLE.',
    artist: 'KENDRICK LAMAR',
    album: 'DAMN.',
    packId: 'pack-1',
    duration: 177, // 02:57
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    type: 'audio',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    genre: 'Hip Hop',
    mood: 'Energetic',
    bpm: 150,
    key: 'F Minor',
    typeTag: 'Song',
    collaborators: ['Mike WiLL Made-It'],
    instrument: 'Piano',
    customTags: ['Grammy', 'Banger', 'Rap'],
    playCount: 95,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 4,
    isFavorite: true,
    waveformPeaks: [0.4, 0.7, 0.85, 0.9, 0.6, 0.95, 0.8, 0.7, 0.85, 0.9, 0.65, 0.8, 0.9, 0.75, 0.5]
  },
  {
    id: 'track-4',
    title: "God's Plan",
    artist: 'DRAKE',
    album: 'Scorpion',
    packId: 'pack-3',
    duration: 199, // 03:19
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    type: 'audio',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    genre: 'Melodic Rap',
    mood: 'Chill',
    bpm: 77,
    key: 'D Major',
    typeTag: 'Song',
    collaborators: ['Cardo', 'Yung Exclusive'],
    instrument: 'Electric Keys',
    customTags: ['Billboard', 'Melodic'],
    playCount: 64,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 6,
    isFavorite: false,
    waveformPeaks: [0.2, 0.4, 0.6, 0.75, 0.8, 0.7, 0.65, 0.8, 0.85, 0.7, 0.6, 0.5, 0.4]
  },
  {
    id: 'track-5',
    title: 'Rockstar',
    artist: 'POST MALONE, 21 SAVAGE',
    album: 'Beerbongs & Bentleys',
    packId: 'pack-4',
    duration: 241, // 04:01
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    type: 'audio',
    coverUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop',
    genre: 'Trap Rock',
    mood: 'Dark',
    bpm: 160,
    key: 'F Major',
    typeTag: 'Song',
    collaborators: ['21 Savage', 'Tank God'],
    instrument: 'Guitar Sample',
    customTags: ['Vibes', 'Global'],
    playCount: 88,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 8,
    isFavorite: true,
    waveformPeaks: [0.3, 0.6, 0.7, 0.85, 0.9, 0.8, 0.75, 0.9, 0.85, 0.7, 0.8, 0.6, 0.4]
  },
  {
    id: 'track-6',
    title: 'Bad and Boujee',
    artist: 'MIGOS, LIL UZI VERT',
    album: 'Culture',
    packId: 'pack-5',
    duration: 334, // 05:34
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    type: 'audio',
    coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop',
    genre: 'Trap',
    mood: 'Hype',
    bpm: 127,
    key: 'E-Flat Minor',
    typeTag: 'Song',
    collaborators: ['Lil Uzi Vert', 'Metro Boomin'],
    instrument: 'Sub Bass',
    customTags: ['Culture', 'Triplets'],
    playCount: 110,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 9,
    isFavorite: false,
    waveformPeaks: [0.4, 0.65, 0.85, 0.9, 0.75, 0.95, 0.85, 0.7, 0.8, 0.9, 0.7, 0.5]
  },
  {
    id: 'track-7',
    title: 'Old Town Road',
    artist: 'LIL NAS X, BILLY RAY CYRUS',
    album: '7 EP',
    packId: 'pack-7',
    duration: 157, // 02:37
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    type: 'audio',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    genre: 'Country Trap',
    mood: 'Fun',
    bpm: 136,
    key: 'G-Sharp Major',
    typeTag: 'Song',
    collaborators: ['Billy Ray Cyrus', 'YoungKio'],
    instrument: 'Banjo',
    customTags: ['Diamond', 'Crossover'],
    playCount: 52,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 11,
    isFavorite: false,
    waveformPeaks: [0.3, 0.5, 0.7, 0.8, 0.9, 0.85, 0.7, 0.8, 0.6, 0.4]
  },
  {
    id: 'track-8',
    title: 'Tonight (High Road)',
    artist: 'KESHA',
    album: 'High Road',
    duration: 196,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    type: 'audio',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    genre: 'Electropop',
    mood: 'Upbeat',
    bpm: 124,
    key: 'C Major',
    typeTag: 'Song',
    instrument: 'Synthesizer',
    customTags: ['Pop', 'Dance'],
    playCount: 37,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 14,
    isFavorite: true,
    waveformPeaks: [0.35, 0.6, 0.8, 0.9, 0.85, 0.75, 0.9, 0.85, 0.65, 0.4]
  },
  // High quality sample MP4 video files
  {
    id: 'video-1',
    title: 'Big Buck Bunny (4K Cinema Trailer)',
    artist: 'Blender Foundation',
    album: 'Open Movies',
    duration: 60,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video',
    coverUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=600&auto=format&fit=crop',
    genre: 'Animation',
    mood: 'Epic',
    typeTag: 'Video',
    customTags: ['Animation', '4K', 'Film'],
    playCount: 19,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 1,
    isFavorite: true
  },
  {
    id: 'video-2',
    title: 'Elephants Dream (Visual Experience)',
    artist: 'Orange Open Movie Project',
    album: 'Sci-Fi Shorts',
    duration: 654,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    type: 'video',
    coverUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
    genre: 'Sci-Fi',
    mood: 'Cinematic',
    typeTag: 'Video',
    customTags: ['Sci-Fi', 'Render', 'Surreal'],
    playCount: 12,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 4,
    isFavorite: false
  },
  {
    id: 'video-3',
    title: 'For Bigger Blazes (Action Demo)',
    artist: 'Chromecast Studio',
    album: 'Ultra HD Showcase',
    duration: 15,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    type: 'video',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    genre: 'Action',
    mood: 'Intense',
    typeTag: 'Clip',
    customTags: ['Demo', 'HD', 'Short'],
    playCount: 23,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 6,
    isFavorite: false
  }
];

export async function initDatabase() {
  try {
    const mediaCount = await db.media.count();
    if (mediaCount === 0) {
      await db.media.bulkAdd(INITIAL_MEDIA_ITEMS);
    }
    const packCount = await db.packs.count();
    if (packCount === 0) {
      await db.packs.bulkAdd(INITIAL_PACKS);
    }
  } catch (error) {
    console.warn('Database initialization warning:', error);
  }
}
