"use client";

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export const useKeyboardShortcuts = () => {
  const {
    channels,
    setSettingsOpen,
    setSidebarOpen,
    sidebarOpen,
    setDisplaySettings
  } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();

      // M to mute all (simulation as iframes are sandboxed, but we can toggle UI if we had local players)
      // For now, we'll keep it as a placeholder for global settings

      // +/- to adjust density
      if (key === '+' || key === '=') {
        setDisplaySettings({ gridLayout: '4x3' });
      }
      if (key === '-' || key === '_') {
        setDisplaySettings({ gridLayout: '2x2' });
      }

      // Sidebar toggle
      if (key === 'b') {
        setSidebarOpen(!sidebarOpen);
      }

      // Settings toggle
      if (key === ',') {
        setSettingsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [channels, sidebarOpen, setSettingsOpen, setSidebarOpen, setDisplaySettings]);
};
