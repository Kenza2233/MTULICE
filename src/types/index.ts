export type PlatformType =
  | 'youtube'
  | 'twitch'
  | 'tiktok'
  | 'kick'
  | 'facebook'
  | 'trovo'
  | 'dlive'
  | 'rumble'
  | 'custom';

export interface Channel {
  id: string;
  name: string;
  avatarUrl?: string;
  platform: PlatformType;
  channelUrl: string;
  tags: string[];
  autoAddWhenLive: boolean;
  priority: number; // 1-5
  isLive: boolean;
  currentStreamUrl?: string;
  lastLiveCheck: number;
  addedAt: number;
  order: number;
}

export type GridPreference = 'auto' | '4x3' | '3x2' | '2x2';

export interface DisplaySettings {
  gridLayout: GridPreference;
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  showLabels: boolean;
  showClock: boolean;
  fontSize: number;
  overlayOpacity: number;
  animatedTransitions: boolean;
}

export interface VideoPerformanceSettings {
  maxStreams: number;
  showLabels?: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  audioDucking: boolean;
  audioDuckingPercentage: number;
}

export type BackgroundType = 'solid' | 'gradient' | 'image' | 'video' | 'live' | 'youtube';

export interface GradientStop {
  color: string;
  position: number;
}

export interface BackgroundConfig {
  id: string;
  name: string;
  type: BackgroundType;
  properties: {
    color?: string;
    gradientType?: 'linear' | 'radial';
    gradientAngle?: number;
    gradientStops?: GradientStop[];
    animatedGradient?: boolean;
    url?: string;
    fitMode?: 'cover' | 'contain' | 'stretch' | 'tile' | 'center';
    position?: { x: number; y: number };
    zoom?: number;
    blur?: number;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    sepia?: boolean;
    grayscale?: boolean;
    playbackSpeed?: number;
    loop?: boolean;
    mute?: boolean;
    startTime?: number;
    fpsLimit?: 15 | 30 | 60;
  };
  layerSettings: {
    opacity: number;
    blendMode: string;
    isVisible: boolean;
  };
}

export interface AppState {
  channels: Channel[];
  displaySettings: DisplaySettings;
  videoSettings: VideoPerformanceSettings;
  audioSettings: AudioSettings;
  backgroundLayers: BackgroundConfig[];
  recentUrls: string[];
}
