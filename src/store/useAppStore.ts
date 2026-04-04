import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Channel,
  DisplaySettings,
  InterfaceSettings,
  NetworkSettings,
  SpeedTestResult,
  BackgroundConfig
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { BACKGROUND_PRESETS } from '@/lib/background/presets';

interface AppStore {
  channels: Channel[];
  displaySettings: DisplaySettings;
  interfaceSettings: InterfaceSettings;
  networkSettings: NetworkSettings;
  speedTestHistory: SpeedTestResult[];
  backgroundLayers: BackgroundConfig[];
  recentUrls: string[];
  sidebarOpen: boolean;
  isSettingsOpen: boolean;
  focusedChannelId: string | null;

  // Actions
  addChannel: (channel: Omit<Channel, 'id' | 'order' | 'addedAt' | 'isLive' | 'lastLiveCheck'>) => void;
  removeChannel: (id: string) => void;
  updateChannel: (id: string, updates: Partial<Channel>) => void;
  reorderChannels: (newOrder: string[]) => void;

  setDisplaySettings: (settings: Partial<DisplaySettings>) => void;
  setInterfaceSettings: (settings: Partial<InterfaceSettings>) => void;
  setNetworkSettings: (settings: Partial<NetworkSettings>) => void;
  addSpeedTestResult: (result: SpeedTestResult) => void;
  clearSpeedTestHistory: () => void;

  setBackgroundLayers: (layers: BackgroundConfig[]) => void;
  updateBackgroundLayer: (id: string, updates: Partial<BackgroundConfig>) => void;

  setSidebarOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setFocusedChannelId: (id: string | null) => void;

  importChannels: (channels: Channel[]) => void;
  resetSettings: () => void;
  randomizeBackground: () => void;
}

const DEFAULT_DISPLAY: DisplaySettings = {
  gridLayout: 'auto',
  showLabels: true,
  showClock: true,
  overlayOpacity: 0.8,
  animatedTransitions: true,
};

const DEFAULT_INTERFACE: InterfaceSettings = {
  language: 'English',
  theme: 'dark',
  accentColor: '#00FFFF',
  fontSize: 14,
  animations: true,
  reducedMotion: false,
  compactMode: false,
  showFPS: false,
  showStreamTimer: true,
  tooltipDelay: 300,
};

const DEFAULT_NETWORK: NetworkSettings = {
  connectionOverride: 'auto',
  maxStreams: 12,
  qualityYouTube: 'Auto',
  qualityTwitch: 'Auto',
  qualityKick: 'Auto',
  qualityOther: 'Auto',
  autoQuality: true,
  enableBandwidthLimit: false,
  bandwidthLimit: 10,
  autoPauseOffScreen: true,
  lazyLoad: true,
  preloadStrategy: 'balanced',
  connectionTimeout: 15,
  autoReconnect: true,
  maxRetries: 3,
  retryDelay: 5,
  exponentialBackoff: true,
  showDebugInfo: false,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      channels: [],
      displaySettings: DEFAULT_DISPLAY,
      interfaceSettings: DEFAULT_INTERFACE,
      networkSettings: DEFAULT_NETWORK,
      speedTestHistory: [],
      backgroundLayers: BACKGROUND_PRESETS.Midnight,
      recentUrls: [],
      sidebarOpen: true,
      isSettingsOpen: false,
      focusedChannelId: null,

      addChannel: (channel) => set((state) => {
        const newChannel = {
          ...channel,
          id: uuidv4(),
          order: state.channels.length,
          addedAt: Date.now(),
          isLive: true,
          lastLiveCheck: Date.now(),
        };
        const updatedRecent = [channel.channelUrl, ...state.recentUrls.filter(u => u !== channel.channelUrl)].slice(0, 10);
        return {
          channels: [...state.channels, newChannel],
          recentUrls: updatedRecent
        };
      }),

      removeChannel: (id) => set((state) => ({
        channels: state.channels.filter((s) => s.id !== id),
      })),

      updateChannel: (id, updates) => set((state) => ({
        channels: state.channels.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      })),

      reorderChannels: (newOrder) => set((state) => {
        const channelMap = new Map(state.channels.map(s => [s.id, s]));
        return {
          channels: newOrder.map((id, index) => {
            const ch = channelMap.get(id);
            return ch ? { ...ch, order: index } : null;
          }).filter(Boolean) as Channel[]
        };
      }),

      setDisplaySettings: (settings) => set((state) => ({
        displaySettings: { ...state.displaySettings, ...settings },
      })),

      setInterfaceSettings: (settings) => set((state) => ({
        interfaceSettings: { ...state.interfaceSettings, ...settings },
      })),

      setNetworkSettings: (settings) => set((state) => ({
        networkSettings: { ...state.networkSettings, ...settings },
      })),

      addSpeedTestResult: (result) => set((state) => ({
        speedTestHistory: [result, ...state.speedTestHistory].slice(0, 5)
      })),

      clearSpeedTestHistory: () => set({ speedTestHistory: [] }),

      setBackgroundLayers: (layers) => set({ backgroundLayers: layers }),

      updateBackgroundLayer: (id, updates) => set((state) => ({
        backgroundLayers: state.backgroundLayers.map((l) =>
          l.id === id ? { ...l, ...updates, properties: { ...l.properties, ...updates.properties } } : l
        ),
      })),

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
      setFocusedChannelId: (focusedChannelId) => set({ focusedChannelId }),

      importChannels: (channels) => set({ channels }),

      resetSettings: () => set({
        displaySettings: DEFAULT_DISPLAY,
        interfaceSettings: DEFAULT_INTERFACE,
        networkSettings: DEFAULT_NETWORK,
        speedTestHistory: [],
      }),

      randomizeBackground: () => set(() => {
        const presetKeys = Object.keys(BACKGROUND_PRESETS);
        const randomKey = presetKeys[Math.floor(Math.random() * presetKeys.length)];
        return { backgroundLayers: BACKGROUND_PRESETS[randomKey] };
      }),
    }),
    {
      name: 'multilive-storage',
      partialize: (state) => ({
        channels: state.channels,
        displaySettings: state.displaySettings,
        interfaceSettings: state.interfaceSettings,
        networkSettings: state.networkSettings,
        speedTestHistory: state.speedTestHistory,
        backgroundLayers: state.backgroundLayers,
        recentUrls: state.recentUrls,
      }),
    }
  )
);
