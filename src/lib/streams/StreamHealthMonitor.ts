import { create } from 'zustand';

export type HealthStatus = 'live' | 'reconnecting' | 'offline';

export interface StreamHealthMetrics {
  id: string;
  status: HealthStatus;
  latency: number; // in ms
  packetLoss: number; // in percentage
  bufferLength: number; // in seconds
  currentResolution: string;
  currentBitrate: number; // in kbps
  reconnectAttempts: number;
  lastUpdated: number;
}

interface HealthStore {
  streamHealth: Record<string, StreamHealthMetrics>;
  updateHealth: (id: string, metrics: Partial<StreamHealthMetrics>) => void;
  removeStream: (id: string) => void;
}

export const useHealthStore = create<HealthStore>((set) => ({
  streamHealth: {},
  updateHealth: (id, newMetrics) => set((state) => ({
    streamHealth: {
      ...state.streamHealth,
      [id]: {
        ...(state.streamHealth[id] || {
          id,
          status: 'offline',
          latency: 0,
          packetLoss: 0,
          bufferLength: 0,
          currentResolution: '0p',
          currentBitrate: 0,
          reconnectAttempts: 0,
          lastUpdated: Date.now(),
        }),
        ...newMetrics,
        lastUpdated: Date.now(),
      },
    },
  })),
  removeStream: (id) => set((state) => {
    const { [id]: _removed, ...rest } = state.streamHealth;
    console.log(`Removing stream health for ${_removed?.id || id}`);
    return { streamHealth: rest };
  }),
}));

export class StreamHealthMonitor {
  private static instance: StreamHealthMonitor;
  private intervals: Record<string, NodeJS.Timeout> = {};

  private constructor() {}

  public static getInstance(): StreamHealthMonitor {
    if (!StreamHealthMonitor.instance) {
      StreamHealthMonitor.instance = new StreamHealthMonitor();
    }
    return StreamHealthMonitor.instance;
  }

  public startMonitoring(id: string) {
    if (this.intervals[id]) return;

    // Simulation of a more robust monitor using a tighter loop but
    // real-time data would still flow through updateHealth from the player hooks
    this.intervals[id] = setInterval(() => {
      const health = useHealthStore.getState().streamHealth[id];
      if (!health) return;

      const now = Date.now();
      // WebSocket-style heartbeat simulation: if no metrics update for 8s, mark as failing
      if (now - health.lastUpdated > 8000 && health.status === 'live') {
        useHealthStore.getState().updateHealth(id, { status: 'reconnecting' });
      }

      // If we've been reconnecting for more than 30s, mark as offline
      if (health.status === 'reconnecting' && now - health.lastUpdated > 30000) {
        useHealthStore.getState().updateHealth(id, { status: 'offline' });
      }
    }, 2000);
  }

  public stopMonitoring(id: string) {
    if (this.intervals[id]) {
      clearInterval(this.intervals[id]);
      delete this.intervals[id];
    }
  }
}
