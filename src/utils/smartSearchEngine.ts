import { MediaItem } from '../types';

export interface SmartToken {
  id: string;
  category: 'bpm' | 'key' | 'type' | 'tag' | 'mood' | 'filter' | 'media' | 'text';
  label: string;
  displayValue: string;
  raw: string;
  color: string;
}

export interface ParsedSmartQuery {
  rawQuery: string;
  tokens: SmartToken[];
  targetBpm: number | null;
  minBpm: number | null;
  maxBpm: number | null;
  targetKey: string | null;
  targetType: string | null;
  targetTags: string[];
  targetMood: string | null;
  mediaType: 'all' | 'audio' | 'video';
  onlyFavorites: boolean;
  onlyLocal: boolean;
  sortByIntent: 'relevance' | 'dateAdded' | 'playCount' | 'bpm';
  textKeywords: string[];
}

const KNOWN_KEYS_MAP: Record<string, string> = {
  'c minor': 'C Minor', 'cmin': 'C Minor', 'cm': 'C Minor', 'c min': 'C Minor',
  'c major': 'C Major', 'cmaj': 'C Major', 'c maj': 'C Major',
  'c# minor': 'C# Minor', 'c#m': 'C# Minor', 'c#min': 'C# Minor', 'db minor': 'C# Minor',
  'c# major': 'C# Major', 'db major': 'C# Major',
  'd minor': 'D Minor', 'dmin': 'D Minor', 'dm': 'D Minor', 'd min': 'D Minor',
  'd major': 'D Major', 'dmaj': 'D Major',
  'eb minor': 'Eb Minor', 'ebmin': 'Eb Minor', 'd# minor': 'Eb Minor',
  'eb major': 'Eb Major', 'd# major': 'Eb Major',
  'e minor': 'E Minor', 'emin': 'E Minor', 'em': 'E Minor', 'e min': 'E Minor',
  'e major': 'E Major', 'emaj': 'E Major',
  'f minor': 'F Minor', 'fmin': 'F Minor', 'fm': 'F Minor', 'f min': 'F Minor',
  'f major': 'F Major', 'fmaj': 'F Major',
  'f# minor': 'F# Minor', 'f#m': 'F# Minor', 'gb minor': 'F# Minor',
  'f# major': 'F# Major', 'gb major': 'F# Major',
  'g minor': 'G Minor', 'gmin': 'G Minor', 'gm': 'G Minor', 'g min': 'G Minor',
  'g major': 'G Major', 'gmaj': 'G Major',
  'ab minor': 'Ab Minor', 'abmin': 'Ab Minor', 'g# minor': 'Ab Minor',
  'ab major': 'Ab Major', 'g# major': 'Ab Major',
  'a minor': 'A Minor', 'amin': 'A Minor', 'am': 'A Minor', 'a min': 'A Minor',
  'a major': 'A Major', 'amaj': 'A Major',
  'bb minor': 'Bb Minor', 'bbmin': 'Bb Minor', 'a# minor': 'Bb Minor',
  'bb major': 'Bb Major', 'a# major': 'Bb Major',
  'b minor': 'B Minor', 'bmin': 'B Minor', 'bm': 'B Minor', 'b min': 'B Minor',
  'b major': 'B Major', 'bmaj': 'B Major',
};

const KNOWN_TYPES = ['beat', 'loop', 'song', 'instrumental', 'stem', 'sample', 'vocal track', 'vocal'];
const KNOWN_MOODS = ['dark', 'chill', 'energetic', 'fresh', 'smooth', 'sad', 'happy', 'aggressive', 'mellow', 'atmospheric', 'bouncy', 'euphoric'];
const KNOWN_TAGS = ['trap', 'melodic', 'hip hop', 'hiphop', 'vintage', 'lo-fi', 'lofi', '808', 'drums', 'bass', 'synthwave', 'ambient', 'r&b', 'rnb', 'drill', 'acoustic', 'piano', 'guitar'];

