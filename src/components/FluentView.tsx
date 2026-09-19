import React, { useState } from 'react';
import { useMedia } from '../context/MediaContext';
import { MediaItem } from '../types';
import {
  Music,
  Disc3,
  Users,
  ListMusic,
  Film,
  FolderLock,
  Tv,
  Settings,
  Shuffle,
  Play,
  Pause,
  Trash2,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  List,
  Edit2,
  Heart
} from 'lucide-react';

export const FluentView: React.FC = () => {
  const {
    mediaList,
    filteredMedia,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    toggleFavorite,
    deleteMedia,
    filters,
    setFilters,
    setIsNowPlayingOpen,
    setIsImportOpen,
    openEditTrack,
    packs,
    openPackDetail,
    setIsCreatePackOpen
  } = useMedia();

  const [activeNav, setActiveNav] = useState<'songs' | 'artists' | 'albums' | 'playlists' | 'videos'>('albums');
  const [viewStyle, setViewStyle] = useState<'grid' | 'table'>('grid');

  // Group media by albums
  const albumMap = new Map<string, { title: string; artist: string; coverUrl?: string; tracks: MediaItem[] }>();
  mediaList.forEach((track) => {
    const albumName = track.album || 'Unknown Album';
    if (!albumMap.has(albumName)) {
      albumMap.set(albumName, {
        title: albumName,
        artist: track.artist,
        coverUrl: track.coverUrl,
        tracks: []
      });
    }
    albumMap.get(albumName)!.tracks.push(track);
  });

  const albums = Array.from(albumMap.values());

  // Group media by artists
  const artistMap = new Map<string, { name: string; tracks: MediaItem[] }>();
  mediaList.forEach((track) => {
    const artistName = track.artist.split(',')[0].trim();
    if (!artistMap.has(artistName)) {
      artistMap.set(artistName, { name: artistName, tracks: [] });
    }
    artistMap.get(artistName)!.tracks.push(track);
  });

  const artists = Array.from(artistMap.values());

  const handleShuffleAll = () => {
    if (mediaList.length === 0) return;
    const shuffled = [...mediaList].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
  };

  return (
    <div className="flex-1 flex h-full bg-[#181519] text-[#ededef] overflow-hidden pb-24 select-none">
      {/* Windows 11 Fluent Acrylic Sidebar */}
      <aside className="w-56 bg-[#211a21]/90 backdrop-blur-2xl border-r border-white/5 flex flex-col justify-between p-3 shrink-0">
        <div className="space-y-4">
          {/* Header Back & Window Header title */}
          <div className="flex items-center gap-2 px-2 py-1 text-xs font-bold text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Fluent Media Player</span>
          </div>

          {/* Sidebar Search */}
          <div className="px-1">
            <input
              type="text"
              placeholder="Search..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-[#2a222a] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Section: Music */}
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Music
            </div>
            
            <button
              onClick={() => setActiveNav('songs')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeNav === 'songs'
                  ? 'bg-white/10 text-white font-bold border-l-2 border-rose-500'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Music className="w-4 h-4 text-rose-400" /> Songs
            </button>

            <button
              onClick={() => setActiveNav('artists')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeNav === 'artists'
                  ? 'bg-white/10 text-white font-bold border-l-2 border-rose-500'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4 text-purple-400" /> Artists
            </button>

            <button
              onClick={() => setActiveNav('albums')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeNav === 'albums'
                  ? 'bg-white/10 text-white font-bold border-l-2 border-rose-500'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Disc3 className="w-4 h-4 text-blue-400" /> Albums
            </button>

            <button
              onClick={() => setActiveNav('playlists')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeNav === 'playlists'
                  ? 'bg-white/10 text-white font-bold border-l-2 border-rose-500'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ListMusic className="w-4 h-4 text-emerald-400" /> Playlists
            </button>
          </div>

          {/* Section: Films & TV */}
          <div className="space-y-1 pt-2 border-t border-white/5">
            <div className="px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Films & TV
            </div>

            <button
              onClick={() => setActiveNav('videos')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeNav === 'videos'
                  ? 'bg-white/10 text-white font-bold border-l-2 border-rose-500'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="w-4 h-4 text-cyan-400" /> Videos & Clips
            </button>

            <button
              onClick={() => setIsImportOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <FolderLock className="w-4 h-4 text-amber-400" /> Personal Files
            </button>
          </div>
        </div>

        {/* Sidebar Bottom Nav */}
        <div className="space-y-1 pt-2 border-t border-white/5">
          <button
            onClick={() => setIsNowPlayingOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Play className="w-4 h-4 text-rose-400" /> Now Playing
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Plus className="w-4 h-4 text-blue-400" /> Add Media
          </button>
        </div>
      </aside>

      {/* Fluent Main Stage */}
      <main className="flex-1 flex flex-col overflow-hidden p-6 md:p-8 space-y-6">
        {/* Top Header & Command Bar */}
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white capitalize">
            {activeNav}
          </h1>

          {/* Fluent Command Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-white/5 pb-4 text-xs font-semibold">
            {/* Shuffle all */}
            <button
              onClick={handleShuffleAll}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5 text-rose-400" /> Shuffle all
            </button>

            {/* View style toggle */}
            <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/5">
              <button
                onClick={() => setViewStyle('grid')}
                className={`p-1.5 rounded-md ${viewStyle === 'grid' ? 'bg-white/15 text-white' : 'text-neutral-400'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewStyle('table')}
                className={`p-1.5 rounded-md ${viewStyle === 'table' ? 'bg-white/15 text-white' : 'text-neutral-400'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sort */}
            <button
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                }));
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort ({filters.sortOrder})
            </button>

            <div className="h-4 w-[1px] bg-white/10 mx-1" />

            {/* Add to */}
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" /> Add to library
            </button>
          </div>
        </div>

        {/* Dynamic Nav View Content */}
        <div className="flex-1 overflow-y-auto">
          {activeNav === 'albums' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
              {albums.map((album) => (
                <div
                  key={album.title}
                  onClick={() => {
                    if (album.tracks.length > 0) {
                      playTrack(album.tracks[0], album.tracks);
                    }
                  }}
                  className="group flex flex-col cursor-pointer transition-transform hover:-translate-y-1"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-lg group-hover:shadow-rose-500/10">
                    <img
                      src={album.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'}
                      alt={album.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/50">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <div className="text-xs font-bold text-white truncate group-hover:text-rose-400 transition-colors">
                      {album.title}
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate">
                      {album.artist}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeNav === 'artists' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
              {artists.map((artist) => (
                <div
                  key={artist.name}
                  onClick={() => {
                    if (artist.tracks.length > 0) {
                      playTrack(artist.tracks[0], artist.tracks);
                    }
                  }}
                  className="group flex flex-col items-center text-center cursor-pointer p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-purple-500 transition-colors shadow-lg mb-3">
                    <img
                      src={artist.tracks[0]?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop'}
                      alt={artist.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="text-xs font-bold text-white truncate max-w-full">
                    {artist.name}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {artist.tracks.length} track{artist.tracks.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeNav === 'playlists' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
              {/* Create New Pack Card */}
              <div
                onClick={() => setIsCreatePackOpen(true)}
                className="group flex flex-col cursor-pointer transition-transform hover:-translate-y-1"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-dashed border-white/20 hover:border-white/40 flex items-center justify-center">
                  <Plus className="w-10 h-10 text-neutral-400 group-hover:text-white transition-colors" />
                </div>
                <div className="mt-2.5">
                  <div className="text-xs font-bold text-neutral-300 group-hover:text-white">Create New Playlist / Pack</div>
                  <div className="text-[11px] text-neutral-500">Add beats or existing tracks</div>
                </div>
              </div>

              {/* Existing Pack Cards */}
              {packs.map((pack) => (
                <div
                  key={pack.id}
                  onClick={() => openPackDetail(pack.id)}
                  className="group flex flex-col cursor-pointer transition-transform hover:-translate-y-1"
                >
                  <div 
                    className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-lg group-hover:shadow-emerald-500/10"
                    style={{ backgroundColor: pack.coverColor || '#18181b' }}
                  >
                    {pack.isVideoCover || (pack.coverUrl && /\.(mp4|webm|mkv|mov|avi)$/i.test(pack.coverUrl)) || pack.videoUrl ? (
                      <video
                        src={pack.videoUrl || pack.coverUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <img
                        src={pack.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'}
                        alt={pack.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <div className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                      {pack.title}
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate">
                      By {pack.producer || 'PRODUCER'} · {pack.trackCount} beats
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(activeNav === 'songs' || activeNav === 'videos') && (
            <div className="bg-[#1f1920] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400 font-semibold bg-black/20">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Artist</th>
                    <th className="py-3 px-4 hidden md:table-cell">Album</th>
                    <th className="py-3 px-4 text-right">Duration</th>
                    <th className="py-3 px-4 w-24 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {filteredMedia
                    .filter(m => activeNav === 'videos' ? m.type === 'video' : true)
                    .map((track, idx) => {
                      const isCurrent = currentTrack?.id === track.id;
                      return (
                        <tr
                          key={track.id}
                          onClick={() => playTrack(track, filteredMedia)}
                          className={`cursor-pointer transition-colors group ${
                            isCurrent
                              ? 'bg-rose-500/10 text-rose-400 font-bold'
                              : 'hover:bg-white/5 text-neutral-300'
                          }`}
                        >
                          <td className="py-3 px-4 text-center font-mono text-neutral-500">
                            {isCurrent && isPlaying ? (
                              <Pause className="w-3.5 h-3.5 mx-auto text-rose-400 fill-current" />
                            ) : (
                              idx + 1
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={track.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-lg object-cover"
                              />
                              <span className="truncate">{track.title}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-neutral-400 truncate">{track.artist}</td>
                          <td className="py-3 px-4 text-neutral-500 hidden md:table-cell truncate">
                            {track.album || '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-neutral-400">
                            {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditTrack(track);
                                }}
                                title="Edit track"
                                className="p-1 text-neutral-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(track.id);
                                }}
                                className="p-1 hover:text-rose-500 transition-colors"
                              >
                                <Heart className={`w-3.5 h-3.5 ${track.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-neutral-500'}`} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
