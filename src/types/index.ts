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
  showLabels: boolean;
  showClock: boolean;
  overlayOpacity: number;
  animatedTransitions: boolean;
}

export interface InterfaceSettings {
  language: string;
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  fontSize: number;
  animations: boolean;
  reducedMotion: boolean;
  compactMode: boolean;
  showFPS: boolean;
  showStreamTimer: boolean;
  tooltipDelay: number;
}

export interface NetworkSettings {
  connectionOverride: 'auto' | 'wifi' | '4g' | '3g' | '2g' | 'slow';
  maxStreams: number;
  qualityYouTube: string;
  qualityTwitch: string;
  qualityKick: string;
  qualityOther: string;
  autoQuality: boolean;
  enableBandwidthLimit: boolean;
  bandwidthLimit: number; // Mbps
  autoPauseOffScreen: boolean;
  lazyLoad: boolean;
  preloadStrategy: 'none' | 'conservative' | 'balanced' | 'aggressive';
  connectionTimeout: number;
  autoReconnect: boolean;
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  showDebugInfo: boolean;
}

export interface SpeedTestResult {
  timestamp: number;
  download: number;
  upload: number;
  ping: number;
  jitter: number;
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
  interfaceSettings: InterfaceSettings;
  networkSettings: NetworkSettings;
  speedTestHistory: SpeedTestResult[];
  backgroundLayers: BackgroundConfig[];
  recentUrls: string[];
}