export function parseSmartQuery(query: string, availableTags: string[] = []): ParsedSmartQuery {
  const result: ParsedSmartQuery = {
    rawQuery: query,
    tokens: [],
    targetBpm: null,
    minBpm: null,
    maxBpm: null,
    targetKey: null,
    targetType: null,
    targetTags: [],
    targetMood: null,
    mediaType: 'all',
    onlyFavorites: false,
    onlyLocal: false,
    sortByIntent: 'relevance',
    textKeywords: []
  };

  if (!query.trim()) {
    return result;
  }

  let working = query.toLowerCase().trim();

  // 1. Check for Favorite directive
  if (/\b(favorites?|starred|liked)\b/i.test(working)) {
    result.onlyFavorites = true;
    result.tokens.push({
      id: 'token-fav',
      category: 'filter',
      label: 'Favorites Only',
      displayValue: '⭐ Starred',
      raw: 'favorites',
      color: 'bg-amber-400/20 text-amber-300 border-amber-400/30'
    });
    working = working.replace(/\b(favorites?|starred|liked)\b/gi, ' ');
  }

  // 2. Check for Local directive
  if (/\b(local|imported|my uploads)\b/i.test(working)) {
    result.onlyLocal = true;
    result.tokens.push({
      id: 'token-local',
      category: 'filter',
      label: 'Local Uploads',
      displayValue: '📁 Local',
      raw: 'local',
      color: 'bg-indigo-400/20 text-indigo-300 border-indigo-400/30'
    });
    working = working.replace(/\b(local|imported|my uploads)\b/gi, ' ');
  }

  // 3. Check for Sorting directives
  if (/\b(popular|top|most played|trending)\b/i.test(working)) {
    result.sortByIntent = 'playCount';
    result.tokens.push({
      id: 'token-sort-pop',
      category: 'filter',
      label: 'Sort Intent',
      displayValue: '🔥 Most Played',
      raw: 'popular',
      color: 'bg-orange-400/20 text-orange-300 border-orange-400/30'
    });
    working = working.replace(/\b(popular|top|most played|trending)\b/gi, ' ');
  } else if (/\b(recent|new|newest|latest)\b/i.test(working)) {
    result.sortByIntent = 'dateAdded';
    result.tokens.push({
      id: 'token-sort-recent',
      category: 'filter',
      label: 'Sort Intent',
      displayValue: '✨ Newest Added',
      raw: 'recent',
      color: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
    });
    working = working.replace(/\b(recent|new|newest|latest)\b/gi, ' ');
  }

  // 4. Media Type directive
  if (/\b(videos?|clips?)\b/i.test(working)) {
    result.mediaType = 'video';
    result.tokens.push({
      id: 'token-media-vid',
      category: 'media',
      label: 'Media Kind',
      displayValue: '🎬 Video Only',
      raw: 'video',
      color: 'bg-pink-400/20 text-pink-300 border-pink-400/30'
    });
    working = working.replace(/\b(videos?|clips?)\b/gi, ' ');
  } else if (/\b(audio|songs?|mp3|wav|sound)\b/i.test(working) && !/\b(song|audio)\b/i.test(result.targetType || '')) {
    if (/\b(mp3|wav|audio)\b/i.test(working)) {
      result.mediaType = 'audio';
      result.tokens.push({
        id: 'token-media-aud',
        category: 'media',
        label: 'Media Kind',
        displayValue: '🎧 Audio Only',
        raw: 'audio',
        color: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30'
      });
      working = working.replace(/\b(mp3|wav|audio)\b/gi, ' ');
    }
  }

  // 5. BPM Detection
  // Check range: e.g. "120-140 bpm", "120 - 140", "120 to 140"
  const rangeMatch = working.match(/(\d{2,3})\s*(?:-|to)\s*(\d{2,3})\s*(?:bpm)?/i);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    result.minBpm = Math.min(min, max);
    result.maxBpm = Math.max(min, max);
    result.tokens.push({
      id: 'token-bpm-range',
      category: 'bpm',
      label: 'Tempo Range',
      displayValue: `${result.minBpm}–${result.maxBpm} BPM`,
      raw: rangeMatch[0],
      color: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
    });
    working = working.replace(rangeMatch[0], ' ');
  } else {
    // Check comparison e.g. ">120", "<100", "+140", "140+"
    const compMatch = working.match(/(?:>|\+|over|above)\s*(\d{2,3})\s*(?:bpm)?|(\d{2,3})\s*(?:\+|plus)\s*(?:bpm)?/i);
    if (compMatch) {
      const bpmVal = parseInt(compMatch[1] || compMatch[2], 10);
      result.minBpm = bpmVal;
      result.tokens.push({
        id: 'token-bpm-min',
        category: 'bpm',
        label: 'Tempo Min',
        displayValue: `>${bpmVal} BPM`,
        raw: compMatch[0],
        color: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
      });
      working = working.replace(compMatch[0], ' ');
    } else {
      const underMatch = working.match(/(?:<|under|below)\s*(\d{2,3})\s*(?:bpm)?/i);
      if (underMatch) {
        const bpmVal = parseInt(underMatch[1], 10);
        result.maxBpm = bpmVal;
        result.tokens.push({
          id: 'token-bpm-max',
          category: 'bpm',
          label: 'Tempo Max',
          displayValue: `<${bpmVal} BPM`,
          raw: underMatch[0],
          color: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
        });
        working = working.replace(underMatch[0], ' ');
      } else {
        // Single explicit BPM e.g. "140bpm", "140 bpm", or "fast"/"slow"
        const singleBpmMatch = working.match(/(\d{2,3})\s*bpm\b/i);
        if (singleBpmMatch) {
          const val = parseInt(singleBpmMatch[1], 10);
          result.targetBpm = val;
          result.tokens.push({
            id: 'token-bpm-exact',
            category: 'bpm',
            label: 'Exact BPM',
            displayValue: `${val} BPM`,
            raw: singleBpmMatch[0],
            color: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
          });
          working = working.replace(singleBpmMatch[0], ' ');
        } else {
          // Check for standalone 2-3 digit number typical of BPM (60 - 200)
          const numberMatch = working.match(/\b([6-9]\d|1\d\d|2[0-1]\d)\b/);
          if (numberMatch) {
            const num = parseInt(numberMatch[1], 10);
            result.targetBpm = num;
            result.tokens.push({
              id: 'token-bpm-number',
              category: 'bpm',
              label: 'Target Tempo',
              displayValue: `~${num} BPM`,
              raw: numberMatch[0],
              color: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
            });
            working = working.replace(numberMatch[0], ' ');
          } else if (/\b(fast)\b/i.test(working)) {
            result.minBpm = 130;
            result.tokens.push({
              id: 'token-bpm-fast',
              category: 'bpm',
              label: 'Tempo Intent',
              displayValue: 'Fast (>130 BPM)',
              raw: 'fast',
              color: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
            });
            working = working.replace(/\b(fast)\b/gi, ' ');
          } else if (/\b(slow)\b/i.test(working)) {
            result.maxBpm = 100;
            result.tokens.push({
              id: 'token-bpm-slow',
              category: 'bpm',
              label: 'Tempo Intent',
              displayValue: 'Slow (<100 BPM)',
              raw: 'slow',
              color: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
            });
            working = working.replace(/\b(slow)\b/gi, ' ');
          }
        }
      }
    }
  }

  // 6. Musical Key Detection
  // Check longer keys first to avoid partial conflicts
  const sortedKeys = Object.keys(KNOWN_KEYS_MAP).sort((a, b) => b.length - a.length);
  for (const k of sortedKeys) {
    // Regex boundary check
    const regex = new RegExp(`\\b${k.replace('#', '\\#')}\\b`, 'i');
    if (regex.test(working)) {
      result.targetKey = KNOWN_KEYS_MAP[k];
      result.tokens.push({
        id: 'token-key',
        category: 'key',
        label: 'Musical Key',
        displayValue: `Key: ${result.targetKey}`,
        raw: k,
        color: 'bg-amber-400/20 text-amber-300 border-amber-400/30'
      });
      working = working.replace(regex, ' ');
      break;
    }
  }

  // 7. Track Type Detection
  for (const t of KNOWN_TYPES) {
    const regex = new RegExp(`\\b${t}s?\\b`, 'i');
    if (regex.test(working)) {
      const capitalized = t.charAt(0).toUpperCase() + t.slice(1);
      result.targetType = capitalized;
      result.tokens.push({
        id: 'token-type',
        category: 'type',
        label: 'Track Type',
        displayValue: capitalized,
        raw: t,
        color: 'bg-fuchsia-400/20 text-fuchsia-300 border-fuchsia-400/30'
      });
      working = working.replace(regex, ' ');
      break;
    }
  }

  // 8. Mood Detection
  for (const m of KNOWN_MOODS) {
    const regex = new RegExp(`\\b${m}\\b`, 'i');
    if (regex.test(working)) {
      const capitalized = m.charAt(0).toUpperCase() + m.slice(1);
      result.targetMood = capitalized;
      result.tokens.push({
        id: 'token-mood',
        category: 'mood',
        label: 'Vibe & Mood',
        displayValue: capitalized,
        raw: m,
        color: 'bg-purple-400/20 text-purple-300 border-purple-400/30'
      });
      working = working.replace(regex, ' ');
      break;
    }
  }

  // 9. Hashtag and Tag Detection
  // Extract explicit `#tag` tokens
  const hashMatches = working.match(/#([a-z0-9_-]+)/gi);
  if (hashMatches) {
    for (const h of hashMatches) {
      const clean = h.replace(/^#/, '');
      result.targetTags.push(clean);
      result.tokens.push({
        id: `token-tag-${clean}`,
        category: 'tag',
        label: 'Tag',
        displayValue: `#${clean}`,
        raw: h,
        color: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30'
      });
      working = working.replace(h, ' ');
    }
  }

  // Extract known tag words if they match available user tags or preset tags
  const combinedTagList = Array.from(new Set([...KNOWN_TAGS, ...availableTags.map(t => t.toLowerCase())]));
  for (const tag of combinedTagList) {
    const regex = new RegExp(`\\b${tag}\\b`, 'i');
    if (regex.test(working)) {
      if (!result.targetTags.map(t => t.toLowerCase()).includes(tag)) {
        result.targetTags.push(tag);
        result.tokens.push({
          id: `token-tag-${tag}`,
          category: 'tag',
          label: 'Smart Tag',
          displayValue: `#${tag}`,
          raw: tag,
          color: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30'
        });
      }
      working = working.replace(regex, ' ');
    }
  }

  // 10. Remaining free text terms
  const remainderWords = working
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 0);

  if (remainderWords.length > 0) {
    result.textKeywords = remainderWords;
    result.tokens.push({
      id: 'token-text',
      category: 'text',
      label: 'Search Terms',
      displayValue: `"${remainderWords.join(' ')}"`,
      raw: remainderWords.join(' '),
      color: 'bg-white/10 text-white border-white/20'
    });
  }

  return result;
}

