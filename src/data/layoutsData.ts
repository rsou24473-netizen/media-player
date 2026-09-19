import { LayoutConfig, LayoutMode } from '../types';

export const APP_LAYOUTS: Record<LayoutMode, LayoutConfig> = {
  two_panel: {
    id: 'two_panel',
    name: 'Tessera Two-Panel',
    category: 'Editorial & Grid',
    description: 'Precision dual-column studio layout with quick-filter chips, tracks list, and notched pack cards.',
    badge: 'Default Studio',
    iconName: 'Columns2'
  },
  music_room_3d: {
    id: 'music_room_3d',
    name: '3D Music Room',
    category: 'Experimental 3D',
    description: 'Center floating 3D holographic video portal with physical angled 3D track cards and integrated waveform seekbar.',
    badge: 'Spatial 3D',
    iconName: 'Box'
  },
  orbit: {
    id: 'orbit',
    name: 'Orbit Planetary System',
    category: 'Experimental 3D',
    description: 'Tracks orbit dynamically around the central 3D video node with orbital speed and interactive planetary nodes.',
    badge: 'Holographic',
    iconName: 'Orbit'
  },
  living_interface: {
    id: 'living_interface',
    name: 'Living Interface (Beat-Reactive)',
    category: 'Cinematic & Immersive',
    description: 'The entire UI is a visualizer: kicks trigger depth jumps, bass expands geometry, and typography floats on vocals.',
    badge: 'Audiovisual Reactive',
    iconName: 'Activity'
  },
  bento_grid: {
    id: 'bento_grid',
    name: 'Bento Grid Studio',
    category: 'Editorial & Grid',
    description: 'Modular high-density tiles of diverse dimensions arranged into a harmonious unified dashboard composition.',
    badge: 'Modular Bento',
    iconName: 'LayoutGrid'
  },
  masonry_grid: {
    id: 'masonry_grid',
    name: 'Masonry Media Wall',
    category: 'Editorial & Grid',
    description: 'Irregular staggered tiles with diverse aspect ratios, dynamic height cards, and media prominence.',
    badge: 'Dynamic Masonry',
    iconName: 'Grid3X3'
  },
  editorial_split: {
    id: 'editorial_split',
    name: 'Editorial Split Spread',
    category: 'Editorial & Grid',
    description: 'Hero visualizer/artwork dominates the left column with refined magazine typography and tracks on the right.',
    badge: 'Editorial',
    iconName: 'SplitSquareVertical'
  },
  filmstrip: {
    id: 'filmstrip',
    name: '35mm Filmstrip Reel',
    category: 'Cinematic & Immersive',
    description: 'Cinematic horizontal film frames with sprocket holes, timeline timecodes, and frame-by-frame scrubbers.',
    badge: '35mm Reel',
    iconName: 'Film'
  },
  collage: {
    id: 'collage',
    name: 'Tactile Collage & Vinyl',
    category: 'Cinematic & Immersive',
    description: 'Mixed vinyl textures, angled cassette cards, tape stickers, and layered tactile typography.',
    badge: 'Tactile Collage',
    iconName: 'Layers'
  },
  full_bleed: {
    id: 'full_bleed',
    name: 'Full-Bleed Cinema',
    category: 'Cinematic & Immersive',
    description: 'Edge-to-edge full viewport visual video canvas with minimal floating frosted glass controls.',
    badge: 'Cinema',
    iconName: 'Maximize2'
  },
  horizontal_scroll: {
    id: 'horizontal_scroll',
    name: 'Horizontal Showcase Reel',
    category: 'Cinematic & Immersive',
    description: 'Fluid sideways-moving panoramic media cards with smooth inertia and horizontal track cards.',
    badge: 'Panoramic',
    iconName: 'MoveHorizontal'
  },
  minimalist_gallery: {
    id: 'minimalist_gallery',
    name: 'Minimalist Monolith Gallery',
    category: 'Editorial & Grid',
    description: 'Generous architectural negative space, hairline borders, and pure typographic discipline.',
    badge: 'Minimalist',
    iconName: 'Square'
  },
  poster_layout: {
    id: 'poster_layout',
    name: 'Swiss Typographic Poster',
    category: 'Editorial & Grid',
    description: 'Giant oversized display headlines, bold graphic badges, and dominant hero media blocks.',
    badge: 'Swiss Poster',
    iconName: 'Newspaper'
  }
};
