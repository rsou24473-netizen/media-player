import React from 'react';
import { MediaProvider, useMedia } from './context/MediaContext';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { LayoutEngine } from './components/layouts/LayoutEngine';
import { FluentView } from './components/FluentView';
import { VideoPlayerView } from './components/VideoPlayerView';
import { TransportBar } from './components/TransportBar';
import { EqualizerModal } from './components/EqualizerModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ImportModal } from './components/ImportModal';
import { CreatePackModal } from './components/CreatePackModal';
import { EditTrackModal } from './components/EditTrackModal';
import { NowPlayingDrawer } from './components/NowPlayingDrawer';
import { ProfileModal } from './components/ProfileModal';
import { LayoutsModal } from './components/LayoutsModal';
import { ThemeModal } from './components/ThemeModal';
import { MainMenuDrawer } from './components/MainMenuDrawer';
import { SearchPopoutModal } from './components/SearchPopoutModal';
import { PackDetailModal } from './components/PackDetailModal';

const MainLayout: React.FC = () => {
  const { uiMode, themeConfig, activeLayout } = useMedia();

  return (
    <div className={`flex flex-col h-screen w-screen ${themeConfig.primaryBg || 'bg-[#121214]'} text-[#ededef] overflow-hidden select-none font-sans transition-colors duration-300`}>
      {/* Top Header Navigation */}
      <Header />

      {/* Global Filter Bar: shown in standard layouts */}
      {activeLayout !== 'music_room_3d' && <FilterBar />}

      {/* Main View Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {uiMode === 'offtop' && <LayoutEngine />}
        {uiMode === 'fluent' && <FluentView />}
        {uiMode === 'video_theater' && <VideoPlayerView />}
      </div>

      {/* Bottom Transport Player: only in standard layouts since 3D Music Room has its own dedicated integrated waveform seeker & controls */}
      {activeLayout !== 'music_room_3d' && <TransportBar />}

      {/* Overlays, Drawers & Modals */}
      <NowPlayingDrawer />
      <MainMenuDrawer />
      <ProfileModal />
      <LayoutsModal />
      <ThemeModal />
      <EqualizerModal />
      <KeyboardShortcutsModal />
      <ImportModal />
      <CreatePackModal />
      <EditTrackModal />
      <SearchPopoutModal />
      <PackDetailModal />
    </div>
  );
};

export default function App() {
  return (
    <MediaProvider>
      <MainLayout />
    </MediaProvider>
  );
}