export interface ScoredMatch {
  track: MediaItem;
  score: number;
  matchReasons: string[];
}

export function evaluateSmartMatches(
  mediaList: MediaItem[],
  parsed: ParsedSmartQuery,
  fallbackSearchQuery: string = ''
): ScoredMatch[] {
  // If no query and no criteria, return all media with base order
  const hasCriteria =
    parsed.tokens.length > 0 ||
    parsed.targetBpm !== null ||
    parsed.minBpm !== null ||
    parsed.maxBpm !== null ||
    parsed.targetKey !== null ||
    parsed.targetType !== null ||
    parsed.targetTags.length > 0 ||
    parsed.targetMood !== null ||
    parsed.onlyFavorites ||
    parsed.onlyLocal ||
    parsed.mediaType !== 'all' ||
    parsed.textKeywords.length > 0;

  if (!hasCriteria && !fallbackSearchQuery.trim()) {
    return mediaList.map(track => ({
      track,
      score: track.playCount || 0,
      matchReasons: []
    }));
  }

  const results: ScoredMatch[] = [];

  for (const track of mediaList) {
    let score = 0;
    const matchReasons: string[] = [];

    // Filter by Media Kind
    if (parsed.mediaType !== 'all' && track.type !== parsed.mediaType) {
      continue;
    }

    // Filter by Favorites
    if (parsed.onlyFavorites && !track.isFavorite) {
      continue;
    }

    // Filter by Local
    if (parsed.onlyLocal && !track.isLocalFile) {
      continue;
    }

    // Key match
    if (parsed.targetKey) {
      if (track.key && track.key.toLowerCase() === parsed.targetKey.toLowerCase()) {
        score += 40;
        matchReasons.push(`Key: ${track.key}`);
      } else {
        // Key was explicitly requested but this track doesn't match
        continue;
      }
    }

    // Track Type match
    if (parsed.targetType) {
      const typeStr = (track.typeTag || track.trackType || '').toLowerCase();
      if (typeStr.includes(parsed.targetType.toLowerCase())) {
        score += 35;
        matchReasons.push(`Type: ${parsed.targetType}`);
      } else {
        // Explicit type didn't match
        continue;
      }
    }

    // BPM Constraints
    if (parsed.targetBpm !== null) {
      if (track.bpm) {
        const diff = Math.abs(track.bpm - parsed.targetBpm);
        if (diff === 0) {
          score += 45;
          matchReasons.push(`Exact ${track.bpm} BPM`);
        } else if (diff <= 5) {
          score += 30 - diff * 2;
          matchReasons.push(`~${track.bpm} BPM`);
        } else {
          // Outside BPM tolerance
          continue;
        }
      } else {
        continue;
      }
    } else {
      if (parsed.minBpm !== null) {
        if (!track.bpm || track.bpm < parsed.minBpm) continue;
        score += 25;
        matchReasons.push(`≥${parsed.minBpm} BPM`);
      }
      if (parsed.maxBpm !== null) {
        if (!track.bpm || track.bpm > parsed.maxBpm) continue;
        score += 25;
        matchReasons.push(`≤${parsed.maxBpm} BPM`);
      }
    }

    // Mood match
    if (parsed.targetMood) {
      if (track.mood && track.mood.toLowerCase().includes(parsed.targetMood.toLowerCase())) {
        score += 30;
        matchReasons.push(`Mood: ${track.mood}`);
      } else {
        // Penalize or drop if mood was specifically specified
        score -= 10;
      }
    }

    // Tags match
    if (parsed.targetTags.length > 0) {
      let tagHits = 0;
      const trackTags = (track.customTags || []).map(t => t.toLowerCase());
      if (track.genre) trackTags.push(track.genre.toLowerCase());

      for (const t of parsed.targetTags) {
        const tLower = t.toLowerCase();
        if (trackTags.some(tag => tag.includes(tLower))) {
          tagHits++;
          matchReasons.push(`#${t}`);
        }
      }

      if (tagHits > 0) {
        score += tagHits * 35;
      } else {
        // Tag was specified but none matched on this track
        continue;
      }
    }

    // Text Keywords match (Title, Artist, Album, File Name)
    if (parsed.textKeywords.length > 0) {
      const titleLower = track.title.toLowerCase();
      const artistLower = track.artist.toLowerCase();
      const albumLower = (track.album || '').toLowerCase();
      const combined = `${titleLower} ${artistLower} ${albumLower}`;

      let textHit = false;
      for (const word of parsed.textKeywords) {
        if (titleLower === word) {
          score += 55;
          matchReasons.push('Exact Title Match');
          textHit = true;
        } else if (titleLower.startsWith(word)) {
          score += 35;
          matchReasons.push('Title Prefix');
          textHit = true;
        } else if (titleLower.includes(word)) {
          score += 25;
          matchReasons.push('Title match');
          textHit = true;
        } else if (artistLower.includes(word)) {
          score += 25;
          matchReasons.push(`Artist: ${track.artist}`);
          textHit = true;
        } else if (combined.includes(word)) {
          score += 15;
          textHit = true;
        }
      }

      if (!textHit) {
        // User typed text terms that don't match this track
        continue;
      }
    }

    // Bonus for favorites & play counts
    if (track.isFavorite) {
      score += 8;
    }
    score += Math.min(15, (track.playCount || 0) * 1.5);

    results.push({
      track,
      score,
      matchReasons: Array.from(new Set(matchReasons))
    });
  }

  // Sort according to intent or relevance score
  results.sort((a, b) => {
    if (parsed.sortByIntent === 'playCount') {
      return (b.track.playCount || 0) - (a.track.playCount || 0);
    } else if (parsed.sortByIntent === 'dateAdded') {
      return b.track.dateAdded - a.track.dateAdded;
    } else if (parsed.sortByIntent === 'bpm') {
      return (b.track.bpm || 0) - (a.track.bpm || 0);
    }
    return b.score - a.score;
  });

  return results;
}

export const SMART_PRESETS = [
  { label: '🔥 Top Hits', query: 'popular beats', icon: 'Flame' },
  { label: '⚡ 140+ Trap', query: '>140 bpm trap', icon: 'Zap' },
  { label: '🌙 Melodic Lo-Fi', query: 'lo-fi melodic chill', icon: 'Moon' },
  { label: '🎹 C Minor Loops', query: 'c minor loops', icon: 'Music' },
  { label: '⭐ Favorites', query: 'favorites', icon: 'Star' },
  { label: '🥁 Heavy 808s', query: '808 drums', icon: 'Activity' },
];
