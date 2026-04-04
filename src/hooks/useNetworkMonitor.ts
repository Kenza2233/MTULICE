"use client";

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export const useNetworkMonitor = () => {
  const { setNetworkSettings, networkSettings } = useAppStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    interface NetworkInformation extends EventTarget {
      downlink: number;
      effectiveType: string;
      onchange: ((this: NetworkInformation, ev: Event) => any) | null;
    }

    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (!connection) return;

    const updateConstraints = () => {
      const downlink = connection.downlink; // in Mbps

      let maxStreams = 12;
      if (downlink < 1.5) maxStreams = 2;
      else if (downlink < 5) maxStreams = 4;
      else if (downlink < 10) maxStreams = 6;
      else if (downlink < 20) maxStreams = 9;

      // Only update if it's a decrease or if we are in auto mode
      if (networkSettings.autoQuality) {
        setNetworkSettings({ maxStreams });
      }
    };

    updateConstraints();
    connection.addEventListener('change', updateConstraints);

    return () => {
      connection.removeEventListener('change', updateConstraints);
    };
  }, [setNetworkSettings, networkSettings.autoQuality]);
};
