import { create } from 'zustand';

interface BandwidthMetrics {
  totalDownloadSpeed: number; // in Mbps
  latency: number; // in ms
  lastUpdated: number;
}

interface BandwidthStore {
  metrics: BandwidthMetrics;
  qualityCap: number; // 0 to 1, where 1 is highest quality
  updateMetrics: (metrics: Partial<BandwidthMetrics>) => void;
  setQualityCap: (cap: number) => void;
}

export const useBandwidthStore = create<BandwidthStore>((set) => ({
  metrics: {
    totalDownloadSpeed: 0,
    latency: 0,
    lastUpdated: Date.now(),
  },
  qualityCap: 1.0,
  updateMetrics: (newMetrics) => set((state) => {
    const nextMetrics = { ...state.metrics, ...newMetrics, lastUpdated: Date.now() };

    // Proportional ABR logic: If total bandwidth is low, reduce quality cap
    // E.g., If < 5Mbps total and we have many streams, cap quality
    let nextCap = 1.0;
    if (nextMetrics.totalDownloadSpeed > 0 && nextMetrics.totalDownloadSpeed < 5) {
      nextCap = 0.5;
    } else if (nextMetrics.totalDownloadSpeed > 0 && nextMetrics.totalDownloadSpeed < 2) {
      nextCap = 0.2;
    }

    return {
      metrics: nextMetrics,
      qualityCap: nextCap
    };
  }),
  setQualityCap: (qualityCap) => set({ qualityCap }),
}));

export class GlobalBandwidthManager {
  private static instance: GlobalBandwidthManager;
  private intervalId: NodeJS.Timeout | null = null;
  private lastBytes: number = 0;
  private lastTimestamp: number = 0;

  private constructor() {
    this.startMonitoring();
  }

  public static getInstance(): GlobalBandwidthManager {
    if (!GlobalBandwidthManager.instance) {
      GlobalBandwidthManager.instance = new GlobalBandwidthManager();
    }
    return GlobalBandwidthManager.instance;
  }

  private startMonitoring() {
    if (typeof window === 'undefined') return;

    this.lastTimestamp = performance.now();

    // Initial latency check
    this.measureLatency();

    this.intervalId = setInterval(() => {
      this.calculateBandwidth();
      if (Math.random() > 0.8) { // Occasional latency check
        this.measureLatency();
      }
    }, 2000);
  }

  private async measureLatency() {
    try {
      const start = performance.now();
      // Use a small fetch to measure latency to a common endpoint or the origin
      await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' });
      const latency = performance.now() - start;
      useBandwidthStore.getState().updateMetrics({ latency });
    } catch (e) {
      console.error('Failed to measure latency', e);
    }
  }

  private calculateBandwidth() {
    if (typeof window === 'undefined') return;

    // In a real browser environment, we might use the Network Information API
    // if available, but it's often limited.
    // For a more accurate "real-time" per-app measurement, we'd track
    // bytes received by the video players.

    // Using Performance Resource Timing API to see how much data we've downloaded
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let totalBytes = 0;

    resources.forEach(resource => {
      // Only count media resources or things likely to be stream segments
      if (resource.name.includes('.m3u8') || resource.name.includes('.ts') || resource.name.includes('.m4s') || resource.name.includes('.mpd')) {
        totalBytes += resource.transferSize || 0;
      }
    });

    const now = performance.now();
    const duration = (now - this.lastTimestamp) / 1000; // seconds

    if (duration > 0) {
      const bytesSinceLast = totalBytes - this.lastBytes;
      if (bytesSinceLast > 0) {
        // Mbps = (Bytes * 8) / (1024 * 1024 * seconds)
        const mbps = (bytesSinceLast * 8) / (1024 * 1024 * duration);
        useBandwidthStore.getState().updateMetrics({ totalDownloadSpeed: mbps });
      }
      this.lastBytes = totalBytes;
      this.lastTimestamp = now;
    }
  }

  public stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
