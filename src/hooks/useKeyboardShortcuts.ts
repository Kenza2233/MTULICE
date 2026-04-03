"use client";

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export const useKeyboardShortcuts = () => {
  const {
    streams,
    setFocusedStreamId,
    setSettingsOpen,
    setSidebarOpen,
    sidebarOpen,
    focusedStreamId,
    setDisplaySettings
  } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();

      // 1-9 to focus streams
      if (/^[1-9]$/.test(key)) {
        const index = parseInt(key) - 1;
        if (streams[index]) {
          setFocusedStreamId(streams[index].id);
        }
      }

      // 0 for 10th stream
      if (key === '0') {
        if (streams[9]) setFocusedStreamId(streams[9].id);
      }

      // M to mute all
      if (key === 'm') {
        const allMuted = streams.every(s => s.isMuted);
        streams.forEach(s => {
          // This should be a global action, but for now we update each
          useAppStore.getState().updateStream(s.id, { isMuted: !allMuted });
        });
      }

      // S to screenshot focused
      if (key === 's' && focusedStreamId) {
        // Trigger screenshot on focused player
        const event = new CustomEvent('player-action', { detail: { action: 'screenshot', id: focusedStreamId } });
        window.dispatchEvent(event);
      }

      // R to record focused
      if (key === 'r' && focusedStreamId) {
        const event = new CustomEvent('player-action', { detail: { action: 'record', id: focusedStreamId } });
        window.dispatchEvent(event);
      }

      // F to fullscreen focused
      if (key === 'f' && focusedStreamId) {
        const event = new CustomEvent('player-action', { detail: { action: 'fullscreen', id: focusedStreamId } });
        window.dispatchEvent(event);
      }

      // Arrow keys to navigate
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(key)) {
        const currentIndex = streams.findIndex(s => s.id === focusedStreamId);
        let nextIndex = currentIndex;
        if (key === 'arrowleft' || key === 'arrowup') nextIndex = (currentIndex - 1 + streams.length) % streams.length;
        if (key === 'arrowright' || key === 'arrowdown') nextIndex = (currentIndex + 1) % streams.length;
        if (streams[nextIndex]) setFocusedStreamId(streams[nextIndex].id);
      }

      // +/- to adjust density (fake for now, toggles layout)
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
  }, [streams, focusedStreamId, sidebarOpen, setFocusedStreamId, setSettingsOpen, setSidebarOpen, setDisplaySettings]);
};
