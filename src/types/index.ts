export type StreamType = 'hls' | 'dash' | 'mp4' | 'rtmp' | 'youtube' | 'twitch' | 'iframe';

export interface Stream {
  id: string;
  url: string;
  name: string;
  thumbnail?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  type: StreamType;
  order: number;
  isVisible: boolean;
  isMuted: boolean;
  volume: number;
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
  defaultQuality: 'auto' | 'highest' | 'medium' | 'lowest' | 'data-saver';
  maxStreams: number;
  hardwareAcceleration: boolean;
  useWebWorker: boolean;
  bufferSize: number; // 1 to 10
  abrAggressiveness: 'conservative' | 'balanced' | 'aggressive';
  frameRateLimit: 15 | 24 | 30 | 60 | 0; // 0 for unlimited
  maxResolution: '480p' | '720p' | '1080p' | '1440p' | '4K';
  backgroundAudio: boolean;
  showLabels?: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  audioDucking: boolean;
  audioDuckingPercentage: number;
  normalization: boolean;
}

export interface NetworkSettings {
  bandwidthLimit: number; // 0 for unlimited
  connectionTimeout: number;
  reconnectAttempts: number;
  reconnectDelay: number;
  proxyUrl?: string;
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
  streams: Stream[];
  displaySettings: DisplaySettings;
  videoSettings: VideoPerformanceSettings;
  audioSettings: AudioSettings;
  networkSettings: NetworkSettings;
  backgroundLayers: BackgroundConfig[];
  activeBackgroundProfile: string;
}
