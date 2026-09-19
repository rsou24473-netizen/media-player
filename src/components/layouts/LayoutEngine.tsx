import React from 'react';
import { useMedia } from '../../context/MediaContext';
import { OfftopView } from '../OfftopView';
import { MusicRoom3DView } from './MusicRoom3DView';
import { OrbitLayoutView } from './OrbitLayoutView';
import { LivingInterfaceView } from './LivingInterfaceView';
import { BentoGridView } from './BentoGridView';
import { MasonryGridView } from './MasonryGridView';
import { EditorialSplitView } from './EditorialSplitView';
import { FilmstripView } from './FilmstripView';
import { CollageView } from './CollageView';
import { FullBleedView } from './FullBleedView';
import { HorizontalScrollView } from './HorizontalScrollView';
import { MinimalistGalleryView } from './MinimalistGalleryView';
import { PosterLayoutView } from './PosterLayoutView';

export const LayoutEngine: React.FC = () => {
  const { activeLayout } = useMedia();

  switch (activeLayout) {
    case 'music_room_3d':
      return <MusicRoom3DView />;
    case 'orbit':
      return <OrbitLayoutView />;
    case 'living_interface':
      return <LivingInterfaceView />;
    case 'bento_grid':
      return <BentoGridView />;
    case 'masonry_grid':
      return <MasonryGridView />;
    case 'editorial_split':
      return <EditorialSplitView />;
    case 'filmstrip':
      return <FilmstripView />;
    case 'collage':
      return <CollageView />;
    case 'full_bleed':
      return <FullBleedView />;
    case 'horizontal_scroll':
      return <HorizontalScrollView />;
    case 'minimalist_gallery':
      return <MinimalistGalleryView />;
    case 'poster_layout':
      return <PosterLayoutView />;
    case 'two_panel':
    default:
      return <OfftopView />;
  }
};
