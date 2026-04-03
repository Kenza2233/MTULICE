import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Channel,
  DisplaySettings,
  VideoPerformanceSettings,
  AudioSettings,
  BackgroundConfig
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { BACKGROUND_PRESETS } from '@/lib/background/presets';

interface AppStore {
  channels: Channel[];
  displaySettings: DisplaySettings;
  videoSettings: VideoPerformanceSettings;
  audioSettings: AudioSettings;
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
  setVideoSettings: (settings: Partial<VideoPerformanceSettings>) => void;
  setAudioSettings: (settings: Partial<AudioSettings>) => void;

  setBackgroundLayers: (layers: BackgroundConfig[]) => void;
  updateBackgroundLayer: (id: string, updates: Partial<BackgroundConfig>) => void;

  setSidebarOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setFocusedChannelId: (id: string | null) => void;

  importChannels: (channels: Channel[]) => void;
  resetSettings: () => void;
  randomizeBackground: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      channels: [],
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
        maxStreams: 12,
        showLabels: true,
      },
      audioSettings: {
        masterVolume: 1,
        audioDucking: true,
        audioDuckingPercentage: 30,
      },
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
          channels: newOrder.map((id, index) => ({
            ...channelMap.get(id)!,
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
          maxStreams: 12,
          showLabels: true,
        },
        audioSettings: {
          masterVolume: 1,
          audioDucking: true,
          audioDuckingPercentage: 30,
        },
      }),

      randomizeBackground: () => set((_state) => {
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
        videoSettings: state.videoSettings,
        audioSettings: state.audioSettings,
        backgroundLayers: state.backgroundLayers,
        recentUrls: state.recentUrls,
      }),
    }
  )
);
