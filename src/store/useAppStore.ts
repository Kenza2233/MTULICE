import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Stream,
  DisplaySettings,
  VideoPerformanceSettings,
  AudioSettings,
  NetworkSettings,
  BackgroundConfig
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AppStore {
  streams: Stream[];
  displaySettings: DisplaySettings;
  videoSettings: VideoPerformanceSettings;
  audioSettings: AudioSettings;
  networkSettings: NetworkSettings;
  backgroundLayers: BackgroundConfig[];
  sidebarOpen: boolean;
  isSettingsOpen: boolean;
  focusedStreamId: string | null;

  // Actions
  addStream: (stream: Omit<Stream, 'id' | 'order' | 'isVisible' | 'isMuted' | 'volume'>) => void;
  removeStream: (id: string) => void;
  updateStream: (id: string, updates: Partial<Stream>) => void;
  reorderStreams: (newOrder: string[]) => void;

  setDisplaySettings: (settings: Partial<DisplaySettings>) => void;
  setVideoSettings: (settings: Partial<VideoPerformanceSettings>) => void;
  setAudioSettings: (settings: Partial<AudioSettings>) => void;
  setNetworkSettings: (settings: Partial<NetworkSettings>) => void;

  setBackgroundLayers: (layers: BackgroundConfig[]) => void;
  updateBackgroundLayer: (id: string, updates: Partial<BackgroundConfig>) => void;

  setSidebarOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setFocusedStreamId: (id: string | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      streams: [],
      displaySettings: {
        gridLayout: 'auto',
        theme: 'dark',
        accentColor: '#00d4ff',
        showLabels: true,
        showClock: true,
        fontSize: 14,
        overlayOpacity: 0.8,
        animatedTransitions: true,
      },
      videoSettings: {
        defaultQuality: 'auto',
        maxStreams: 12,
        hardwareAcceleration: true,
        useWebWorker: true,
        bufferSize: 3,
        abrAggressiveness: 'balanced',
        frameRateLimit: 0,
        maxResolution: '1080p',
        backgroundAudio: false,
      },
      audioSettings: {
        masterVolume: 1,
        audioDucking: true,
        audioDuckingPercentage: 30,
        normalization: false,
      },
      networkSettings: {
        bandwidthLimit: 0,
        connectionTimeout: 5,
        reconnectAttempts: 5,
        reconnectDelay: 2000,
      },
      backgroundLayers: [
        {
          id: 'base-layer',
          name: 'Base Layer',
          type: 'solid',
          properties: {
            color: '#0a0a0f',
          },
          layerSettings: {
            opacity: 1,
            blendMode: 'normal',
            isVisible: true,
          },
        },
      ],
      sidebarOpen: true,
      isSettingsOpen: false,
      focusedStreamId: null,

      addStream: (stream) => set((state) => ({
        streams: [
          ...state.streams,
          {
            ...stream,
            id: uuidv4(),
            order: state.streams.length,
            isVisible: true,
            isMuted: false,
            volume: 1,
          },
        ],
      })),

      removeStream: (id) => set((state) => ({
        streams: state.streams.filter((s) => s.id !== id),
      })),

      updateStream: (id, updates) => set((state) => ({
        streams: state.streams.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      })),

      reorderStreams: (newOrder) => set((state) => {
        const streamMap = new Map(state.streams.map(s => [s.id, s]));
        return {
          streams: newOrder.map((id, index) => ({
            ...streamMap.get(id)!,
            order: index,
          }))
        };
      }),

      setDisplaySettings: (settings) => set((state) => ({
        displaySettings: { ...state.displaySettings, ...settings },
      })),

      setVideoSettings: (settings) => set((state) => ({
        videoSettings: { ...state.videoSettings, ...settings },
      })),

      setAudioSettings: (settings) => set((state) => ({
        audioSettings: { ...state.audioSettings, ...settings },
      })),

      setNetworkSettings: (settings) => set((state) => ({
        networkSettings: { ...state.networkSettings, ...settings },
      })),

      setBackgroundLayers: (layers) => set({ backgroundLayers: layers }),

      updateBackgroundLayer: (id, updates) => set((state) => ({
        backgroundLayers: state.backgroundLayers.map((l) =>
          l.id === id ? { ...l, ...updates, properties: { ...l.properties, ...updates.properties } } : l
        ),
      })),

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
      setFocusedStreamId: (focusedStreamId) => set({ focusedStreamId }),
    }),
    {
      name: 'multilive-storage',
      partialize: (state) => ({
        streams: state.streams,
        displaySettings: state.displaySettings,
        videoSettings: state.videoSettings,
        audioSettings: state.audioSettings,
        networkSettings: state.networkSettings,
        backgroundLayers: state.backgroundLayers,
      }),
    }
  )
);
